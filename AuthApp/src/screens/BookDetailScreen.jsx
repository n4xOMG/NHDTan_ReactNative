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
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import ChapterList from "../components/ChapterList";
import CommentsList from "../components/CommentList";
import { fetchReadingProgressByBookId } from "../redux/slices/bookSlice";
import { shareBook } from "../redux/slices/postSlice";
import { getBookById, getUserFavStatus, toggleUserFavStatus } from "../services/BookServices";
import { getChaptersByBookId } from "../services/ChapterServices";
import { reportBook } from "../services/ReportServices";
import { bookdetailstyles } from "../style/bookdetailstyles";

// Custom ProgressBar Component
const ProgressBar = ({ progress, color, style, height, borderRadius, unfilledColor }) => {
  return (
    <View style={[{ height: height || 10, borderRadius: borderRadius || 4, backgroundColor: unfilledColor || "#e0e0e0" }, style]}>
      <View
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          backgroundColor: color || "#3498db",
          borderRadius: borderRadius || 4,
        }}
      />
    </View>
  );
};

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

  // Share and report functionality
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [shareComment, setShareComment] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

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
      if (!uiState.loading) {
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
    if (!isLoggedIn) {
      Alert.alert("Login Required", "Please login to add books to favorites.");
      return;
    }

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

  // Calculate reading progress
  const calculateOverallProgress = (progressData, chaptersData) => {
    if (!progressData?.length || !chaptersData?.length) {
      setOverallProgress(0);
      return;
    }

    // Count unlocked chapters
    const unlockedChapters = chaptersData.filter((chapter) => chapter.unlockedByUser || chapter.price === 0);

    if (unlockedChapters.length === 0) {
      setOverallProgress(0);
      return;
    }

    let completedProgress = 0;
    let totalProgress = unlockedChapters.length * 100;

    unlockedChapters.forEach((chapter) => {
      const chapterProgress = progressData.find((progress) => progress.chapterId === chapter.id);
      completedProgress += chapterProgress ? chapterProgress.progress : 0;
    });

    setOverallProgress(Math.min(100, (completedProgress / totalProgress) * 100));
  };

  // Handle chapter unlocked event
  const handleChapterUnlocked = useCallback((chapterId) => {
    setBookData((prev) => ({
      ...prev,
      chapters: prev.chapters.map((chapter) => (chapter.id === chapterId ? { ...chapter, unlockedByUser: true } : chapter)),
    }));
  }, []);

  // Function to share book as post
  const handleShareBook = async () => {
    if (!isLoggedIn) {
      Alert.alert("Login Required", "Please login to share books.");
      setShowShareModal(false);
      return;
    }

    if (!bookId) return;

    setIsSharing(true);
    try {
      await dispatch(
        shareBook({
          bookId,
          postData: {
            content: shareComment,
            postType: "BOOK_SHARE",
          },
        })
      ).unwrap();

      setShowShareModal(false);
      setShareComment("");
      Alert.alert("Success", "Book shared successfully!");
    } catch (err) {
      console.error("Error sharing book:", err);
      Alert.alert("Error", "Failed to share book. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  // Function to report book
  const handleReportBook = async () => {
    if (!isLoggedIn) {
      Alert.alert("Login Required", "Please login to report books.");
      setShowReportModal(false);
      return;
    }

    if (!reportReason.trim()) {
      Alert.alert("Error", "Please provide a reason for your report.");
      return;
    }

    setIsReporting(true);
    try {
      await reportBook({
        bookId,
        reason: reportReason,
      });

      setShowReportModal(false);
      setReportReason("");
      Alert.alert("Report Submitted", "Thank you for your report. We will review it shortly.");
    } catch (err) {
      console.error("Error reporting book:", err);
      Alert.alert("Error", "Failed to submit report. Please try again.");
    } finally {
      setIsReporting(false);
    }
  };

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

              {/* Action buttons */}
              <View style={bookdetailstyles.actionButtonsContainer}>
                <TouchableOpacity style={bookdetailstyles.actionButton} onPress={handleFavorite} activeOpacity={0.7}>
                  <AntDesign name={bookData.isFav ? "heart" : "hearto"} size={22} color={bookData.isFav ? "#e74c3c" : "#999"} />
                </TouchableOpacity>

                <TouchableOpacity style={bookdetailstyles.actionButton} onPress={() => setShowShareModal(true)} activeOpacity={0.7}>
                  <AntDesign name="sharealt" size={22} color="#3498db" />
                </TouchableOpacity>

                <TouchableOpacity style={bookdetailstyles.actionButton} onPress={() => setShowReportModal(true)} activeOpacity={0.7}>
                  <MaterialIcons name="report-problem" size={22} color="#ff9800" />
                </TouchableOpacity>
              </View>
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

        {/* Share Book Modal */}
        <Modal visible={showShareModal} transparent={true} animationType="slide" onRequestClose={() => setShowShareModal(false)}>
          <View style={bookdetailstyles.modalContainer}>
            <View style={bookdetailstyles.modalContent}>
              <View style={bookdetailstyles.modalHeader}>
                <Text style={bookdetailstyles.modalTitle}>Share Book</Text>
                <TouchableOpacity onPress={() => setShowShareModal(false)}>
                  <AntDesign name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <View style={bookdetailstyles.bookInfoContainer}>
                <Image source={{ uri: bookData.book?.bookCover }} style={bookdetailstyles.modalBookCover} resizeMode="cover" />
                <View style={bookdetailstyles.modalBookDetails}>
                  <Text style={bookdetailstyles.modalBookTitle} numberOfLines={2}>
                    {bookData.book?.title}
                  </Text>
                  <Text style={bookdetailstyles.modalBookAuthor} numberOfLines={1}>
                    by {bookData.book?.authorName || bookData.book?.author?.name}
                  </Text>
                </View>
              </View>

              <TextInput
                style={bookdetailstyles.modalInput}
                placeholder="Add a comment about this book..."
                value={shareComment}
                onChangeText={setShareComment}
                multiline
                maxLength={500}
              />

              <View style={bookdetailstyles.modalActions}>
                <TouchableOpacity
                  style={[bookdetailstyles.primaryButton, isSharing && bookdetailstyles.disabledButton]}
                  onPress={handleShareBook}
                  disabled={isSharing}
                >
                  {isSharing ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <AntDesign name="sharealt" size={18} color="#fff" />
                      <Text style={bookdetailstyles.primaryButtonText}>Share</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={bookdetailstyles.secondaryButton} onPress={() => setShowShareModal(false)} disabled={isSharing}>
                  <Text style={bookdetailstyles.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Report Book Modal */}
        <Modal visible={showReportModal} transparent={true} animationType="slide" onRequestClose={() => setShowReportModal(false)}>
          <View style={bookdetailstyles.modalContainer}>
            <View style={bookdetailstyles.modalContent}>
              <View style={bookdetailstyles.modalHeader}>
                <Text style={bookdetailstyles.modalTitle}>Report Book</Text>
                <TouchableOpacity onPress={() => setShowReportModal(false)}>
                  <AntDesign name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <View style={bookdetailstyles.bookInfoContainer}>
                <Image source={{ uri: bookData.book?.bookCover }} style={bookdetailstyles.modalBookCover} resizeMode="cover" />
                <View style={bookdetailstyles.modalBookDetails}>
                  <Text style={bookdetailstyles.modalBookTitle} numberOfLines={2}>
                    {bookData.book?.title}
                  </Text>
                  <Text style={bookdetailstyles.modalBookAuthor} numberOfLines={1}>
                    by {bookData.book?.authorName || bookData.book?.author?.name}
                  </Text>
                </View>
              </View>

              <Text style={bookdetailstyles.instructionText}>Please describe why you're reporting this book:</Text>
              <TextInput
                style={bookdetailstyles.modalInput}
                placeholder="Enter reason for reporting..."
                value={reportReason}
                onChangeText={setReportReason}
                multiline
                maxLength={500}
              />

              <View style={bookdetailstyles.modalActions}>
                <TouchableOpacity
                  style={[bookdetailstyles.reportButton, isReporting && bookdetailstyles.disabledButton]}
                  onPress={handleReportBook}
                  disabled={isReporting}
                >
                  {isReporting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <MaterialIcons name="report-problem" size={18} color="#fff" />
                      <Text style={bookdetailstyles.primaryButtonText}>Submit Report</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={bookdetailstyles.secondaryButton} onPress={() => setShowReportModal(false)} disabled={isReporting}>
                  <Text style={bookdetailstyles.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Updated styles for the component
bookdetailstyles.actionButtonsContainer = {
  flexDirection: "row",
  justifyContent: "flex-start",
  marginTop: 10,
};

bookdetailstyles.actionButton = {
  padding: 10,
  marginRight: 15,
  borderRadius: 20,
};

bookdetailstyles.modalContainer = {
  flex: 1,
  justifyContent: "flex-end",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
};

bookdetailstyles.modalContent = {
  backgroundColor: "white",
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  padding: 20,
  minHeight: 350,
};

bookdetailstyles.modalHeader = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 15,
};

bookdetailstyles.modalTitle = {
  fontSize: 18,
  fontWeight: "bold",
  color: "#333",
};

bookdetailstyles.bookInfoContainer = {
  flexDirection: "row",
  backgroundColor: "#f5f5f5",
  borderRadius: 10,
  padding: 12,
  marginBottom: 15,
};

bookdetailstyles.modalBookCover = {
  width: 60,
  height: 90,
  borderRadius: 6,
};

bookdetailstyles.modalBookDetails = {
  flex: 1,
  marginLeft: 12,
  justifyContent: "center",
};

bookdetailstyles.modalBookTitle = {
  fontSize: 16,
  fontWeight: "bold",
  color: "#333",
  marginBottom: 4,
};

bookdetailstyles.modalBookAuthor = {
  fontSize: 14,
  color: "#666",
};

bookdetailstyles.instructionText = {
  fontSize: 14,
  color: "#555",
  marginBottom: 8,
};

bookdetailstyles.modalInput = {
  borderWidth: 1,
  borderColor: "#ddd",
  borderRadius: 10,
  padding: 15,
  minHeight: 120,
  textAlignVertical: "top",
  fontSize: 16,
  backgroundColor: "#f9f9f9",
};

bookdetailstyles.modalActions = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 20,
};

bookdetailstyles.primaryButton = {
  backgroundColor: "#3498db",
  padding: 12,
  borderRadius: 10,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
  marginRight: 10,
};

bookdetailstyles.reportButton = {
  backgroundColor: "#ff9800",
  padding: 12,
  borderRadius: 10,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
  marginRight: 10,
};

bookdetailstyles.disabledButton = {
  opacity: 0.7,
};

bookdetailstyles.primaryButtonText = {
  color: "white",
  fontWeight: "bold",
  marginLeft: 8,
  fontSize: 16,
};

bookdetailstyles.secondaryButton = {
  padding: 12,
  borderRadius: 10,
  flex: 0.7,
  borderWidth: 1,
  borderColor: "#ddd",
  alignItems: "center",
  justifyContent: "center",
};

bookdetailstyles.secondaryButtonText = {
  color: "#555",
  fontSize: 16,
};
