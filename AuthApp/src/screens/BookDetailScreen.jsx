import { AntDesign } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from "react-native";
import ProgressBar from "react-native-progress/Bar";
import { useDispatch, useSelector } from "react-redux";
import ChapterList from "../components/ChapterList";
import CommentsList from "../components/CommentList";
import { fetchReadingProgressByBookId } from "../redux/slices/bookSlice";
import { addBookComment } from "../redux/slices/commentSlice";
import { getUserFavStatus, toggleUserFavStatus } from "../services/BookServices";
import { getChaptersByBookId } from "../services/ChapterServices";
import { bookdetailstyles } from "../style/bookdetailstyles";

export default function BookDetail({ route, navigation }) {
  const { book } = route.params;
  const [isFav, setIsFav] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);

  const dispatch = useDispatch();
  const readingProgress = useSelector((state) => state.books.readingProgress);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const userToken = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (!book) return;

    const fetchFavStatus = async () => {
      try {
        const res = await getUserFavStatus({ bookId: book.id });
        setIsFav(res);
      } catch (error) {
        console.error("Error fetching book liked status", error);
      }
    };

    const fetchData = async () => {
      setLoading(true);
      try {
        let chaptersResponse;
        if (isLoggedIn && userToken) {
          chaptersResponse = await getChaptersByBookId({ token: userToken, bookId: book.id });
        } else {
          chaptersResponse = await getChaptersByBookId({ token: null, bookId: book.id });
        }
        const progressResult = await dispatch(fetchReadingProgressByBookId({ bookId: book.id })).unwrap();

        setChapters(chaptersResponse);
        calculateOverallProgress(progressResult, chaptersResponse);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavStatus();
    fetchData();
  }, [book, dispatch, isLoggedIn, userToken]);

  useEffect(() => {
    if (chapters.length > 0 && readingProgress && readingProgress.length > 0) {
      calculateOverallProgress(readingProgress, chapters);
    }
  }, [readingProgress, chapters]);

  const handleFavorite = async () => {
    try {
      const res = await toggleUserFavStatus({ bookId: book?.id });
      setIsFav(res);
    } catch (error) {
      console.error("Error marking book as favoured", error);
    }
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const truncatedDescription = book.description?.length > 100 ? book.description.substring(0, 100) + "..." : book.description;

  const calculateOverallProgress = (progressData, chaptersData = chapters) => {
    if (!progressData || progressData.length === 0 || chaptersData.length === 0) {
      setOverallProgress(0);
      return;
    }
    const totalProgress = progressData.reduce((sum, progress) => sum + (progress.progress || 0), 0);
    const averageProgress = totalProgress / chaptersData.length;
    setOverallProgress(averageProgress);
  };

  const handleChapterUnlocked = (chapterId, updatedChapter) => {
    setChapters((prevChapters) =>
      prevChapters.map((chapter) => (chapter.id === chapterId ? { ...chapter, unlockedByUser: true } : chapter))
    );
  };

  const renderHeader = () => (
    <>
      <View style={bookdetailstyles.topBar}>
        <TouchableOpacity style={bookdetailstyles.backButton} onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={24} color="white" />
          <Text style={bookdetailstyles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={bookdetailstyles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : (
        <View style={bookdetailstyles.contentContainer}>
          <View style={bookdetailstyles.card}>
            <Image source={{ uri: book.bookCover }} style={bookdetailstyles.bookCover} />
            <View style={bookdetailstyles.details}>
              <Text style={bookdetailstyles.title}>{book.title}</Text>
              <Text style={bookdetailstyles.author}>by {book.authorName || book.author?.name}</Text>
              <Text style={bookdetailstyles.category}>Category: {book.categoryName}</Text>
              <View>
                <Text style={bookdetailstyles.description}>{showFullDescription ? book.description : truncatedDescription}</Text>
                {book.description?.length > 100 && (
                  <TouchableOpacity onPress={toggleDescription} style={bookdetailstyles.readMoreButton}>
                    <Text style={bookdetailstyles.readMoreText}>{showFullDescription ? "Show less" : "Read more"}</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity style={bookdetailstyles.favoriteButton} onPress={handleFavorite}>
                <AntDesign name={isFav ? "heart" : "hearto"} size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Overall Progress Bar */}
          <View style={bookdetailstyles.progressContainer}>
            <Text style={bookdetailstyles.progressTitle}>Reading Progress</Text>
            <ProgressBar progress={overallProgress / 100} color="#2196F3" width={null} style={bookdetailstyles.progressBar} height={10} />
            <Text style={bookdetailstyles.progressText}>{Math.round(overallProgress)}% Complete</Text>
          </View>

          {/* Chapter List Component */}
          {chapters.length > 0 && (
            <View style={bookdetailstyles.chapterListContainer}>
              <ChapterList chapters={chapters} navigation={navigation} onChapterUnlocked={handleChapterUnlocked} />
            </View>
          )}
        </View>
      )}
    </>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <FlatList
        data={[]} // Empty since comments are rendered in the header and below.
        ListHeaderComponent={
          <>
            {renderHeader()}
            {!loading && <CommentsList bookId={book.id} />}
          </>
        }
        style={bookdetailstyles.commentSection}
      />
    </KeyboardAvoidingView>
  );
}
