import { addReply, deleteCommentThunk, editCommentThunk, toggleLike } from "../redux/slices/commentSlice";
import { AntDesign } from "@expo/vector-icons";
import React, { memo, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { commentstyles } from "../style/commentstyles";

const CommentItem = memo(({ comment, type, id }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);

  const handleLike = () => dispatch(toggleLike({ commentId: comment.id, type }));
  const handleReply = () => {
    if (replyText.trim()) {
      dispatch(addReply({ type, id, parentCommentId: comment.id, data: { content: replyText } }));
      setReplyText("");
      setShowReply(false);
    }
  };
  const handleEdit = () => {
    if (editText.trim()) {
      dispatch(editCommentThunk({ commentId: comment.id, data: { content: editText }, type }));
      setIsEditing(false);
    }
  };
  const handleDelete = () => dispatch(deleteCommentThunk({ commentId: comment.id, type }));

  const isOwnComment = currentUser?.id === comment.user?.id;

  return (
    <View style={[commentstyles.commentContainer, { backgroundColor: "#fff", borderRadius: 8, elevation: 1, marginBottom: 10 }]}>
      <View style={commentstyles.commentHeader}>
        <Text style={commentstyles.commentUser}>{comment.user?.username || "User"}</Text>
        <TouchableOpacity onPress={handleLike} style={{ flexDirection: "row", alignItems: "center" }}>
          <AntDesign
            name={comment.likedByCurrentUser ? "like1" : "like2"}
            size={18}
            color={comment.likedByCurrentUser ? "#3498db" : "#999"}
          />
          <Text style={{ marginLeft: 5, color: "#666" }}>{comment.likedUsers?.length || 0}</Text>
        </TouchableOpacity>
      </View>

      {isEditing ? (
        <View style={[commentstyles.replyInputContainer, { marginVertical: 10 }]}>
          <TextInput value={editText} onChangeText={setEditText} style={[commentstyles.replyInput, { borderColor: "#ccc" }]} multiline />
          <TouchableOpacity onPress={handleEdit} style={commentstyles.replySubmit}>
            <Text style={commentstyles.replySubmitText}>Save</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={[commentstyles.commentContent, { marginVertical: 5 }]}>{comment.content}</Text>
      )}

      <View style={{ flexDirection: "row", gap: 15, marginTop: 5 }}>
        <TouchableOpacity onPress={() => setShowReply(!showReply)}>
          <Text style={commentstyles.replyButton}>Reply</Text>
        </TouchableOpacity>
        {isOwnComment && (
          <>
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={commentstyles.replyButton}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete}>
              <Text style={[commentstyles.replyButton, { color: "#e74c3c" }]}>Delete</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {showReply && (
        <View style={[commentstyles.replyInputContainer, { marginTop: 10 }]}>
          <TextInput value={replyText} onChangeText={setReplyText} placeholder="Reply..." style={commentstyles.replyInput} multiline />
          <TouchableOpacity onPress={handleReply} style={commentstyles.replySubmit}>
            <Text style={commentstyles.replySubmitText}>Submit</Text>
          </TouchableOpacity>
        </View>
      )}

      {comment.replyComment?.length > 0 && (
        <View style={commentstyles.repliesContainer}>
          {comment.replyComment.map((reply) => (
            <CommentItem key={reply.id} comment={reply} type={type} id={id} />
          ))}
        </View>
      )}
    </View>
  );
});

export default CommentItem;
