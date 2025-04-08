import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState, useRef } from "react";
import { ActivityIndicator, Alert, SafeAreaView, StatusBar, Text, TouchableOpacity, View, Animated } from "react-native";
import { getBooks } from "../../services/BookServices";
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
  const [currentBook, setCurrentBook] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortBy, setSortBy] = useState("title");

  // For the edit/add modal
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookDescription, setBookDescription] = useState("");
  const [bookCategory, setBookCategory] = useState("");
  const [bookLanguage, setBookLanguage] = useState("");
  const [bookStatus, setBookStatus] = useState("");
  const [bookImage, setBookImage] = useState("");

  // Add animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const addButtonAnim = useRef(new Animated.Value(0)).current;

  // Fetch books from API
  useEffect(() => {
    fetchBooks();
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
    setCurrentBook(book);
    setBookTitle(book.title || "");
    setBookAuthor(book.authorName || "");
    setBookDescription(book.description || "");
    setBookCategory(book.categoryName || "");
    setBookLanguage(book.language || "");
    setBookStatus(book.status || "");
    setBookImage(book.bookCover || "");
    setModalVisible(true);
  };

  const handleAdd = () => {
    setCurrentBook(null);
    setBookTitle("");
    setBookAuthor("");
    setBookDescription("");
    setBookCategory("");
    setBookLanguage("");
    setBookStatus("");
    setBookImage("");
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
        onPress: () => {
          // Delete logic here - would be API call in real app
          // For now we'll just update the local state
          setBooks(books.filter((book) => book.id !== id));
        },
        style: "destructive",
      },
    ]);
  };

  const handleSave = () => {
    if (!bookTitle || !bookAuthor || !bookCategory) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const updatedBook = {
      id: currentBook ? currentBook.id : Date.now(),
      title: bookTitle,
      authorName: bookAuthor,
      description: bookDescription,
      categoryName: bookCategory,
      language: bookLanguage,
      status: bookStatus,
      bookCover: bookImage || null,
      // Preserve other fields if editing an existing book
      ...(currentBook && {
        viewCount: currentBook.viewCount,
        favCount: currentBook.favCount,
        avgRating: currentBook.avgRating,
        ratingCount: currentBook.ratingCount,
        chapterCount: currentBook.chapterCount,
        latestChapterNumber: currentBook.latestChapterNumber,
      }),
    };

    if (currentBook) {
      // Edit existing book
      setBooks(books.map((book) => (book.id === currentBook.id ? updatedBook : book)));
    } else {
      // Add new book
      setBooks([...books, updatedBook]);
    }

    setModalVisible(false);
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
        currentBook={currentBook}
        bookTitle={bookTitle}
        setBookTitle={setBookTitle}
        bookAuthor={bookAuthor}
        setBookAuthor={setBookAuthor}
        bookDescription={bookDescription}
        setBookDescription={setBookDescription}
        bookCategory={bookCategory}
        setBookCategory={setBookCategory}
        bookLanguage={bookLanguage}
        setBookLanguage={setBookLanguage}
        bookStatus={bookStatus}
        setBookStatus={setBookStatus}
        bookImage={bookImage}
        setBookImage={setBookImage}
        handleSave={handleSave}
      />
    </SafeAreaView>
  );
};

export default BookManagementScreen;
