import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Dimensions, Image, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { RenderHTML } from "react-native-render-html";
import { useDispatch, useSelector } from "react-redux";
import { updateReadingProgress } from "../redux/slices/bookSlice";
import { getChapterById, likeChapter } from "../services/ChapterServices";
import { chapterdetailstyles } from "../style/chapterdetailstyles";
import FloatingNavbar from "../components/FloatingNavbar";
import CommentModal from "../components/CommentModal";

const { width, height } = Dimensions.get("window");
const ChapterDetailScreen = ({ route, navigation }) => {
  const { chapterId } = route.params || {};
  const [scrollProgress, setScrollProgress] = useState(0);
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollViewRef = useRef(null);
  const contentHeightRef = useRef(0);
  const [showNavbar, setShowNavbar] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);

  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const userToken = useSelector((state) => state.auth.token);

  const saveProgress = useCallback(
    (progress = scrollProgress) => {
      if (!isLoggedIn || !chapterId) return;
      dispatch(updateReadingProgress({ chapterId, progress: Math.round(progress * 100) }));
    },
    [chapterId, isLoggedIn, dispatch, scrollProgress]
  );

  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollableHeight = contentSize.height - layoutMeasurement.height;
    if (scrollableHeight > 0) {
      const progress = Math.min(1, Math.max(0, contentOffset.y / scrollableHeight));
      setScrollProgress(progress);
    }
  };

  const onContentSizeChange = (contentWidth, contentHeight) => {
    contentHeightRef.current = contentHeight;
  };

  useEffect(() => {
    const fetchChapter = async () => {
      if (!chapterId) {
        setError("No chapter ID provided");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response =
          isLoggedIn && userToken
            ? await getChapterById({ token: userToken, chapterId })
            : await getChapterById({ token: null, chapterId });
        setChapter(response);
        setError(null);
      } catch (err) {
        setError("Failed to load chapter");
      } finally {
        setLoading(false);
      }
    };
    fetchChapter();
  }, [chapterId, isLoggedIn, userToken]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      saveProgress(scrollProgress);
    });
    return unsubscribe;
  }, [navigation, scrollProgress, saveProgress]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        saveProgress(scrollProgress);
      }
    });
    return () => subscription.remove();
  }, [scrollProgress, saveProgress]);

  const renderContent = () => {
    if (loading) return <Text style={chapterdetailstyles.loadingText}>Loading...</Text>;
    if (error) return <Text style={chapterdetailstyles.errorText}>{error}</Text>;
    const htmlContent = chapter?.content || "";
    return (
      // Tap content to toggle navbar visibility
      <Pressable onPress={() => setShowNavbar((prev) => !prev)}>
        <RenderHTML
          source={{ html: htmlContent }}
          contentWidth={width - 30}
          tagsStyles={{ p: { fontSize: 16, lineHeight: 24, color: "#333", marginBottom: 10 } }}
          renderersProps={{ defaultTextProps: { selectable: true } }}
        />
      </Pressable>
    );
  };

  const handleToggleFavourite = async () => {
    try {
      const isLiked = await likeChapter(chapterId);
      // Update chapter state with new like value:
      setChapter((prev) => ({ ...prev, isLikedByCurrentUser: isLiked }));
    } catch (err) {
      console.error("Error liking chapter:", err);
    }
  };

  return (
    <View style={chapterdetailstyles.container}>
      <View style={chapterdetailstyles.topBar}>
        <View style={chapterdetailstyles.backButton}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntDesign name="arrowleft" size={24} color="white" />
          </TouchableOpacity>
          <Text style={chapterdetailstyles.backText}>Back</Text>
        </View>
        <Text style={chapterdetailstyles.topBarTitle}>
          Chapter {chapter?.chapterNum || ""}: {chapter?.title || ""}
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={chapterdetailstyles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onContentSizeChange={onContentSizeChange}
      >
        <View style={chapterdetailstyles.contentContainer}>{renderContent()}</View>
      </ScrollView>

      {/* Floating navbar component */}
      {showNavbar && (
        <FloatingNavbar
          navigation={navigation}
          scrollProgress={scrollProgress}
          chapter={chapter}
          onToggleFavourite={handleToggleFavourite}
          onShowComments={() => setShowCommentModal(true)}
          onShowChapterList={() => navigation.navigate("ChapterList", { bookId: chapter?.bookId })}
        />
      )}

      {/* Comment modal (overlaid) */}
      <CommentModal visible={showCommentModal} onClose={() => setShowCommentModal(false)} chapterId={chapterId} />
    </View>
  );
};

export default ChapterDetailScreen;
