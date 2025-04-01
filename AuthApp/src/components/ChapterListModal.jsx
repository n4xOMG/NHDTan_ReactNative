import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ChapterList from "./ChapterList";

const ChapterListModal = ({ visible, onClose, bookId, chapters, navigation, onChapterUnlocked }) => {
  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Chapters</Text>
            <TouchableOpacity onPress={onClose}>
              <AntDesign name="close" size={24} color="#2196F3" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.scrollContainer}>
            <ChapterList chapters={chapters} bookId={bookId} navigation={navigation} onChapterUnlocked={onChapterUnlocked} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1, // Full screen overlay
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
    justifyContent: "flex-end", // Modal slides up from bottom
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%", // Limit height to 80% of screen
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  scrollContainer: {
    flexGrow: 1, // Allow ScrollView to expand
  },
});

export default ChapterListModal;
