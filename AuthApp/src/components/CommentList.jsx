import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCommentsByBookId,
  fetchChapterComments,
  fetchPostComments,
  addBookComment,
  addChapterComment,
  addPostComment,
} from "../redux/slices/commentSlice";
import { bookdetailstyles } from "../style/bookdetailstyles";
import { commentstyles } from "../style/commentstyles";
import CommentItem from "./CommentItem";

const CommentsList = ({ bookId, chapterId, postId }) => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(0);
  const [commentText, setCommentText] = useState("");
  // Use different selectors based on type:
  const commentsState =
    bookId && !chapterId && !postId
      ? useSelector((state) => state.comments.bookComments)
      : chapterId
      ? useSelector((state) => state.comments.chapterComments)
      : postId
      ? useSelector((state) => state.comments.postComments)
      : { comments: [], totalPages: 1, loading: false, error: null };

  const { comments, totalPages, loading, error, page } = commentsState;

  // Load initial comments when identifiers change.
  useEffect(() => {
    loadComments(0);
  }, [bookId, chapterId, postId]);

  const loadComments = (pageParam) => {
    if (bookId && !chapterId && !postId) {
      dispatch(fetchCommentsByBookId({ bookId, page: pageParam, size: 10 }));
    } else if (chapterId) {
      dispatch(fetchChapterComments({ chapterId, page: pageParam, size: 10 }));
    } else if (postId) {
      dispatch(fetchPostComments({ postId, page: pageParam, size: 10 }));
    }
    setCurrentPage(pageParam);
  };

  const loadMoreComments = () => {
    if (!loading && currentPage + 1 < totalPages) {
      loadComments(currentPage + 1);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    try {
      if (bookId && !chapterId && !postId) {
        await dispatch(addBookComment({ bookId, data: { content: commentText } })).unwrap();
      } else if (chapterId) {
        await dispatch(addChapterComment({ chapterId, data: { content: commentText } })).unwrap();
      } else if (postId) {
        await dispatch(addPostComment({ postId, data: { content: commentText } })).unwrap();
      }
      setCommentText("");
      // Optionally, reload comments after submit:
      loadComments(0);
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const renderComment = ({ item }) => <CommentItem comment={item} bookId={bookId} chapterId={chapterId} postId={postId} />;
  const renderFooter = () => {
    if (loading && currentPage > 0) {
      return <ActivityIndicator size="small" color="#3498db" style={{ marginVertical: 10 }} />;
    }
    if (comments?.length > 0 && currentPage + 1 < totalPages) {
      return (
        <TouchableOpacity style={[bookdetailstyles.postButton, { marginVertical: 15 }]} onPress={loadMoreComments} disabled={loading}>
          <Text style={bookdetailstyles.postButtonText}>Load More</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  if (error) {
    return (
      <View style={commentstyles.errorContainer}>
        <Text style={commentstyles.errorText}>Error: {error}</Text>
        <TouchableOpacity onPress={() => loadComments(0)}>
          <Text style={commentstyles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={bookdetailstyles.commentSection}>
      <View style={bookdetailstyles.commentInputContainer}>
        <TextInput
          style={bookdetailstyles.commentInput}
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Write a comment..."
          multiline
        />
        <TouchableOpacity style={bookdetailstyles.postButton} onPress={handleCommentSubmit}>
          <Text style={bookdetailstyles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
      {comments?.length > 0 || loading ? (
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListFooterComponent={renderFooter}
        />
      ) : (
        <Text style={bookdetailstyles.noComments}>No comments yet.</Text>
      )}
    </View>
  );
};

export default CommentsList;
