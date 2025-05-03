import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Modal, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AntDesign, MaterialIcons, Entypo } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { toggleLikePost, removePost, updateExistingPost } from "../redux/slices/postSlice";

const { width } = Dimensions.get("window");

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "Unknown time";

  const now = new Date();
  const postDate = new Date(timestamp);
  const secondsAgo = Math.floor((now - postDate) / 1000);

  if (isNaN(secondsAgo)) return "Invalid date";

  if (secondsAgo < 60) {
    return `${secondsAgo} seconds ago`;
  } else if (secondsAgo < 3600) {
    const minutes = Math.floor(secondsAgo / 60);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  } else if (secondsAgo < 86400) {
    const hours = Math.floor(secondsAgo / 3600);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else if (secondsAgo < 604800) {
    const days = Math.floor(secondsAgo / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  } else {
    return postDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
};

const PostCard = ({ post }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [showOptions, setShowOptions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const currentUser = useSelector((state) => state.auth.user);

  // Check if current user is post owner or admin
  const canModifyPost = currentUser && (currentUser.id === post.user.id || (currentUser.role && currentUser.role.name === "ADMIN"));

  const handleLike = () => {
    dispatch(toggleLikePost(post.id));
  };

  const navigateToProfile = () => {
    navigation.navigate("UserProfile", { userId: post.user.id });
  };

  const navigateToDetail = () => {
    navigation.navigate("PostDetail", { postId: post.id });
  };

  const navigateToImageGallery = (index = 0) => {
    navigation.navigate("ImageGallery", {
      images: post.images,
      initialIndex: index,
    });
  };

  const navigateToEditPost = () => {
    setShowOptions(false);
    navigation.navigate("EditPost", { post });
  };

  const confirmDeletePost = () => {
    setShowOptions(false);
    setShowDeleteConfirm(true);
  };

  const handleDeletePost = () => {
    dispatch(removePost(post.id))
      .unwrap()
      .then(() => {
        setShowDeleteConfirm(false);
        Alert.alert("Success", "Post deleted successfully");
      })
      .catch((error) => {
        Alert.alert("Error", "Failed to delete post: " + error);
      });
  };
  const navigateToBookDetail = () => {
    if (post.postType === "BOOK_SHARE" && post.sharedBook?.id) {
      navigation.navigate("BookDetail", { bookId: post.sharedBook.id });
    }
  };
  const renderSharedBook = () => {
    if (post.postType !== "BOOK_SHARE" || !post.sharedBook) return null;

    return (
      <TouchableOpacity style={styles.sharedItemContainer} onPress={navigateToBookDetail} activeOpacity={0.8}>
        <View style={styles.sharedItemHeader}>
          <MaterialIcons name="menu-book" size={16} color="#3498db" />
          <Text style={styles.sharedItemType}>Book</Text>
        </View>

        <View style={styles.sharedBookContent}>
          <Image source={{ uri: post.sharedBook.bookCover }} style={styles.sharedBookCover} resizeMode="cover" />
          <View style={styles.sharedBookInfo}>
            <Text style={styles.sharedBookTitle} numberOfLines={2}>
              {post.sharedBook.title}
            </Text>
            <Text style={styles.sharedBookAuthor} numberOfLines={1}>
              by {post.sharedBook.authorName || "Unknown author"}
            </Text>
            {post.sharedBook.categoryName && <Text style={styles.sharedBookCategory}>{post.sharedBook.categoryName}</Text>}
            <Text style={styles.viewBookText}>
              View Book <AntDesign name="arrowright" size={12} />
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSharedChapter = () => {
    if (post.postType !== "CHAPTER_SHARE" || !post.sharedChapter) {
      console.log("Not rendering shared chapter: conditions not met");
      console.log("Post type:", post.postType);
      console.log("Shared chapter exists:", !!post.sharedChapter);
      return null;
    }

    console.log("Rendering shared chapter component for chapter:", post.sharedChapter);

    // Let's try a direct navigation approach for testing
    const handleChapterPress = () => {
      console.log("Chapter pressed - direct handler");

      if (post.sharedChapter?.id) {
        const chapterId = post.sharedChapter.id;
        const bookId = post.sharedChapter.bookId;

        console.log(`Attempting to navigate to ChapterDetail with chapterId=${chapterId}, bookId=${bookId}`);

        // Try direct navigation with delay to ensure logs are visible
        setTimeout(() => {
          navigation.navigate("ChapterDetail", {
            chapterId: chapterId,
            bookId: bookId,
          });
        }, 200);
      } else {
        console.log("Cannot navigate - missing chapter data", post.sharedChapter);
      }
    };

    return (
      <TouchableOpacity style={[styles.sharedItemContainer, { borderColor: "blue" }]} onPress={handleChapterPress} activeOpacity={0.5}>
        <View style={styles.sharedItemHeader}>
          <MaterialIcons name="bookmark" size={16} color="#3498db" />
          <Text style={styles.sharedItemType}>Chapter</Text>
        </View>

        <View style={styles.sharedChapterContent}>
          {post.sharedChapter.bookCover && (
            <Image source={{ uri: post.sharedChapter.bookCover }} style={styles.sharedBookCover} resizeMode="cover" />
          )}
          <View style={styles.sharedBookInfo}>
            <Text style={styles.sharedChapterNumber}>Chapter {post.sharedChapter.chapterNum}</Text>
            <Text style={styles.sharedChapterTitle} numberOfLines={2}>
              {post.sharedChapter.title}
            </Text>
            {post.sharedChapter.bookTitle && (
              <Text style={styles.sharedBookTitle} numberOfLines={1}>
                from "{post.sharedChapter.bookTitle}"
              </Text>
            )}
            <Text style={styles.viewChapterText}>
              Read Chapter <AntDesign name="arrowright" size={12} />
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPostImages = () => {
    if (!post.images || post.images.length === 0) return null;

    const imageCount = post.images.length;

    // For single image
    if (imageCount === 1) {
      return (
        <TouchableOpacity onPress={() => navigateToImageGallery(0)} activeOpacity={0.9} style={styles.singleImageWrapper}>
          <Image source={{ uri: post.images[0] }} style={styles.singleImage} resizeMode="cover" />
        </TouchableOpacity>
      );
    }

    // For two images
    if (imageCount === 2) {
      return (
        <View style={styles.rowImagesContainer}>
          {post.images.map((image, index) => (
            <TouchableOpacity key={index} onPress={() => navigateToImageGallery(index)} activeOpacity={0.9} style={styles.halfImageWrapper}>
              <Image source={{ uri: image }} style={styles.halfImage} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    // For three images
    if (imageCount === 3) {
      return (
        <View style={styles.multipleImagesContainer}>
          <TouchableOpacity onPress={() => navigateToImageGallery(0)} activeOpacity={0.9} style={styles.largeImageWrapper}>
            <Image source={{ uri: post.images[0] }} style={styles.largeImage} resizeMode="cover" />
          </TouchableOpacity>
          <View style={styles.smallImagesColumn}>
            {post.images.slice(1, 3).map((image, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigateToImageGallery(index + 1)}
                activeOpacity={0.9}
                style={styles.smallImageWrapper}
              >
                <Image source={{ uri: image }} style={styles.smallImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    // For four or more images
    return (
      <View style={styles.gridImagesContainer}>
        {post.images.slice(0, 4).map((image, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => navigateToImageGallery(index)}
            activeOpacity={0.9}
            style={styles.quarterImageWrapper}
          >
            <Image source={{ uri: image }} style={styles.quarterImage} resizeMode="cover" />
            {/* Show overlay with count on the last image if there are more than 4 images */}
            {index === 3 && imageCount > 4 && (
              <View style={styles.moreImagesOverlay}>
                <Text style={styles.moreImagesText}>+{imageCount - 4}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderPostOptions = () => {
    if (!canModifyPost) return null;

    return (
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionsButton} onPress={() => setShowOptions(!showOptions)}>
          <Entypo name="dots-three-vertical" size={16} color="#777" />
        </TouchableOpacity>

        {showOptions && (
          <View style={styles.optionsMenu}>
            {currentUser.id === post.user.id && (
              <TouchableOpacity style={styles.optionItem} onPress={navigateToEditPost}>
                <MaterialIcons name="edit" size={16} color="#333" />
                <Text style={styles.optionText}>Edit Post</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.optionItem} onPress={confirmDeletePost}>
              <MaterialIcons name="delete" size={16} color="#e74c3c" />
              <Text style={[styles.optionText, { color: "#e74c3c" }]}>Delete Post</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderDeleteConfirmation = () => {
    return (
      <Modal transparent={true} visible={showDeleteConfirm} animationType="fade" onRequestClose={() => setShowDeleteConfirm(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDeleteConfirm(false)}>
          <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delete Post</Text>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>Are you sure you want to delete this post? This action cannot be undone.</Text>
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setShowDeleteConfirm(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.deleteButton]} onPress={handleDeletePost}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigateToProfile} activeOpacity={0.7}>
          <Image source={{ uri: post.user.avatarUrl || "https://via.placeholder.com/150" }} style={styles.avatar} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <TouchableOpacity onPress={navigateToProfile} activeOpacity={0.7}>
            <Text style={styles.username}>{post.user.username}</Text>
          </TouchableOpacity>
          <Text style={styles.timestamp}>{formatTimeAgo(post.timestamp)}</Text>
        </View>
        {renderPostOptions()}
      </View>

      {post.content && <Text style={styles.content}>{post.content}</Text>}

      {renderSharedBook()}
      {renderSharedChapter()}

      {renderPostImages()}

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleLike} style={styles.likeButton}>
          <AntDesign name={post.likedByCurrentUser ? "heart" : "hearto"} size={20} color={post.likedByCurrentUser ? "#e74c3c" : "#777"} />
          <Text style={[styles.likeCount, post.likedByCurrentUser && styles.likedText]}>{post.likes || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={navigateToDetail} style={styles.commentButton}>
          <AntDesign name="message1" size={18} color="#777" />
          <Text style={styles.commentCount}>{post.commentCount || 0}</Text>
        </TouchableOpacity>
      </View>

      {renderDeleteConfirmation()}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
  },
  username: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  content: {
    fontSize: 15,
    lineHeight: 20,
    color: "#333",
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  likeCount: {
    marginLeft: 6,
    fontSize: 14,
    color: "#777",
  },
  likedText: {
    color: "#e74c3c",
  },
  commentButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentCount: {
    marginLeft: 6,
    fontSize: 14,
    color: "#777",
  },
  sharedItemContainer: {
    backgroundColor: "#f7f9fc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e6ecf5",
  },
  sharedItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sharedItemType: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: "bold",
    color: "#3498db",
  },
  sharedBookContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  sharedChapterContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  sharedBookCover: {
    width: 70,
    height: 100,
    borderRadius: 6,
    backgroundColor: "#eee",
  },
  sharedBookInfo: {
    flex: 1,
    marginLeft: 12,
  },
  sharedBookTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  sharedBookAuthor: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  sharedBookCategory: {
    fontSize: 12,
    color: "#777",
    marginBottom: 8,
  },
  sharedChapterNumber: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#3498db",
    marginBottom: 2,
  },
  sharedChapterTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  viewBookText: {
    fontSize: 13,
    color: "#3498db",
    fontWeight: "500",
  },
  viewChapterText: {
    fontSize: 13,
    color: "#3498db",
    fontWeight: "500",
  },
  // Single image
  singleImageWrapper: {
    width: "100%",
    height: 240,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  singleImage: {
    width: "100%",
    height: "100%",
  },

  // Two images in a row
  rowImagesContainer: {
    flexDirection: "row",
    width: "100%",
    height: 200,
    marginBottom: 12,
    gap: 4,
  },
  halfImageWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  halfImage: {
    width: "100%",
    height: "100%",
  },

  // Three images (one large, two small)
  multipleImagesContainer: {
    flexDirection: "row",
    width: "100%",
    height: 240,
    marginBottom: 12,
    gap: 4,
  },
  largeImageWrapper: {
    flex: 2,
    borderRadius: 12,
    overflow: "hidden",
  },
  largeImage: {
    width: "100%",
    height: "100%",
  },
  smallImagesColumn: {
    flex: 1,
    gap: 4,
  },
  smallImageWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  smallImage: {
    width: "100%",
    height: "100%",
  },

  // Four or more images in a grid
  gridImagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    height: 240,
    marginBottom: 12,
    gap: 2,
  },
  quarterImageWrapper: {
    width: "49.5%",
    height: "49.5%",
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  quarterImage: {
    width: "100%",
    height: "100%",
  },
  moreImagesOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  moreImagesText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  optionsContainer: {
    position: "relative",
  },
  optionsButton: {
    padding: 8,
  },
  optionsMenu: {
    position: "absolute",
    top: 30,
    right: 0,
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    width: 140,
    zIndex: 10,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
  },
  modalHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalBody: {
    padding: 20,
  },
  modalText: {
    fontSize: 16,
    color: "#444",
    lineHeight: 22,
  },
  modalFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  modalButton: {
    flex: 1,
    padding: 15,
    alignItems: "center",
  },
  cancelButton: {
    borderRightWidth: 1,
    borderRightColor: "#f0f0f0",
  },
  deleteButton: {
    backgroundColor: "#fff",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  deleteButtonText: {
    fontSize: 16,
    color: "#e74c3c",
    fontWeight: "bold",
  },
});

export default PostCard;
