import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import CommentsList from "./CommentList";
import { AntDesign } from "@expo/vector-icons";

const CommentModal = ({ visible, onClose, bookId, chapterId, postId }) => {
  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Comments</Text>
            <TouchableOpacity onPress={onClose}>
              <AntDesign name="close" size={24} color="#2196F3" />
            </TouchableOpacity>
          </View>
          {/* Comments List */}
          <CommentsList bookId={bookId} chapterId={chapterId} postId={postId} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: "70%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomColor: "#e0e0e0",
    borderBottomWidth: 1,
    paddingBottom: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
});

export default CommentModal;
