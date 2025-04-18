import { AntDesign } from "@expo/vector-icons";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { ActivityIndicator, AppState, Dimensions, ScrollView, Text, TouchableOpacity, View, Alert } from "react-native";
import { RenderHTML } from "react-native-render-html";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";
import CommentModal from "../components/CommentModal";
import FloatingNavbar from "../components/FloatingNavbar";
import ChapterListModal from "../components/ChapterListModal";
import { updateReadingProgress } from "../redux/slices/bookSlice";
import {
  getChapterById,
  getReadingProgress,
  getChaptersByBookId,
  toggleLikeChapter,
  saveReadingProgress,
} from "../services/ChapterServices";
import { chapterdetailstyles } from "../style/chapterdetailstyles";

const { width } = Dimensions.get("window");

const ChapterDetailScreen = ({ route, navigation }) => {
  const { chapterId, bookId } = route.params || {};
  const [chapter, setChapter] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showNavbar, setShowNavbar] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [hasUserScrolled, setHasUserScrolled] = useState(false);
  const [isSavingProgress, setIsSavingProgress] = useState(false);

  const scrollViewRef = useRef(null);
  const initialScrollDone = useRef(false);
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const userToken = useSelector((state) => state.auth.token);
  const screenHeight = Dimensions.get("window").height;

  // Verify and normalize chapterId
  const normalizedChapterId = useCallback(() => {
    if (!chapterId) return null;

    // If chapterId is already a string or number, return it as string
    if (typeof chapterId === "string" || typeof chapterId === "number") {
      return chapterId.toString();
    }

    // If it's an object with an id property (sometimes happens with navigation params)
    if (chapterId && typeof chapterId === "object" && chapterId.id) {
      return chapterId.id.toString();
    }

    console.error("Invalid chapter ID format:", chapterId);
    return null;
  }, [chapterId]);

  // Create a debounced save function
  const debouncedSaveProgress = useCallback(
    debounce((progress) => {
      const validChapterId = normalizedChapterId();
      if (isLoggedIn && validChapterId && progress > 0) {
        console.log("Debounced saving progress:", Math.round(progress * 100));
        setIsSavingProgress(true);

        // Use the Redux action instead of direct API call
        dispatch(
          updateReadingProgress({
            chapterId: validChapterId,
            progress: Math.round(progress * 100),
          })
        )
          .unwrap()
          .then(() => {
            console.log("Progress saved successfully through Redux");
          })
          .catch((err) => console.error("Failed to save progress:", err))
          .finally(() => setIsSavingProgress(false));
      }
    }, 2000),
    [isLoggedIn, normalizedChapterId, dispatch]
  );

  // Fetch chapter and reading progress
  useEffect(() => {
    const loadChapter = async () => {
      const validChapterId = normalizedChapterId();
      if (!validChapterId) {
        setError("No valid chapter ID provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setHasUserScrolled(false); // Reset user scroll state
      initialScrollDone.current = false; // Reset scroll done flag

      try {
        console.log("Fetching chapter data for ID:", validChapterId);

        const chapterData = await getChapterById({
          token: isLoggedIn ? userToken : null,
          chapterId: validChapterId,
        });
        setChapter(chapterData);

        if (bookId) {
          const res = await getChaptersByBookId({ token: userToken, bookId });
          console.log("Fetched chapters:", res?.length || 0);
          setChapters(res || []);
        }

        if (isLoggedIn && userToken) {
          try {
            const progressData = await getReadingProgress({ chapterId: validChapterId });
            if (progressData?.progress > 0) {
              setScrollProgress(progressData.progress / 100);
            } else {
              setScrollProgress(0); // Explicitly reset if no progress
            }
          } catch (progressError) {
            console.error("Error fetching reading progress:", progressError);
            // Don't fail the whole operation if just progress fails
          }
        }
      } catch (err) {
        console.error("Error loading chapter:", err);
        setError(`Failed to load chapter: ${err.message || "Unknown error"}`);
        // Show error alert
        Alert.alert("Error Loading Chapter", "There was a problem loading the chapter. Please try again.", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadChapter();
  }, [chapterId, isLoggedIn, userToken, bookId, normalizedChapterId, navigation]);

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
    if (!loading && contentHeight > screenHeight && scrollProgress > 0 && !initialScrollDone.current && !hasUserScrolled) {
      scrollToProgress(scrollProgress);
      initialScrollDone.current = true;
    }
  }, [loading, contentHeight, scrollProgress, screenHeight, hasUserScrolled]);

  // Save progress when scroll position changes
  useEffect(() => {
    if (hasUserScrolled && scrollProgress > 0) {
      debouncedSaveProgress(scrollProgress);
    }
    return () => {
      debouncedSaveProgress.cancel();
    };
  }, [scrollProgress, hasUserScrolled, debouncedSaveProgress]);

  // Save progress when leaving or app state changes
  useEffect(() => {
    const validChapterId = normalizedChapterId();

    const forceSaveProgress = async () => {
      if (isLoggedIn && validChapterId && scrollProgress > 0) {
        console.log("Force saving progress:", Math.round(scrollProgress * 100));
        try {
          await dispatch(
            updateReadingProgress({
              chapterId: validChapterId,
              progress: Math.round(scrollProgress * 100),
            })
          ).unwrap();
          console.log("Forced progress save complete");
        } catch (err) {
          console.error("Error saving reading progress on exit:", err);
        }
      }
    };

    const unsubscribe = navigation.addListener("beforeRemove", () => {
      forceSaveProgress();
    });

    const appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state === "background" || state === "inactive") {
        forceSaveProgress();
      }
    });

    return () => {
      // Cleanup function - ensure progress is saved when component unmounts
      forceSaveProgress();
      unsubscribe();
      appStateSubscription.remove();
    };
  }, [navigation, scrollProgress, isLoggedIn, normalizedChapterId, dispatch]);

  // Create a function to save progress and navigate back
  const handleBackPress = async () => {
    const validChapterId = normalizedChapterId();
    if (isLoggedIn && validChapterId && scrollProgress > 0) {
      try {
        console.log("Saving progress before navigating back:", Math.round(scrollProgress * 100));
        await saveReadingProgress({
          chapterId: validChapterId,
          progress: Math.round(scrollProgress * 100),
        });
        dispatch(
          updateReadingProgress({
            chapterId: validChapterId,
            progress: Math.round(scrollProgress * 100),
          })
        );
      } catch (err) {
        console.error("Error saving reading progress on back press:", err);
      }
    }
    navigation.goBack();
  };

  const onContentSizeChange = (contentWidth, contentHeight) => {
    console.log("Content size changed - Width:", contentWidth, "Height:", contentHeight);
    setContentHeight(contentHeight);
  };

  // Handle scroll and progress calculation
  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollableHeight = contentSize.height - layoutMeasurement.height;
    if (scrollableHeight > 0) {
      const progress = Math.min(1, contentOffset.y / scrollableHeight);
      setScrollProgress(progress);
      setHasUserScrolled(true);
    }
  };

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

  const toggleFavourite = async () => {
    const validChapterId = normalizedChapterId();
    if (!validChapterId) return;

    try {
      const isLiked = await toggleLikeChapter(validChapterId);
      setChapter((prev) => ({ ...prev, likedByCurrentUser: isLiked }));
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
        <TouchableOpacity style={chapterdetailstyles.backButton} onPress={handleBackPress}>
          <AntDesign name="arrowleft" size={24} color="white" />
          <Text style={chapterdetailstyles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={chapterdetailstyles.topBarTitle} numberOfLines={1} ellipsizeMode="tail">
          Chapter {chapter?.chapterNum || ""}: {chapter?.title || ""}
        </Text>
        {isSavingProgress && <ActivityIndicator size="small" color="#ffffff" style={{ marginLeft: 5 }} />}
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
          onShowChapterList={() => setShowChapterModal(true)}
        />
      )}

      <CommentModal visible={showCommentModal} onClose={() => setShowCommentModal(false)} chapterId={chapterId} />
      <ChapterListModal
        visible={showChapterModal}
        onClose={() => setShowChapterModal(false)}
        chapters={chapters}
        bookId={bookId}
        navigation={navigation}
        onChapterUnlocked={(id, updatedData) => {
          setChapters((prev) => prev.map((ch) => (ch.id === id ? updatedData : ch)));
        }}
      />
    </View>
  );
};

export default ChapterDetailScreen;
