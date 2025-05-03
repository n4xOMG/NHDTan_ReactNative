import React, { useEffect, useState, useRef, useCallback, memo, useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addComment, fetchComments, resetComments } from "../redux/slices/commentSlice";
import { commentstyles } from "../style/commentstyles";
import CommentItem from "./CommentItem";

const CommentsList = ({ bookId, chapterId, postId, ListHeaderComponent, inputAtBottom = false, isNested = false }) => {
  const dispatch = useDispatch();
  const [commentText, setCommentText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);
  const commentTextRef = useRef(commentText);

  // Update ref when state changes
  useEffect(() => {
    commentTextRef.current = commentText;
  }, [commentText]);

  const determineCommentType = useCallback(() => {
    if (bookId) return "book";
    if (chapterId) return "chapter";
    if (postId) return "post";
    return "book";
  }, [bookId, chapterId, postId]);

  const commentType = useMemo(() => determineCommentType(), [determineCommentType]);
  const id = useMemo(() => bookId || chapterId || postId, [bookId, chapterId, postId]);

  // Use custom equality to prevent re-renders
  const commentState = useSelector(
    (state) => state.comments[commentType],
    (prev, next) =>
      prev?.comments === next?.comments &&
      prev?.page === next?.page &&
      prev?.totalPages === next?.totalPages &&
      prev?.loading === next?.loading &&
      prev?.error === next?.error
  );

  const { comments = [], page = 0, totalPages = 0, loading = false, error = null } = commentState || {};

  useEffect(() => {
    if (id) {
      dispatch(resetComments({ type: commentType }));
      dispatch(fetchComments({ type: commentType, id, page: 0 }));
    }
  }, [id, commentType, dispatch]);

  const loadMore = useCallback(() => {
    if (!loading && page < totalPages) {
      dispatch(fetchComments({ type: commentType, id, page }));
    }
  }, [loading, page, totalPages, commentType, id, dispatch]);

  const handleSubmit = useCallback(() => {
    if (commentText.trim()) {
      dispatch(addComment({ type: commentType, id, data: { content: commentText } }));
      setCommentText("");
      Keyboard.dismiss();
    }
  }, [commentText, commentType, id, dispatch]);

  // Handle keyboard and focus
  useEffect(() => {
    const keyboardDidHide = Keyboard.addListener("keyboardDidHide", () => {
      if (inputRef.current?.isFocused()) {
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    });

    return () => {
      keyboardDidHide.remove();
    };
  }, []);

  const handleChangeText = useCallback((text) => {
    setCommentText(text);
  }, []);

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  // Use useMemo for the CommentInput component to prevent recreation
  const CommentInput = useMemo(
    () => (
      <View
        style={[
          commentstyles.replyInputContainer,
          {
            marginBottom: 15,
            marginTop: inputAtBottom ? 10 : 0,
            backgroundColor: "#fff",
            borderRadius: 10,
            elevation: 2,
            zIndex: 1000,
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          value={commentText}
          onChangeText={handleChangeText}
          placeholder="Write a comment..."
          style={[commentstyles.replyInput, { borderWidth: 0 }]}
          multiline
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        <TouchableOpacity onPress={handleSubmit} style={commentstyles.replySubmit}>
          <Text style={commentstyles.replySubmitText}>Post</Text>
        </TouchableOpacity>
      </View>
    ),
    [commentText, handleChangeText, handleFocus, handleBlur, handleSubmit, inputAtBottom]
  );

  const renderComments = useCallback(() => {
    if (error) {
      return <Text style={{ textAlign: "center", color: "red", fontSize: 16 }}>Error: {error}</Text>;
    }

    return (
      <>
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} type={commentType} id={id} />
        ))}
        {loading && <ActivityIndicator size="small" color="#3498db" style={{ marginVertical: 10 }} />}
        {!loading && page < totalPages && (
          <TouchableOpacity onPress={loadMore} style={commentstyles.loadMoreButton}>
            <Text style={commentstyles.loadMoreText}>Load More</Text>
          </TouchableOpacity>
        )}
      </>
    );
  }, [comments, loading, page, totalPages, error, commentType, id, loadMore]);

  // Create a stable ScrollView component
  const scrollViewContent = useMemo(
    () => (
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ paddingBottom: inputAtBottom ? 100 : 20 }}
        keyboardShouldPersistTaps="always"
        scrollEventThrottle={200}
        removeClippedSubviews={false}
      >
        {ListHeaderComponent && <ListHeaderComponent />}
        {renderComments()}
      </ScrollView>
    ),
    [inputAtBottom, ListHeaderComponent, renderComments]
  );

  // Optimize rendering of bottom input container
  const bottomInputContainer = useMemo(() => {
    if (!inputAtBottom) return null;

    return (
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#f9f9f9",
          paddingHorizontal: 15,
          paddingVertical: 10,
          zIndex: 1000,
        }}
      >
        {CommentInput}
      </View>
    );
  }, [inputAtBottom, CommentInput]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      contentContainerStyle={{ flex: 1 }}
    >
      <View style={{ flex: 1, padding: 15, backgroundColor: "#f9f9f9" }}>
        {!inputAtBottom && CommentInput}
        {error ? <Text style={{ textAlign: "center", color: "red", fontSize: 16 }}>Error: {error}</Text> : scrollViewContent}
        {bottomInputContainer}
      </View>
    </KeyboardAvoidingView>
  );
};

// Create a custom comparison function for memo
const arePropsEqual = (prevProps, nextProps) =>
  prevProps.bookId === nextProps.bookId &&
  prevProps.chapterId === nextProps.chapterId &&
  prevProps.postId === nextProps.postId &&
  prevProps.inputAtBottom === nextProps.inputAtBottom &&
  prevProps.isNested === nextProps.isNested &&
  prevProps.ListHeaderComponent === nextProps.ListHeaderComponent;

export default memo(CommentsList, arePropsEqual);
