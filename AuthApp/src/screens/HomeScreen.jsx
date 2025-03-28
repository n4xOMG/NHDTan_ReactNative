import React, { useCallback, useEffect } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { BookItem } from "../components/HomePage/BookItem";
import { CategoriesList } from "../components/HomePage/CategoriesList";
import { NavigationBar } from "../components/HomePage/NavigationBar";
import { Slideshow } from "../components/HomePage/Slideshow";
import { TopLikedBooks } from "../components/HomePage/TopLikedBooks";
import TopBarNavigation from "../components/HomePage/TopBarNavigation";
import { fetchBooks, fetchTop10LikedBooks, setSearchQuery } from "../redux/slices/bookSlice";
import { styles } from "../style/styles";
import debounce from "lodash/debounce";
import { getProfileFromToken } from "../redux/slices/authSlice";

const HomeScreen = () => {
  const dispatch = useDispatch();
  const { books, top10LikedBooks, filteredBooks, loading, page, searchQuery } = useSelector((state) => state.books);

  useEffect(() => {
    dispatch(getProfileFromToken());
    dispatch(fetchBooks(page));
    dispatch(fetchTop10LikedBooks());
  }, [dispatch]);

  const loadMoreBooks = () => {
    if (!loading && !searchQuery) {
      dispatch(fetchBooks(page));
    }
  };

  const slideshowBooks = books.slice(0, 5);

  const handleSearchDebounced = useCallback(
    debounce((query) => {
      dispatch(setSearchQuery(query));
    }, 300),
    [dispatch]
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
        onEndReached={loadMoreBooks}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="large" color="#0000ff" /> : null}
      />
      <NavigationBar />
    </View>
  );
};

export default HomeScreen;
