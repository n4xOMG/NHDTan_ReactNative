import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert, Image } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserBooks, removeBook } from "../../redux/slices/userBooksSlice";
import { colors, modernStyles } from "../../style/modernStyles";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import EmptyState from "../../components/EmptyState";

const UserBooksScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { books, loading, error } = useSelector((state) => state.userBooks);
  const { user } = useSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user && user.id) {
      loadBooks();
    }
  }, [dispatch, user]);

  const loadBooks = () => {
    if (user && user.id) {
      dispatch(fetchUserBooks(user.id));
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadBooks();
    setRefreshing(false);
  };

  const handleAddBook = () => {
    navigation.navigate("BookEditor", { isEditing: false });
  };

  const handleEditBook = (book) => {
    navigation.navigate("BookEditor", { book, isEditing: true });
  };

  const handleDeleteBook = (bookId) => {
    Alert.alert("Delete Book", "Are you sure you want to delete this book? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          dispatch(removeBook(bookId));
        },
      },
    ]);
  };

  const handleManageChapters = (book) => {
    navigation.navigate("ChapterManagement", { bookId: book.id, bookTitle: book.title });
  };

  const renderBookItem = ({ item }) => (
    <View style={styles.bookCard}>
      <Image source={{ uri: item.bookCover || "https://via.placeholder.com/150" }} style={styles.bookCover} resizeMode="cover" />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2} onPress={() => navigation.navigate("BookDetail", { bookId: item.id })}>
          {item.title}
        </Text>
        <Text style={styles.bookMeta}>
          <Icon name="eye-outline" size={14} /> {item.viewCount} views
          {" • "}
          <Icon name="heart-outline" size={14} /> {item.favCount} likes
        </Text>
        <Text style={styles.bookStatus}>
          Status: <Text style={{ fontWeight: "bold" }}>{item.status}</Text>
        </Text>
        <Text style={styles.bookChapters}>
          Chapters: {item.chapterCount} • Latest: {item.latestChapterNumber || "N/A"}
        </Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.actionButton, styles.chaptersButton]} onPress={() => handleManageChapters(item)}>
          <Icon name="list-outline" size={20} color={colors.secondary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleEditBook(item)}>
          <Icon name="create-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDeleteBook(item.id)}>
          <Icon name="trash-outline" size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadBooks}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Books</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddBook}>
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : books.length === 0 ? (
        <EmptyState icon="book" message="You haven't created any books yet." actionText="Create Your First Book" onAction={handleAddBook} />
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBookItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  bookCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
  },
  bookInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 4,
  },
  bookMeta: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  bookStatus: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  bookChapters: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  actionButtons: {
    justifyContent: "space-between",
    paddingLeft: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: "#e8f4ff",
  },
  deleteButton: {
    backgroundColor: "#ffeeee",
  },
  chaptersButton: {
    backgroundColor: "#e8fff0",
    marginBottom: 8,
  },
  errorText: {
    color: colors.danger,
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default UserBooksScreen;
