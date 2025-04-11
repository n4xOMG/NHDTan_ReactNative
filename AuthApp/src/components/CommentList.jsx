import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addComment, fetchComments, resetComments } from "../redux/slices/commentSlice";
import { commentstyles } from "../style/commentstyles";
import CommentItem from "./CommentItem";

const CommentsList = ({ bookId, chapterId, postId }) => {
  const dispatch = useDispatch();
  const [commentText, setCommentText] = useState("");

  // Fixed: Determine comment type more reliably
  const determineCommentType = () => {
    if (bookId) return "book";
    if (chapterId) return "chapter";
    if (postId) return "post";
    return "book"; // Default to book if nothing is specified
  };

  const commentType = determineCommentType();
  const id = bookId || chapterId || postId;

  // Select the appropriate branch of the state
  const commentState = useSelector((state) => state.comments[commentType]);
  const { comments, page, totalPages, loading, error } = commentState || {
    comments: [],
    page: 0,
    totalPages: 0,
    loading: false,
    error: null,
  };

  // Load comments when component mounts or IDs change
  useEffect(() => {
    if (id) {
      console.log(`Fetching ${commentType} comments for ID: ${id}`);
      dispatch(resetComments({ type: commentType }));
      dispatch(fetchComments({ type: commentType, id, page: 0 }));
    }
  }, [bookId, chapterId, postId, commentType, dispatch]);

  const loadMore = () => {
    if (!loading && page < totalPages) {
      dispatch(fetchComments({ type: commentType, id, page }));
    }
  };

  const handleSubmit = () => {
    if (commentText.trim()) {
      dispatch(addComment({ type: commentType, id, data: { content: commentText } }));
      setCommentText("");
    }
  };

  return (
    <View style={{ flex: 1, padding: 15, backgroundColor: "#f9f9f9" }}>
      <View style={[commentstyles.replyInputContainer, { marginBottom: 15, backgroundColor: "#fff", borderRadius: 10, elevation: 2 }]}>
        <TextInput
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Write a comment..."
          style={[commentstyles.replyInput, { borderWidth: 0 }]}
          multiline
        />
        <TouchableOpacity onPress={handleSubmit} style={commentstyles.replySubmit}>
          <Text style={commentstyles.replySubmitText}>Post</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <Text style={{ textAlign: "center", color: "red", fontSize: 16 }}>Error: {error}</Text>
      ) : (
        <FlatList
          data={comments}
          renderItem={({ item }) => <CommentItem comment={item} type={commentType} id={id} />}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListFooterComponent={
            loading ? (
              <ActivityIndicator size="small" color="#3498db" style={{ marginVertical: 10 }} />
            ) : page < totalPages ? (
              <TouchableOpacity onPress={loadMore} style={commentstyles.loadMoreButton}>
                <Text style={commentstyles.loadMoreText}>Load More</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}
    </View>
  );
};

export default CommentsList;
