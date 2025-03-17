// ChapterList.js
import React from "react";
import { View, Text, FlatList, StyleSheet, Platform } from "react-native";
import { ProgressView } from "@react-native-community/progress-view";
const ProgressBar = Platform.select({
  ios: ProgressView,
  android: ProgressView,
});

const ChapterList = ({ chapters, readingProgress }) => {
  const getChapterProgress = (chapterId) => {
    const progress = readingProgress.find((p) => p.chapterId === chapterId);
    return progress ? progress.progress : 0;
  };

  const renderChapterItem = ({ item }) => (
    <View style={styles.chapterItem}>
      <Text style={styles.chapterTitle}>
        Chapter {item.chapterNum}: {item.title}
      </Text>
      <View style={styles.progressContainer}>
        <ProgressBar
          style={styles.progressBar}
          progress={getChapterProgress(item.id) / 100}
          color="#4CAF50"
          styleAttr={Platform.OS === "android" ? "Horizontal" : undefined}
        />
        <Text style={styles.progressText}>{Math.round(getChapterProgress(item.id))}%</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Chapters</Text>
      <FlatList data={chapters} renderItem={renderChapterItem} keyExtractor={(item) => item.id.toString()} style={styles.chapterList} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  chapterList: {
    flex: 1,
  },
  chapterItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  chapterTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 8,
    marginRight: 8,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
  },
});

export default ChapterList;
