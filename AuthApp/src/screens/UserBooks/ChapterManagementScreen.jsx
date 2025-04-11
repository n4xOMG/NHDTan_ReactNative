import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { fetchChaptersByBookId, removeChapter, setCurrentChapter, clearChapters } from "../../redux/slices/userChaptersSlice";
import { colors } from "../../style/modernStyles";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import EmptyState from "../../components/EmptyState";

const ChapterManagementScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const { bookId, bookTitle } = route.params || {};
  const userChaptersState = useSelector((state) => state.userChapters || { chapters: [], loading: false, error: null });
  const { chapters, loading, error } = userChaptersState;
  const { user } = useSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (!bookId) {
      setLocalError("Book ID is missing. Please go back and try again.");
      return;
    }

    console.log("ChapterManagementScreen mounted with bookId:", bookId);
    loadChapters();

    return () => {
      // Clean up chapters when unmounting
      dispatch(clearChapters());
    };
  }, [dispatch, bookId]);

  const loadChapters = () => {
    if (!bookId) {
      setLocalError("Book ID is missing. Cannot load chapters.");
      return;
    }

    try {
      const token = user?.token;
      console.log("Loading chapters for bookId:", bookId, "with token:", token ? "exists" : "missing");
      dispatch(fetchChaptersByBookId({ bookId, token }));
    } catch (err) {
      console.error("Error in loadChapters:", err);
      setLocalError(err.message || "Failed to load chapters");
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadChapters();
    setRefreshing(false);
  };

  const handleAddChapter = () => {
    if (!bookId) {
      Alert.alert("Error", "Book ID is missing. Cannot create chapter.");
      return;
    }
    navigation.navigate("ChapterEditor", {
      bookId,
      isEditing: false,
      isDraft: true, // default to draft mode
    });
  };

  const handleEditChapter = (chapter) => {
    if (!chapter || !chapter.id) {
      Alert.alert("Error", "Invalid chapter data");
      return;
    }
    dispatch(setCurrentChapter(chapter));
    navigation.navigate("ChapterEditor", {
      bookId,
      chapterId: chapter.id,
      isEditing: true,
      isDraft: chapter.draft,
    });
  };

  const handleDeleteChapter = (chapterId) => {
    if (!chapterId || !bookId) {
      Alert.alert("Error", "Missing data required to delete chapter");
      return;
    }

    Alert.alert("Delete Chapter", "Are you sure you want to delete this chapter? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          dispatch(removeChapter({ bookId, chapterId }));
        },
      },
    ]);
  };

  const renderChapterItem = ({ item }) => (
    <View style={styles.chapterCard}>
      <View style={styles.chapterInfo}>
        <View style={styles.chapterHeader}>
          <Text style={styles.chapterNumber}>Chapter {item.chapterNum}</Text>
          {item.draft && (
            <View style={styles.draftBadge}>
              <Text style={styles.draftText}>DRAFT</Text>
            </View>
          )}
        </View>
        <Text style={styles.chapterTitle}>{item.title}</Text>
        <Text style={styles.chapterDate}>{item.uploadDate ? new Date(item.uploadDate).toLocaleDateString() : "No date"}</Text>
        {item.price > 0 && (
          <Text style={styles.chapterPrice}>
            Price: <Text style={{ fontWeight: "bold" }}>{item.price} coins</Text>
          </Text>
        )}
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleEditChapter(item)}>
          <Icon name="create-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDeleteChapter(item.id)}>
          <Icon name="trash-outline" size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (localError || error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Error: {localError || error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadChapters}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.retryButton, { marginTop: 10, backgroundColor: colors.secondary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!bookId) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Error: Missing book information</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{bookTitle || "Book"} - Chapters</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddChapter}>
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !Array.isArray(chapters) || chapters.length === 0 ? (
        <EmptyState icon="book" message="No chapters yet" actionText="Create Your First Chapter" onAction={handleAddChapter} />
      ) : (
        <FlatList
          data={chapters}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={renderChapterItem}
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
    flex: 1,
    textAlign: "center",
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
  chapterCard: {
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
  chapterInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  chapterHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  chapterNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text.secondary,
  },
  draftBadge: {
    backgroundColor: "#FFF0E0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  draftText: {
    fontSize: 10,
    color: "#F97316",
    fontWeight: "bold",
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 4,
  },
  chapterDate: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  chapterPrice: {
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

export default ChapterManagementScreen;
