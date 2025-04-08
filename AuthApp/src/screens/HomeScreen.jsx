import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, View, StatusBar, SafeAreaView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { BookItem } from "../components/HomePage/BookItem";
import { CategoriesList } from "../components/HomePage/CategoriesList";
import { NavigationBar } from "../components/HomePage/NavigationBar";
import { Slideshow } from "../components/HomePage/Slideshow";
import { TopLikedBooks } from "../components/HomePage/TopLikedBooks";
import TopBarNavigation from "../components/HomePage/TopBarNavigation";
import { fetchBooks, fetchTop10LikedBooks, setSearchQuery } from "../redux/slices/bookSlice";
import { modernStyles } from "../style/modernStyles";
import debounce from "lodash/debounce";
import { getProfileFromToken } from "../redux/slices/authSlice";

const HomeScreen = () => {
  const dispatch = useDispatch();
  const { books, top10LikedBooks, filteredBooks, loading, page, searchQuery } = useSelector((state) => state.books);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchBooks(1)).then(() => setRefreshing(false));
    dispatch(fetchTop10LikedBooks());
  }, [dispatch]);

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
    <SafeAreaView style={modernStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <TopBarNavigation onSearch={handleSearch} />
      <FlatList
        contentContainerStyle={modernStyles.contentContainer}
        ListHeaderComponent={() => (
          <View style={modernStyles.headerContainer}>
            <Slideshow books={slideshowBooks} />
            <CategoriesList />
            <TopLikedBooks top10LikedBooks={top10LikedBooks} />
          </View>
        )}
        data={filteredBooks}
        renderItem={({ item }) => <BookItem book={item} />}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={loadMoreBooks}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListFooterComponent={
          loading ? (
            <View style={modernStyles.loaderContainer}>
              <ActivityIndicator size="large" color="#3498db" />
            </View>
          ) : null
        }
      />
      <NavigationBar />
    </SafeAreaView>
  );
};

export default HomeScreen;
