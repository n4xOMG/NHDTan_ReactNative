import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";

const FloatingNavbar = ({ navigation, scrollProgress, chapter, onToggleFavourite, onShowComments, onShowChapterList }) => {
  return (
    <View style={styles.container}>
      {/* Integrated progress bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${Math.round(scrollProgress * 100)}%` }]} />
      </View>
      {/* Icons row */}
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <AntDesign name="home" size={24} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onShowChapterList}>
          <AntDesign name="book" size={24} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onShowComments}>
          <AntDesign name="message1" size={24} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onToggleFavourite}>
          <AntDesign name={chapter?.likedByCurrentUser ? "heart" : "hearto"} size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  progressContainer: {
    height: 4,
    backgroundColor: "#e0e0e0",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
    marginBottom: 5,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#2196F3",
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
});

export default FloatingNavbar;
