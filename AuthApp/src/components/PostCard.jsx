import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import { likePost } from "../services/PostServices";

const PostCard = ({ post }) => {
  const navigation = useNavigation();
  const [liked, setLiked] = React.useState(post.isLikedByCurrentUser || false);
  const [likesCount, setLikesCount] = React.useState(post.likes || 0);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleLike = async () => {
    try {
      const updatedPost = await likePost(post.id);
      setLiked(updatedPost.isLikedByCurrentUser);
      setLikesCount(updatedPost.likes);
    } catch (error) {
      console.error("Error liking post:", error);
      Alert.alert("Error", "Failed to like post");
    }
  };

  const handleCommentPress = () => {
    navigation.navigate("PostDetail", { postId: post.id });
  };

  const handleSharePress = () => {
    // Navigate to share screen or open share dialog
    Alert.alert("Share", "Share functionality coming soon!");
  };

  const handleUserPress = () => {
    navigation.navigate("UserProfile", { userId: post.user.id });
  };

  const handlePostPress = () => {
    navigation.navigate("PostDetail", { postId: post.id });
  };

  return (
    <View style={styles.card}>
      {/* Post Header with user info */}
      <TouchableOpacity style={styles.header} onPress={handleUserPress}>
        <Image source={{ uri: post.user.avatarUrl || "https://via.placeholder.com/40" }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{post.user.username}</Text>
          <Text style={styles.timestamp}>{formatDate(post.timestamp)}</Text>
        </View>
      </TouchableOpacity>

      {/* Post Content */}
      <TouchableOpacity onPress={handlePostPress} activeOpacity={0.9}>
        <Text style={styles.content}>{post.content}</Text>

        {/* Post Images (if any) */}
        {post.images && post.images.length > 0 && (
          <View style={styles.imageContainer}>
            {post.images.length === 1 ? (
              <Image source={{ uri: post.images[0] }} style={styles.singleImage} />
            ) : (
              <View style={styles.imageGrid}>
                {post.images.slice(0, 4).map((img, index) => (
                  <Image key={index} source={{ uri: img }} style={styles.gridImage} />
                ))}
                {post.images.length > 4 && (
                  <View style={styles.moreImagesOverlay}>
                    <Text style={styles.moreImagesText}>+{post.images.length - 4}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Shared Post (if any) */}
        {post.sharedPostId && (
          <View style={styles.sharedPost}>
            <View style={styles.sharedHeader}>
              <Text style={styles.sharedUsername}>{post.sharedPostUser.username}</Text>
            </View>
            <Text style={styles.sharedContent}>{post.sharedPostContent}</Text>
            {post.sharePostImages && post.sharePostImages.length > 0 && (
              <Image source={{ uri: post.sharePostImages[0] }} style={styles.sharedImage} />
            )}
          </View>
        )}
      </TouchableOpacity>

      {/* Post Stats */}
      <View style={styles.stats}>
        <Text style={styles.statsText}>
          {likesCount} {likesCount === 1 ? "like" : "likes"} • {post.comments?.length || 0}{" "}
          {post.comments?.length === 1 ? "comment" : "comments"}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Icon name={liked ? "heart" : "heart-o"} size={20} color={liked ? "#e74c3c" : "#555"} />
          <Text style={[styles.actionText, liked && styles.likedText]}>Like</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleCommentPress}>
          <Icon name="comment-o" size={20} color="#555" />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleSharePress}>
          <Icon name="share" size={20} color="#555" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontWeight: "bold",
    fontSize: 15,
  },
  timestamp: {
    color: "#666",
    fontSize: 12,
  },
  content: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    fontSize: 15,
    lineHeight: 22,
  },
  imageContainer: {
    width: "100%",
  },
  singleImage: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    height: 200,
  },
  gridImage: {
    width: "50%",
    height: "50%",
    resizeMode: "cover",
  },
  moreImagesOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: "50%",
    height: "50%",
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  moreImagesText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  sharedPost: {
    margin: 12,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  sharedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sharedUsername: {
    fontWeight: "bold",
    fontSize: 14,
  },
  sharedContent: {
    fontSize: 14,
    marginBottom: 8,
  },
  sharedImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    resizeMode: "cover",
  },
  stats: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  statsText: {
    color: "#666",
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    padding: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#555",
  },
  likedText: {
    color: "#e74c3c",
  },
});

export default PostCard;
