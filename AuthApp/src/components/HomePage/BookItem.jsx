import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { modernStyles, colors } from "../../style/modernStyles";
import { useNavigation } from "@react-navigation/native";

export const BookItem = ({ book, compact = false, showStats = true, onPress }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress(book);
    } else {
      // Default navigation to book details
      navigation.navigate("BookDetails", { bookId: book.id });
    }
  };

  if (compact) {
    // Compact version for horizontal lists
    return (
      <TouchableOpacity style={styles.compactContainer} onPress={handlePress}>
        <Image
          source={{ uri: book.bookCover || "https://via.placeholder.com/150x220?text=No+Cover" }}
          style={styles.compactCover}
          resizeMode="cover"
        />
        <Text style={styles.compactTitle} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.compactAuthor} numberOfLines={1}>
          {book.authorName || "Unknown"}
        </Text>
        {showStats && (
          <View style={styles.compactStats}>
            <Text style={styles.smallStat}>
              <Ionicons name="star" size={10} color={colors.accent} /> {book.avgRating?.toFixed(1) || "N/A"}
            </Text>
            <Text style={styles.smallStat}>
              <Ionicons name="eye" size={10} color={colors.primary} /> {book.viewCount || 0}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Full version for detailed lists
  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Image
        source={{ uri: book.bookCover || "https://via.placeholder.com/150x220?text=No+Cover" }}
        style={styles.cover}
        resizeMode="cover"
      />
      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.author}>{book.authorName || "Unknown Author"}</Text>

        {book.categoryName && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{book.categoryName}</Text>
          </View>
        )}

        {showStats && (
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Ionicons name="star" size={14} color={colors.accent} />
              <Text style={styles.statText}>{book.avgRating?.toFixed(1) || "N/A"}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="eye" size={14} color={colors.primary} />
              <Text style={styles.statText}>{book.viewCount || 0}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="heart" size={14} color={colors.error} />
              <Text style={styles.statText}>{book.favCount || 0}</Text>
            </View>
          </View>
        )}

        {book.chapterCount > 0 && (
          <Text style={styles.chapters}>
            <Ionicons name="document-text" size={14} /> {book.chapterCount} chapters
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Full version styles
  container: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 8,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: 300,
  },
  cover: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  details: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 12,
    color: colors.dark,
  },
  stats: {
    flexDirection: "row",
    marginTop: 4,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  statText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 4,
  },
  chapters: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 6,
  },

  // Compact version styles
  compactContainer: {
    width: 120,
    marginRight: 12,
    marginBottom: 8,
  },
  compactCover: {
    width: 120,
    height: 160,
    borderRadius: 8,
    marginBottom: 6,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 2,
  },
  compactAuthor: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  compactStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  smallStat: {
    fontSize: 10,
    color: colors.text.secondary,
  },
});
