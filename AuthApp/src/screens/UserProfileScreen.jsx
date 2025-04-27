import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, SafeAreaView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useRoute, useNavigation } from "@react-navigation/native";
import { AntDesign, Feather, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { fetchUserProfile, toggleFollowUser, clearProfileView } from "../redux/slices/userSlice";
import { fetchUserPosts } from "../redux/slices/postSlice";
import PostCard from "../components/PostCard";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const UserProfileScreen = () => {
  const route = useRoute();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const { userId } = route.params;

  const userProfile = useSelector((state) => state.user.profileView);
  const userPosts = useSelector((state) => state.posts.userPosts[userId] || []);
  const loading = useSelector((state) => state.user.profileLoading);
  const error = useSelector((state) => state.user.profileError);
  const currentUser = useSelector((state) => state.auth.user);
  const isCurrentUser = currentUser && currentUser.id === parseInt(userId);

  useEffect(() => {
    loadUserData();

    return () => {
      dispatch(clearProfileView());
    };
  }, [userId]);

  useEffect(() => {
    if (userProfile) {
      navigation.setOptions({
        title: userProfile.fullname || userProfile.username,
      });
    }
  }, [userProfile]);

  const loadUserData = async () => {
    await Promise.all([dispatch(fetchUserProfile(userId)), dispatch(fetchUserPosts(userId))]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const handleFollowToggle = () => {
    dispatch(toggleFollowUser(userId));
  };

  const handleStartChat = () => {
    navigation.navigate("ChatScreen", { otherUserId: userId, username: userProfile.username });
  };

  if (loading && !userProfile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (error && !userProfile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error loading profile: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.centered}>
        <Text>User not found</Text>
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.profileContainer}>
      <View style={styles.profileHeader}>
        <Image source={{ uri: userProfile.avatarUrl || "https://via.placeholder.com/150" }} style={styles.avatar} />
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{userProfile.fullname}</Text>
          <Text style={styles.username}>@{userProfile.username}</Text>
          {userProfile.birthdate && (
            <Text style={styles.detail}>
              <FontAwesome5 name="birthday-cake" size={14} color="#666" /> {formatDate(userProfile.birthdate)}
            </Text>
          )}
        </View>
      </View>

      {userProfile.bio && <Text style={styles.bio}>{userProfile.bio}</Text>}

      <View style={styles.actionButtonsContainer}>
        {!isCurrentUser && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, userProfile.followedByCurrentUser ? styles.followingButton : styles.followButton]}
              onPress={handleFollowToggle}
            >
              <Text
                style={[styles.actionButtonText, userProfile.followedByCurrentUser ? styles.followingButtonText : styles.followButtonText]}
              >
                {userProfile.followedByCurrentUser ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.messageButton]} onPress={handleStartChat}>
              <MaterialIcons name="message" size={16} color="white" />
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.divider} />

      <Text style={styles.postsHeader}>Posts</Text>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Feather name="file-text" size={60} color="#ccc" />
      <Text style={styles.emptyText}>No posts yet</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={userPosts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <PostCard post={item} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={userPosts.length === 0 ? { flex: 1 } : null}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#e74c3c",
    marginBottom: 15,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  profileContainer: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  detail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  bio: {
    fontSize: 15,
    color: "#333",
    lineHeight: 20,
    marginBottom: 15,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  actionButtonText: {
    fontWeight: "bold",
    fontSize: 15,
  },
  followButton: {
    backgroundColor: "#3498db",
    marginRight: 5,
  },
  followButtonText: {
    color: "white",
  },
  followingButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 5,
  },
  followingButtonText: {
    color: "#333",
  },
  messageButton: {
    backgroundColor: "#2ecc71",
    marginLeft: 5,
  },
  messageButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 15,
  },
  postsHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 10,
  },
});

export default UserProfileScreen;
