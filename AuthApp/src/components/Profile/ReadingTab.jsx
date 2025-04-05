import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getUserReadingHistory } from "../../services/ReadingService";

const ReadingTab = () => {
  const [readingHistory, setReadingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchReadingHistory();
  }, []);

  const fetchReadingHistory = async () => {
    try {
      setLoading(true);
      const data = await getUserReadingHistory();
      setReadingHistory(data);
    } catch (err) {
      setError("Failed to load reading history");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleContinueReading = (item) => {
    navigation.navigate("ChapterDetail", {
      chapterId: item.chapterId,
      bookId: item.bookId,
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (readingHistory.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyStateText}>You haven't started reading any books yet.</Text>
      </View>
    );
  }

  const renderReadingItem = ({ item }) => (
    <View style={styles.readingItem}>
      <Image source={{ uri: item.bookCover }} style={styles.bookCover} />

      <View style={styles.contentContainer}>
        <Text style={styles.bookTitle} numberOfLines={1}>
          {item.bookTitle}
        </Text>
        <Text style={styles.authorText} numberOfLines={1}>
          {item.bookAuthor}
          {item.bookArtist ? ` • ${item.bookArtist}` : ""}
        </Text>

        <Text style={styles.chapterInfo} numberOfLines={1}>
          Chapter {item.chapterNum}: {item.chapterName}
        </Text>

        <View style={styles.progressWrapper}>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${item.progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(item.progress)}%</Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.dateText}>Last read: {formatDate(item.lastReadAt)}</Text>

          <TouchableOpacity style={styles.continueButton} onPress={() => handleContinueReading(item)}>
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <FlatList
      data={readingHistory}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderReadingItem}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#FF6B6B",
    textAlign: "center",
  },
  readingItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  bookCover: {
    width: 80,
    height: 120,
    borderRadius: 5,
    backgroundColor: "#e0e0e0",
  },
  contentContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "space-between",
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 3,
  },
  authorText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  chapterInfo: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
  },
  progressWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  progressContainer: {
    flex: 1,
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    marginRight: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#2196F3",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2196F3",
    width: 35,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    color: "#888",
  },
  continueButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  continueText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default ReadingTab;
