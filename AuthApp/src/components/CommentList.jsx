import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addComment, fetchComments, resetComments } from "../redux/slices/commentSlice";
import CommentItem from "./CommentItem";
import { commentstyles } from "../style/commentstyles";

const CommentsList = ({ bookId, chapterId, postId }) => {
  const dispatch = useDispatch();
  const [commentText, setCommentText] = useState("");
  const { comments, page, totalPages, loading, error, type } = useSelector((state) => state.comments);

  const commentType = bookId ? "book" : chapterId ? "chapter" : "post";
  const id = bookId || chapterId || postId;

  useEffect(() => {
    if (type !== commentType) dispatch(resetComments());
    dispatch(fetchComments({ type: commentType, id, page: 0 }));
  }, [bookId, chapterId, postId]);

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
