import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getTopCategories } from "../../services/CategoryServices";
import { styles } from "../../style/styles";

export const CategoriesList = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getTopCategories();
      setCategories(data);
    } catch (err) {
      setError("Failed to load categories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const navigateToCategory = (category) => {
    navigation.navigate("CategoryBooks", { category });
  };

  const navigateToBook = (book) => {
    navigation.navigate("BookDetail", { book });
  };

  const renderBook = ({ item }) => (
    <TouchableOpacity style={localStyles.bookItem} onPress={() => navigateToBook(item)}>
      <Image source={{ uri: item.bookCover || "https://via.placeholder.com/100x150?text=No+Cover" }} style={localStyles.bookCover} />
      <Text style={localStyles.bookTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={localStyles.bookAuthor} numberOfLines={1}>
        {item.authorName || "Unknown"}
      </Text>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }) => (
    <View style={localStyles.categoryContainer}>
      <View style={localStyles.categoryHeader}>
        <Text style={localStyles.categoryName}>{item.name}</Text>
        <TouchableOpacity style={localStyles.viewAllButton} onPress={() => navigateToCategory(item)}>
          <Text style={localStyles.viewAllText}>View all</Text>
          <Icon name="chevron-right" size={16} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {item.books && item.books.length > 0 ? (
        <FlatList
          data={item.books.slice(0, 10)} // Limit to 10 books per category
          renderItem={renderBook}
          keyExtractor={(book) => book.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={localStyles.booksListContent}
        />
      ) : (
        <Text style={localStyles.noBooks}>No books in this category</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={localStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={localStyles.errorContainer}>
        <Text style={localStyles.errorText}>{error}</Text>
        <TouchableOpacity style={localStyles.retryButton} onPress={fetchCategories}>
          <Text style={localStyles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={localStyles.mainContainer}>
      <Text style={localStyles.sectionTitle}>Categories</Text>
      {categories.map((category) => renderCategory({ item: category }))}
    </View>
  );
};

const localStyles = StyleSheet.create({
  mainContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginVertical: 15,
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  loadingContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginVertical: 15,
    borderRadius: 10,
    padding: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  errorContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginVertical: 15,
    borderRadius: 10,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryText: {
    color: "white",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    color: "#2196F3",
    marginRight: 3,
  },
  booksListContent: {
    paddingLeft: 5,
    paddingRight: 15,
  },
  bookItem: {
    width: 100,
    marginRight: 12,
  },
  bookCover: {
    width: 100,
    height: 150,
    borderRadius: 5,
    marginBottom: 5,
    backgroundColor: "#f0f0f0",
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  bookAuthor: {
    fontSize: 12,
    color: "#666",
  },
  noBooks: {
    fontSize: 14,
    color: "#999",
    paddingHorizontal: 5,
  },
});
