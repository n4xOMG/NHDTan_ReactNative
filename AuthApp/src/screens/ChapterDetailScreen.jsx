import { AntDesign } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, Dimensions, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { RenderHTML } from "react-native-render-html";
import { useDispatch, useSelector } from "react-redux";
import CommentModal from "../components/CommentModal";
import FloatingNavbar from "../components/FloatingNavbar";
import { updateReadingProgress } from "../redux/slices/bookSlice";
import { getChapterById, getReadingProgress, likeChapter } from "../services/ChapterServices";
import { chapterdetailstyles } from "../style/chapterdetailstyles";

const { width } = Dimensions.get("window");

const ChapterDetailScreen = ({ route, navigation }) => {
  const { chapterId } = route.params || {};
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showNavbar, setShowNavbar] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [hasUserScrolled, setHasUserScrolled] = useState(false); // Track if user has scrolled

  const scrollViewRef = useRef(null);
  const initialScrollDone = useRef(false);
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const userToken = useSelector((state) => state.auth.token);
  const screenHeight = Dimensions.get("window").height;

  // Fetch chapter and reading progress
  useEffect(() => {
    const loadChapter = async () => {
      if (!chapterId) {
        setError("No chapter ID provided");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const chapterData = await getChapterById({ token: isLoggedIn ? userToken : null, chapterId });
        setChapter(chapterData);

        if (isLoggedIn && userToken) {
          const progressData = await getReadingProgress({ token: userToken, chapterId });
          if (progressData?.progress > 0) {
            // Only set if progress is meaningful
            const initialProgress = progressData.progress / 100;
            console.log("Progress data:", progressData);
            setScrollProgress(initialProgress);
          }
        }
      } catch (err) {
        console.error("Error loading chapter:", err);
        setError("Failed to load chapter");
      } finally {
        setLoading(false);
      }
    };
    loadChapter();
  }, [chapterId, isLoggedIn, userToken]);

  // Auto-scroll when content height and progress are ready
  useEffect(() => {
    console.log(
      "Auto-scroll check - Loading:",
      loading,
      "Content Height:",
      contentHeight,
      "Scroll Progress:",
      scrollProgress,
      "Initial Scroll Done:",
      initialScrollDone.current,
      "Has User Scrolled:",
      hasUserScrolled
    );
    // Only scroll if content height exceeds screen height, progress is set from API, and user hasn’t scrolled
    if (!loading && contentHeight > screenHeight && scrollProgress > 0 && !initialScrollDone.current && !hasUserScrolled) {
      scrollToProgress(scrollProgress);
      initialScrollDone.current = true;
    }
  }, [loading, contentHeight, scrollProgress, screenHeight, hasUserScrolled]);

  // Handle scroll and progress calculation
  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollableHeight = contentSize.height - layoutMeasurement.height;
    if (scrollableHeight > 0) {
      const progress = Math.min(1, contentOffset.y / scrollableHeight);
      setScrollProgress(progress);
      setHasUserScrolled(true); // Mark that user has scrolled
    }
  };

  // Save progress when leaving or app state changes
  useEffect(() => {
    const saveOnExit = () => {
      if (isLoggedIn && chapterId) {
        dispatch(updateReadingProgress({ chapterId, progress: Math.round(scrollProgress * 100) }));
      }
    };

    const unsubscribe = navigation.addListener("beforeRemove", saveOnExit);
    const appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state === "background" || state === "inactive") saveOnExit();
    });

    return () => {
      unsubscribe();
      appStateSubscription.remove();
    };
  }, [navigation, scrollProgress, isLoggedIn, chapterId, dispatch]);

  // Scroll to a specific progress point
  const scrollToProgress = (progress) => {
    if (scrollViewRef.current && contentHeight > 0) {
      const scrollableHeight = contentHeight - screenHeight;
      if (scrollableHeight > 0) {
        const scrollPosition = scrollableHeight * progress;
        console.log(
          "Scrolling to:",
          scrollPosition,
          "Progress:",
          progress,
          "Content Height:",
          contentHeight,
          "Screen Height:",
          screenHeight
        );
        setTimeout(() => {
          scrollViewRef.current.scrollTo({ y: scrollPosition, animated: true });
        }, 500);
      } else {
        console.log("Scrollable height is 0 or negative:", scrollableHeight);
      }
    } else {
      console.log("ScrollView ref or content height not ready:", { scrollViewRef: !!scrollViewRef.current, contentHeight });
    }
  };

  const onContentSizeChange = (contentWidth, contentHeight) => {
    console.log("Content size changed - Width:", contentWidth, "Height:", contentHeight);
    setContentHeight(contentHeight);
  };

  const toggleFavourite = async () => {
    try {
      const isLiked = await likeChapter(chapterId);
      setChapter((prev) => ({ ...prev, isLikedByCurrentUser: isLiked }));
    } catch (err) {
      console.error("Error liking chapter:", err);
    }
  };

  const renderContent = () => {
    if (loading) return <ActivityIndicator size="large" color="#3498db" />;
    if (error) return <Text style={chapterdetailstyles.errorText}>{error}</Text>;
    return (
      <TouchableOpacity onPress={() => setShowNavbar(!showNavbar)} activeOpacity={1}>
        <RenderHTML
          source={{ html: chapter?.content || "" }}
          contentWidth={width - 30}
          tagsStyles={{ p: { fontSize: 16, lineHeight: 24, color: "#333", marginBottom: 10 } }}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={chapterdetailstyles.container}>
      <View style={chapterdetailstyles.topBar}>
        <TouchableOpacity style={chapterdetailstyles.backButton} onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={24} color="white" />
          <Text style={chapterdetailstyles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={chapterdetailstyles.topBarTitle}>
          Chapter {chapter?.chapterNum || ""}: {chapter?.title || ""}
        </Text>
        <TouchableOpacity onPress={() => scrollToProgress(scrollProgress)}>
          <Text style={{ color: "white", marginRight: 10 }}>Scroll to Last Progress</Text>
        </TouchableOpacity>
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

      {showNavbar && (
        <FloatingNavbar
          navigation={navigation}
          scrollProgress={scrollProgress}
          chapter={chapter}
          onToggleFavourite={toggleFavourite}
          onShowComments={() => setShowCommentModal(true)}
          onShowChapterList={() => navigation.navigate("ChapterList", { bookId: chapter?.bookId })}
        />
      )}

      <CommentModal visible={showCommentModal} onClose={() => setShowCommentModal(false)} chapterId={chapterId} />
    </View>
  );
};

export default ChapterDetailScreen;
