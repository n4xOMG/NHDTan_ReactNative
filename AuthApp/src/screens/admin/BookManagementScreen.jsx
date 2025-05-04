import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState, useRef } from "react";
import { ActivityIndicator, Alert, SafeAreaView, StatusBar, Text, TouchableOpacity, View, Animated } from "react-native";
import { getBooks, createBook, updateBook, deleteBook } from "../../services/BookServices";
import { getAllCategories, getAllTags } from "../../services/BookMetadataServices";
import { bookmanagestyles } from "../../style/bookmanagestyles";

// Import components
import BookList from "../../components/BookList";
import SearchBar from "../../components/SearchBar";
import SortHeader from "../../components/SortHeader";
import BookFormModal from "../../components/BookFormModal";

const BookManagementScreen = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortBy, setSortBy] = useState("title");

  // State for categories and tags
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  // Add a single formData state for the BookFormModal
  const [formData, setFormData] = useState({
    title: "",
    authorName: "",
    description: "",
    categoryId: null,
    tagIds: [],
    language: "",
    status: "",
    bookCover: "",
    suggested: false,
  });

  // Track if we're editing or adding a new book
  const [isEditing, setIsEditing] = useState(false);

  // Add animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const addButtonAnim = useRef(new Animated.Value(0)).current;

  // Fetch books, categories, and tags from API
  useEffect(() => {
    fetchBooks();
    fetchCategories();
    fetchTags();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await getBooks();
      setBooks(data);
      setFilteredBooks(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch books:", error);
      Alert.alert("Error", "Failed to load books. Please try again.");
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      Alert.alert("Error", "Failed to load categories.");
    }
  };

  const fetchTags = async () => {
    try {
      const data = await getAllTags();
      setTags(data);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
      Alert.alert("Error", "Failed to load tags.");
    }
  };

  useEffect(() => {
    // Filter books based on search query
    if (searchQuery) {
      const filtered = books.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (book.authorName && book.authorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (book.categoryName && book.categoryName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks(books);
    }
  }, [searchQuery, books]);

  useEffect(() => {
    // Animate in content when loaded
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(addButtonAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  const handleSort = (key) => {
    const newSortOrder = sortBy === key && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(key);
    setSortOrder(newSortOrder);

    let sorted = [...filteredBooks];

    // Handle specific sort fields
    switch (key) {
      case "title":
        sorted.sort((a, b) => {
          return newSortOrder === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
        });
        break;
      case "viewCount":
        sorted.sort((a, b) => {
          return newSortOrder === "asc" ? a.viewCount - b.viewCount : b.viewCount - a.viewCount;
        });
        break;
      case "rating":
        sorted.sort((a, b) => {
          const ratingA = a.avgRating || 0;
          const ratingB = b.avgRating || 0;
          return newSortOrder === "asc" ? ratingA - ratingB : ratingB - ratingA;
        });
        break;
      case "chapterCount":
        sorted.sort((a, b) => {
          return newSortOrder === "asc" ? a.chapterCount - b.chapterCount : b.chapterCount - a.chapterCount;
        });
        break;
      default:
        break;
    }

    setFilteredBooks(sorted);
  };

  const handleEdit = (book) => {
    // Find the category ID based on category name
    const categoryObj = categories.find((cat) => cat.name === book.categoryName);
    const categoryId = categoryObj ? categoryObj.id : null;

    // Format the data for the form
    setFormData({
      id: book.id,
      title: book.title || "",
      authorName: book.authorName || "",
      description: book.description || "",
      categoryId: categoryId,
      tagIds: book.tagIds || [],
      language: book.language || "",
      status: book.status || "",
      bookCover: book.bookCover || "",
      suggested: book.isSuggested || false,
      // Preserve other fields
      viewCount: book.viewCount,
      favCount: book.favCount,
      avgRating: book.avgRating,
      ratingCount: book.ratingCount,
      chapterCount: book.chapterCount,
      latestChapterNumber: book.latestChapterNumber,
    });

    setIsEditing(true);
    setModalVisible(true);
  };

  const handleAdd = () => {
    // Reset form data
    setFormData({
      title: "",
      authorName: "",
      description: "",
      categoryId: null,
      tagIds: [],
      language: "",
      status: "",
      bookCover: "",
      suggested: false,
    });

    setIsEditing(false);
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Alert.alert("Confirm Deletion", "Are you sure you want to delete this book?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: async () => {
          try {
            setLoading(true);
            await deleteBook(id);
            // Update local state after successful API call
            setBooks(books.filter((book) => book.id !== id));
            Alert.alert("Success", "Book deleted successfully");
          } catch (error) {
            console.error("Error deleting book:", error);
            Alert.alert("Error", "Failed to delete book. Please try again.");
          } finally {
            setLoading(false);
          }
        },
        style: "destructive",
      },
    ]);
  };

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.title || !formData.authorName || !formData.categoryId) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      let savedBook;

      if (isEditing) {
        // Update existing book
        savedBook = await updateBook(formData);
        // Update local state
        setBooks(books.map((book) => (book.id === formData.id ? savedBook : book)));
        Alert.alert("Success", "Book updated successfully");
      } else {
        // Create new book
        savedBook = await createBook(formData);
        // Update local state
        setBooks([...books, savedBook]);
        Alert.alert("Success", "Book created successfully");
      }

      setModalVisible(false);
    } catch (error) {
      console.error("Error saving book:", error);
      Alert.alert("Error", "Failed to save book. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add button press animation
  const handleAddButtonPress = () => {
    Animated.sequence([
      Animated.timing(addButtonAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(addButtonAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    handleAdd();
  };

  return (
    <SafeAreaView style={bookmanagestyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={bookmanagestyles.titleContainer}>
        <Text style={bookmanagestyles.screenTitle}>Book Management</Text>
      </View>

      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <SortHeader sortBy={sortBy} sortOrder={sortOrder} handleSort={handleSort} />

      {loading ? (
        <ActivityIndicator size="large" color="#5d7bff" style={bookmanagestyles.loader} />
      ) : (
        <>
          <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
            <BookList books={filteredBooks} handleEdit={handleEdit} handleDelete={handleDelete} />
          </Animated.View>

          <Animated.View
            style={[
              {
                transform: [
                  { scale: addButtonAnim },
                  {
                    translateY: addButtonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity style={bookmanagestyles.addButton} onPress={handleAddButtonPress}>
              <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>
          </Animated.View>
        </>
      )}

      <BookFormModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        formData={formData}
        handleChange={handleChange}
        handleSave={handleSave}
        categories={categories}
        tags={tags}
        isEditing={isEditing}
      />
    </SafeAreaView>
  );
};

export default BookManagementScreen;
