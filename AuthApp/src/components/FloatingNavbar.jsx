import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign, MaterialIcons, FontAwesome } from "@expo/vector-icons";

const FloatingNavbar = ({
  navigation,
  scrollProgress,
  chapter,
  onToggleFavourite,
  onShowComments,
  onShowChapterList,
  onShareChapter, // New prop for sharing
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.progressText}>
        <Text style={styles.progressLabel}>{Math.round(scrollProgress * 100)}% read</Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton} onPress={onToggleFavourite}>
          <AntDesign
            name={chapter?.likedByCurrentUser ? "heart" : "hearto"}
            size={22}
            color={chapter?.likedByCurrentUser ? "#e74c3c" : "#fff"}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onShowComments}>
          <FontAwesome name="comment" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onShareChapter}>
          <AntDesign name="sharealt" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onShowChapterList}>
          <MaterialIcons name="menu-book" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(52, 152, 219, 0.95)",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  progressText: {
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
  },
});

export default FloatingNavbar;
