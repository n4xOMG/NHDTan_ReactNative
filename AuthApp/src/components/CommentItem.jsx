import { AntDesign } from "@expo/vector-icons";
import React, { memo, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  addBookReplyComment,
  addChapterReplyComment,
  addPostReplyComment,
  deleteCommentThunk,
  editCommentThunk,
  fetchCommentsByBookId,
  fetchChapterComments,
  fetchPostComments,
  toggleLikeComment,
} from "../redux/slices/commentSlice";
import { commentstyles } from "../style/commentstyles";

const CommentItem = memo(({ comment, bookId, chapterId, postId }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);

  const liked = comment.likedByCurrentUser;
  const likeCount = comment.likedUsers?.length || 0;

  const refreshComments = async () => {
    if (bookId && !chapterId && !postId) {
      await dispatch(fetchCommentsByBookId({ bookId, page: 0, size: 10 }));
    } else if (chapterId) {
      await dispatch(fetchChapterComments({ chapterId, page: 0, size: 10 }));
    } else if (postId) {
      await dispatch(fetchPostComments({ postId, page: 0, size: 10 }));
    }
  };

  const handleLike = async () => {
    try {
      // Determine the comment type based on which prop is defined:
      const commentType = chapterId ? "chapter" : postId ? "post" : "book";
      await dispatch(toggleLikeComment({ commentId: comment.id, commentType })).unwrap();
    } catch (error) {
      Alert.alert("Error", "Failed to like comment");
    }
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    try {
      if (bookId && !chapterId && !postId) {
        await dispatch(addBookReplyComment({ bookId, parentCommentId: comment.id, data: { content: replyText } })).unwrap();
      } else if (chapterId) {
        await dispatch(addChapterReplyComment({ bookId, chapterId, parentCommentId: comment.id, data: { content: replyText } })).unwrap();
      } else if (postId) {
        await dispatch(
          addPostReplyComment({
            postId,
            parentCommentId: comment.id,
            data: { content: replyText },
            token: useSelector((state) => state.auth.token),
          })
        ).unwrap();
      }
      setReplyText("");
      setShowReplyInput(false);
      await refreshComments();
    } catch (error) {
      Alert.alert("Error", "Failed to submit reply");
    }
  };

  const handleEditSubmit = async () => {
    if (!editText.trim()) return;
    try {
      await dispatch(editCommentThunk({ commentId: comment.id, data: { content: editText } })).unwrap();
      setIsEditing(false);
      Alert.alert("Success", "Comment updated");
      await refreshComments();
    } catch (error) {
      Alert.alert("Error", "Failed to update comment");
    }
  };

  const handleDelete = async () => {
    Alert.alert("Delete Comment", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await dispatch(deleteCommentThunk({ commentId: comment.id })).unwrap();
            Alert.alert("Success", "Comment deleted");
            await refreshComments();
          } catch (error) {
            Alert.alert("Error", "Failed to delete comment");
          }
        },
      },
    ]);
  };

  const isOwnComment = currentUser?.id === comment.user?.id;

  return (
    <View style={commentstyles.commentContainer}>
      <View style={commentstyles.commentHeader}>
        <Text style={commentstyles.commentUser}>{comment.user?.username || "User"}</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={handleLike}>
            <AntDesign name={liked ? "like1" : "like2"} size={18} color={liked ? "#3498db" : "#333"} />
          </TouchableOpacity>
          <Text style={{ marginLeft: 5 }}>{likeCount}</Text>
        </View>
      </View>

      {isEditing ? (
        <View style={commentstyles.replyInputContainer}>
          <TextInput style={commentstyles.replyInput} value={editText} onChangeText={setEditText} placeholder="Edit your comment..." />
          <TouchableOpacity style={commentstyles.replySubmit} onPress={handleEditSubmit}>
            <Text style={commentstyles.replySubmitText}>Save</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={commentstyles.commentContent}>{comment.content}</Text>
      )}

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TouchableOpacity onPress={() => setShowReplyInput(!showReplyInput)}>
          <Text style={commentstyles.replyButton}>Reply</Text>
        </TouchableOpacity>
        {isOwnComment && (
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={commentstyles.replyButton}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete}>
              <Text style={[commentstyles.replyButton, { color: "red" }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {showReplyInput && (
        <View style={commentstyles.replyInputContainer}>
          <TextInput style={commentstyles.replyInput} value={replyText} onChangeText={setReplyText} placeholder="Write a reply..." />
          <TouchableOpacity style={commentstyles.replySubmit} onPress={handleReplySubmit}>
            <Text style={commentstyles.replySubmitText}>Submit</Text>
          </TouchableOpacity>
        </View>
      )}

      {comment.replyComment?.length > 0 && (
        <View style={commentstyles.repliesContainer}>
          {comment.replyComment.map((reply) => (
            <CommentItem key={reply.id} comment={reply} bookId={bookId} chapterId={chapterId} postId={postId} />
          ))}
        </View>
      )}
    </View>
  );
});

export default CommentItem;
