import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
  TextInput,
  Modal,
  Animated,
  Pressable,
} from "react-native";
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

  // New state variables for search and filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    status: null,
    sortBy: "latest", // 'latest', 'oldest', 'most-viewed', 'most-liked'
  });
  const [filterCount, setFilterCount] = useState(0);

  useEffect(() => {
    if (user && user.id) {
      loadBooks();
    }
  }, [dispatch, user]);

  // Apply filters and search whenever books, searchQuery, or activeFilters change
  useEffect(() => {
    let result = [...books];

    // Apply search query
    if (searchQuery.trim()) {
      result = result.filter((book) => book.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Apply status filter
    if (activeFilters.status) {
      result = result.filter((book) => book.status === activeFilters.status);
    }

    // Apply sorting
    switch (activeFilters.sortBy) {
      case "oldest":
        result.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
        break;
      case "most-viewed":
        result.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case "most-liked":
        result.sort((a, b) => b.favCount - a.favCount);
        break;
      case "latest":
      default:
        result.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        break;
    }

    setFilteredBooks(result);

    // Count active filters (excluding default sort)
    let count = 0;
    if (activeFilters.status) count++;
    if (activeFilters.sortBy !== "latest") count++;
    setFilterCount(count);
  }, [books, searchQuery, activeFilters]);

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

  const handleClearFilters = () => {
    setActiveFilters({
      status: null,
      sortBy: "latest",
    });
    setSearchQuery("");
  };

  const renderFilterBadge = (count) => {
    if (count === 0) return null;
    return (
      <View style={styles.filterBadge}>
        <Text style={styles.filterBadgeText}>{count}</Text>
      </View>
    );
  };

  const renderBookItem = ({ item }) => (
    <Animated.View style={styles.bookCard}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate("BookDetail", { bookId: item.id })}
        style={styles.bookCardInner}
      >
        <Image source={{ uri: item.bookCover || "https://via.placeholder.com/150" }} style={styles.bookCover} resizeMode="cover" />
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="eye-outline" size={14} color={colors.text.secondary} />
              <Text style={styles.statText}>{item.viewCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="heart-outline" size={14} color={colors.text.secondary} />
              <Text style={styles.statText}>{item.favCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="star-outline" size={14} color={colors.text.secondary} />
              <Text style={styles.statText}>{item.avgRating?.toFixed(1) || "N/A"}</Text>
            </View>
          </View>

          <View style={styles.statusChips}>
            <View style={[styles.statusChip, getStatusStyle(item.status)]}>
              <Text style={styles.statusChipText}>{item.status}</Text>
            </View>
            <Text style={styles.bookChapters}>
              {item.chapterCount} {item.chapterCount === 1 ? "chapter" : "chapters"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.actionButton, styles.chaptersButton]} onPress={() => handleManageChapters(item)}>
          <Icon name="list-outline" size={18} color={colors.secondary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleEditBook(item)}>
          <Icon name="create-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDeleteBook(item.id)}>
          <Icon name="trash-outline" size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "published":
        return { backgroundColor: "#e0f7e6" };
      case "ongoing":
        return { backgroundColor: "#e6f2ff" };
      case "hiatus":
        return { backgroundColor: "#fff0e0" };
      default:
        return { backgroundColor: "#f0f0f0" };
    }
  };

  const FilterModal = () => (
    <Modal animationType="slide" transparent={true} visible={filterModalVisible} onRequestClose={() => setFilterModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Books</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Icon name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Status</Text>
            <View style={styles.filterOptions}>
              {["Ongoing", "Published", "Hiatus"].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[styles.filterOption, activeFilters.status === status && styles.filterOptionActive]}
                  onPress={() =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      status: prev.status === status ? null : status,
                    }))
                  }
                >
                  <Text style={[styles.filterOptionText, activeFilters.status === status && styles.filterOptionTextActive]}>{status}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Sort By</Text>
            <View style={styles.filterOptions}>
              {[
                { id: "latest", label: "Latest" },
                { id: "oldest", label: "Oldest" },
                { id: "most-viewed", label: "Most Viewed" },
                { id: "most-liked", label: "Most Liked" },
              ].map((sort) => (
                <TouchableOpacity
                  key={sort.id}
                  style={[styles.filterOption, activeFilters.sortBy === sort.id && styles.filterOptionActive]}
                  onPress={() =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      sortBy: sort.id,
                    }))
                  }
                >
                  <Text style={[styles.filterOptionText, activeFilters.sortBy === sort.id && styles.filterOptionTextActive]}>
                    {sort.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.clearFiltersButton} onPress={handleClearFilters}>
              <Text style={styles.clearFiltersText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyFiltersButton} onPress={() => setFilterModalVisible(false)}>
              <Text style={styles.applyFiltersText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
            <Icon name="options-outline" size={22} color={colors.text.primary} />
            {renderFilterBadge(filterCount)}
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAddBook}>
            <Icon name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search-outline" size={20} color={colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your books..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.text.placeholder}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearSearch}>
            <Icon name="close-circle" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredBooks.length === 0 ? (
        searchQuery || filterCount > 0 ? (
          <EmptyState
            icon="search"
            message="No books match your search or filters."
            actionText="Clear Filters"
            onAction={handleClearFilters}
          />
        ) : (
          <EmptyState
            icon="book"
            message="You haven't created any books yet."
            actionText="Create Your First Book"
            onAction={handleAddBook}
          />
        )
      ) : (
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBookItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FilterModal />
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
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterButton: {
    backgroundColor: "#f0f0f0",
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  filterBadge: {
    position: "absolute",
    right: -4,
    top: -4,
    backgroundColor: colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#efefef",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: colors.text.primary,
  },
  clearSearch: {
    padding: 4,
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
    paddingBottom: 24,
  },
  bookCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  bookCardInner: {
    flex: 1,
    flexDirection: "row",
    padding: 12,
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
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 4,
  },
  statusChips: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  bookChapters: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  actionButtons: {
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingRight: 8,
    paddingLeft: 4,
    borderLeftWidth: 1,
    borderLeftColor: "#f0f0f0",
    backgroundColor: "#fafafa",
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    marginBottom: 6,
  },
  editButton: {
    backgroundColor: "#e8f4ff",
  },
  deleteButton: {
    backgroundColor: "#ffeeee",
  },
  chaptersButton: {
    backgroundColor: "#e8fff0",
    marginBottom: 6,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  filterSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: colors.text.primary,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
    marginBottom: 8,
  },
  filterOptionActive: {
    backgroundColor: colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  filterOptionTextActive: {
    color: "#fff",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  clearFiltersButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  clearFiltersText: {
    color: colors.text.secondary,
    fontWeight: "600",
  },
  applyFiltersButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  applyFiltersText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default UserBooksScreen;
