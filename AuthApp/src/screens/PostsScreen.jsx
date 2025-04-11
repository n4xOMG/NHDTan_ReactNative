import React, { useState, useEffect, useCallback } from "react";
import { View, FlatList, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import PostCard from "../components/PostCard";
import CreatePostCard from "../components/CreatePostCard";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts, clearPosts, setRefreshing } from "../redux/slices/postSlice";

const PostsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { posts, loading, error, page, hasMore, refreshing } = useSelector((state) => state.posts);

  // Use useCallback to prevent function recreation on each render
  const loadPosts = useCallback(
    async (refresh = false) => {
      // Don't load if already loading or no more data (unless refreshing)
      if (loading || (!hasMore && !refresh)) return;

      try {
        if (refresh) {
          dispatch(clearPosts());
          dispatch(setRefreshing(true));
        }

        await dispatch(
          fetchPosts({
            page: refresh ? 0 : page,
            size: 10,
            sort: "timestamp,desc",
          })
        ).unwrap();
      } catch (err) {
        console.error("Error in loadPosts:", err);
      }
    },
    [dispatch, loading, page, hasMore]
  );

  // Initial load
  useEffect(() => {
    loadPosts(true);
  }, []);

  const handleRefresh = () => {
    if (refreshing) return;
    loadPosts(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadPosts();
    }
  };

  const handlePostCreated = () => {
    // Refresh posts after a new post has been created
    loadPosts(true);
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loaderFooter}>
        <ActivityIndicator size="small" color="#2196F3" />
      </View>
    );
  };

  // Header with title and Create Post button
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Posts</Text>
      <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate("CreatePost")}>
        <Icon name="pencil-plus" size={24} color="#2196F3" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      {error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={60} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadPosts(true)}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={({ item }) => <PostCard post={item} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={<CreatePostCard onPostCreated={handlePostCreated} />}
          ListFooterComponent={renderFooter}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyContainer}>
                <Icon name="post-outline" size={60} color="#aaa" />
                <Text style={styles.emptyText}>No posts yet</Text>
                <Text style={styles.emptySubtext}>Posts from users you follow will appear here</Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f8ff",
  },
  listContainer: {
    padding: 10,
    paddingBottom: 70, // Space for bottom navigation
    flexGrow: 1, // Ensures empty state fills screen
  },
  loaderFooter: {
    padding: 10,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#888",
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 5,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 15,
    marginBottom: 20,
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
});

export default PostsScreen;
