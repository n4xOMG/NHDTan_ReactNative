import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import ProgressBar from "react-native-progress/Bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import ChapterList from "../components/ChapterList";
import CommentsList from "../components/CommentList";
import { fetchReadingProgressByBookId } from "../redux/slices/bookSlice";
import { getBookById, getUserFavStatus, toggleUserFavStatus } from "../services/BookServices";
import { getChaptersByBookId } from "../services/ChapterServices";
import { bookdetailstyles } from "../style/bookdetailstyles";

export default function BookDetail({ route, navigation }) {
  const { bookId } = route.params;
  const [bookData, setBookData] = useState({
    book: null,
    isFav: false,
    chapters: [],
  });
  const [uiState, setUiState] = useState({
    loading: true,
    refreshing: false,
    showFullDescription: false,
    error: null,
  });
  const [overallProgress, setOverallProgress] = useState(0);

  const { width } = useWindowDimensions();
  const dispatch = useDispatch();
  const readingProgress = useSelector((state) => state.books.readingProgress);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const userToken = useSelector((state) => state.auth.token);

  // Calculate if description needs a "read more" button
  const shouldShowReadMore = useMemo(() => {
    return bookData.book?.description?.length > 100;
  }, [bookData.book?.description]);

  // Generate truncated description
  const truncatedDescription = useMemo(() => {
    if (!bookData.book?.description) return "";
    return shouldShowReadMore ? bookData.book.description.substring(0, 100) + "..." : bookData.book.description;
  }, [bookData.book?.description, shouldShowReadMore]);

  // Fetch all required data
  const fetchAllData = useCallback(
    async (isRefreshing = false) => {
      if (!bookId) return;

      if (!isRefreshing) {
        setUiState((prev) => ({ ...prev, loading: true, error: null }));
      }

      try {
        // Parallel data fetching for better performance
        const [bookResult, favResult, chaptersResponse] = await Promise.all([
          getBookById({ bookId }),
          getUserFavStatus({ bookId }),
          getChaptersByBookId({
            token: isLoggedIn && userToken ? userToken : null,
            bookId,
          }),
        ]);

        // Get reading progress
        const progressResult = await dispatch(fetchReadingProgressByBookId({ bookId })).unwrap();

        // Update state with all retrieved data
        setBookData({
          book: bookResult,
          isFav: favResult,
          chapters: chaptersResponse || [],
        });

        // Calculate progress
        calculateOverallProgress(progressResult, chaptersResponse);
      } catch (error) {
        console.error("Error fetching book data:", error);
        setUiState((prev) => ({ ...prev, error: "Failed to load book data. Pull down to refresh." }));
      } finally {
        setUiState((prev) => ({ ...prev, loading: false, refreshing: false }));
      }
    },
    [bookId, dispatch, isLoggedIn, userToken]
  );

  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    setUiState((prev) => ({ ...prev, refreshing: true }));
    fetchAllData(true);
  }, [fetchAllData]);

  // Initial data loading
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Only refetch data when returning to this screen, not on initial render
      if (!uiState.loading) {
        // Get latest reading progress
        dispatch(fetchReadingProgressByBookId({ bookId }));
      }
    }, [dispatch, bookId, uiState.loading])
  );

  // Recalculate progress when reading progress or chapters change
  useEffect(() => {
    if (bookData.chapters.length > 0 && readingProgress?.length > 0) {
      calculateOverallProgress(readingProgress, bookData.chapters);
    }
  }, [readingProgress, bookData.chapters]);

  // Toggle favorite status
  const handleFavorite = async () => {
    try {
      const res = await toggleUserFavStatus({ bookId });
      setBookData((prev) => ({ ...prev, isFav: res }));
    } catch (error) {
      console.error("Error changing favorite status:", error);
    }
  };

  // Toggle description expansion
  const toggleDescription = () => {
    setUiState((prev) => ({
      ...prev,
      showFullDescription: !prev.showFullDescription,
    }));
  };

  // Calculate reading progress - IMPROVED CALCULATION
  const calculateOverallProgress = (progressData, chaptersData) => {
    if (!progressData?.length || !chaptersData?.length) {
      setOverallProgress(0);
      return;
    }

    // Count the total number of unlocked chapters
    const unlockedChapters = chaptersData.filter((chapter) => chapter.unlockedByUser || chapter.price === 0);

    if (unlockedChapters.length === 0) {
      setOverallProgress(0);
      return;
    }

    // Calculate progress only from chapters that have been unlocked
    let completedProgress = 0;
    let totalProgress = 0;

    unlockedChapters.forEach((chapter) => {
      // Find progress for this chapter
      const chapterProgress = progressData.find((progress) => progress.chapterId === chapter.id);

      // Add the progress (default to 0 if not found)
      completedProgress += chapterProgress ? chapterProgress.progress : 0;
      totalProgress += 100; // Each chapter is worth 100%
    });

    // Calculate overall percentage
    const calculatedProgress = totalProgress > 0 ? (completedProgress / totalProgress) * 100 : 0;

    // Ensure progress is between 0-100
    setOverallProgress(Math.min(100, Math.max(0, calculatedProgress)));
  };

  // Handle chapter unlocked event
  const handleChapterUnlocked = useCallback((chapterId) => {
    setBookData((prev) => ({
      ...prev,
      chapters: prev.chapters.map((chapter) => (chapter.id === chapterId ? { ...chapter, unlockedByUser: true } : chapter)),
    }));
  }, []);

  const renderHeader = () => (
    <>
      {/* Status bar with proper color */}
      <StatusBar backgroundColor="#2c3e50" barStyle="light-content" />

      {/* Header with back button */}
      <View style={bookdetailstyles.topBar}>
        <TouchableOpacity
          style={bookdetailstyles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={bookdetailstyles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Loading or error state */}
      {uiState.loading ? (
        <View style={bookdetailstyles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={bookdetailstyles.loadingText}>Loading book details...</Text>
        </View>
      ) : uiState.error ? (
        <View style={bookdetailstyles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#e74c3c" />
          <Text style={bookdetailstyles.errorText}>{uiState.error}</Text>
        </View>
      ) : (
        // Book content when loaded successfully
        <View style={bookdetailstyles.contentContainer}>
          {/* Book card with cover and details */}
          <View style={bookdetailstyles.card}>
            <Image
              source={{ uri: bookData.book?.bookCover }}
              style={[bookdetailstyles.bookCover, { width: width * 0.25 }]}
              resizeMode="cover"
            />
            <View style={bookdetailstyles.details}>
              <Text style={bookdetailstyles.title}>{bookData.book?.title}</Text>
              <Text style={bookdetailstyles.author}>by {bookData.book?.authorName || bookData.book?.author?.name}</Text>
              <Text style={bookdetailstyles.category}>
                <MaterialIcons name="category" size={14} color="#777" /> {bookData.book?.categoryName || "Unknown"}
              </Text>

              {/* Description with toggle */}
              <View style={bookdetailstyles.descriptionContainer}>
                <Text style={bookdetailstyles.description}>
                  {uiState.showFullDescription ? bookData.book?.description : truncatedDescription}
                </Text>
                {shouldShowReadMore && (
                  <TouchableOpacity onPress={toggleDescription} style={bookdetailstyles.readMoreButton} activeOpacity={0.7}>
                    <Text style={bookdetailstyles.readMoreText}>{uiState.showFullDescription ? "Show less" : "Read more"}</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Favorite button */}
              <TouchableOpacity style={bookdetailstyles.favoriteButton} onPress={handleFavorite} activeOpacity={0.7}>
                <AntDesign name={bookData.isFav ? "heart" : "hearto"} size={24} color={bookData.isFav ? "#e74c3c" : "#999"} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Reading progress section */}
          <View style={bookdetailstyles.progressContainer}>
            <View style={bookdetailstyles.sectionHeader}>
              <MaterialIcons name="trending-up" size={18} color="#3498db" />
              <Text style={bookdetailstyles.progressTitle}>Reading Progress</Text>
            </View>
            <ProgressBar
              progress={overallProgress / 100}
              color="#3498db"
              width={null}
              style={bookdetailstyles.progressBar}
              height={8}
              borderRadius={4}
              unfilledColor="#e0e0e0"
            />
            <Text style={bookdetailstyles.progressText}>{Math.round(overallProgress)}% Complete</Text>
          </View>

          {/* Chapters list */}
          {bookData.chapters.length > 0 && (
            <View style={bookdetailstyles.chapterListContainer}>
              <View style={bookdetailstyles.sectionHeader}>
                <MaterialIcons name="menu-book" size={18} color="#3498db" />
                <Text style={bookdetailstyles.sectionTitle}>Chapters</Text>
              </View>
              <ChapterList chapters={bookData.chapters} navigation={navigation} onChapterUnlocked={handleChapterUnlocked} bookId={bookId} />
            </View>
          )}
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView style={bookdetailstyles.container} edges={["right", "left", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : null}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <FlatList
          data={[]} // Empty since using header for content
          ListHeaderComponent={renderHeader}
          ListFooterComponent={
            !uiState.loading &&
            bookData.book && (
              <>
                <View style={bookdetailstyles.sectionHeader}>
                  <MaterialIcons name="chat" size={18} color="#3498db" />
                  <Text style={bookdetailstyles.sectionTitle}>Comments</Text>
                </View>
                <CommentsList bookId={bookId} />
              </>
            )
          }
          style={bookdetailstyles.container}
          contentContainerStyle={bookdetailstyles.listContentContainer}
          refreshControl={
            <RefreshControl refreshing={uiState.refreshing} onRefresh={handleRefresh} colors={["#3498db"]} tintColor="#3498db" />
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
