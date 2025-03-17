import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import { BookItem } from "../components/HomePage/BookItem";
import { CategoriesList } from "../components/HomePage/CategoriesList";
import { NavigationBar } from "../components/HomePage/NavigationBar";
import { Slideshow } from "../components/HomePage/Slideshow";
import { TopLikedBooks } from "../components/HomePage/TopLikedBooks";
import TopBarNavigation from "../components/HomePage/TopBarNavigation";
import { getBooks, getTop10LikedBooks } from "../services/BookServices";
import { styles } from "../style/styles";
import debounce from "lodash/debounce";

const HomeScreen = () => {
  const [books, setBooks] = useState([]);
  const [top10LikedBooks, setTop10LikedBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(""); // Track search query

  useEffect(() => {
    loadBooks();
    loadTop10LikedBooks();
  }, []);

  const loadTop10LikedBooks = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await getTop10LikedBooks();
      setTop10LikedBooks((prev) => [...prev, ...response]);
    } catch (error) {
      console.error("Error loading top 10 liked books:", error);
    }
    setLoading(false);
  };

  const loadBooks = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await getBooks(page);
      console.log("Books response for page", page, ":", response);
      setBooks((prev) => {
        const newBooks = response.filter((book) => !prev.some((existing) => existing.id === book.id));
        const updatedBooks = [...prev, ...newBooks];
        console.log("Updated books:", updatedBooks);
        // Only update filteredBooks if no search query is active
        setFilteredBooks(searchQuery ? filteredBooks : updatedBooks);
        return updatedBooks;
      });
      setPage(page + 1);
    } catch (error) {
      console.error("Error loading books:", error);
    }
    setLoading(false);
  };

  const slideshowBooks = books.slice(0, 5);

  const handleSearchDebounced = useCallback(
    debounce((query) => {
      setSearchQuery(query); // Update search query state
      if (query.trim() === "") {
        setFilteredBooks(books);
      } else {
        const filtered = books.filter((book) => book.title.toLowerCase().includes(query.toLowerCase()));
        setFilteredBooks(filtered);
      }
    }, 300),
    [books]
  );

  const handleSearch = (query) => {
    handleSearchDebounced(query);
  };

  return (
    <View style={styles.container}>
      <TopBarNavigation onSearch={handleSearch} />
      <FlatList
        ListHeaderComponent={() => (
          <>
            <Slideshow books={slideshowBooks} />
            <CategoriesList />
            <TopLikedBooks top10LikedBooks={top10LikedBooks} />
          </>
        )}
        data={filteredBooks}
        renderItem={({ item }) => <BookItem book={item} />}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={searchQuery ? null : loadBooks} // Disable lazy loading during search
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="large" color="#0000ff" /> : null}
      />
      <NavigationBar />
    </View>
  );
};

export default HomeScreen;
