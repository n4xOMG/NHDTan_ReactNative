import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function BookDetail({ route, navigation }) {
  const { book } = route.params;
  const [isFav, setIsFav] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showFullDescription, setShowFullDescription] = useState(false);

  const handleFavorite = () => setIsFav(!isFav);
  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, newComment]);
      setNewComment("");
    }
  };

  // Function to toggle description visibility
  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  // Truncate description if it's too long
  const truncatedDescription = book.description?.length > 100 ? book.description.substring(0, 100) + "..." : book.description;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={localstyles.topBar}>
        <TouchableOpacity style={localstyles.backButton} onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={24} color="white" />
          <Text style={localstyles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={localstyles.container} contentContainerStyle={localstyles.contentContainer}>
        <View style={localstyles.card}>
          <Image source={{ uri: book.bookCover }} style={localstyles.bookCover} />
          <View style={localstyles.details}>
            <Text style={localstyles.title}>{book.title}</Text>
            <Text style={localstyles.author}>by {book.authorName || book.author?.name}</Text>
            <Text style={localstyles.category}>Category: {book.categoryName}</Text>

            {/* Description with Read More button */}
            <View>
              <Text style={localstyles.description}>{showFullDescription ? book.description : truncatedDescription}</Text>

              {book.description?.length > 100 && (
                <TouchableOpacity onPress={toggleDescription} style={localstyles.readMoreButton}>
                  <Text style={localstyles.readMoreText}>{showFullDescription ? "Show less" : "Read more"}</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity style={localstyles.favoriteButton} onPress={handleFavorite}>
              <AntDesign name={isFav ? "heart" : "hearto"} size={24} color="red" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={localstyles.commentSection}>
          <Text style={localstyles.commentTitle}>Comments</Text>
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <View key={index} style={localstyles.comment}>
                <Text>{comment}</Text>
              </View>
            ))
          ) : (
            <Text style={localstyles.noComments}>No comments yet. Be the first to comment!</Text>
          )}

          <View style={localstyles.commentInputContainer}>
            <TextInput
              style={localstyles.commentInput}
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Add a comment..."
              multiline
            />
            <TouchableOpacity style={localstyles.postButton} onPress={handleAddComment} disabled={!newComment.trim()}>
              <Text style={localstyles.postButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const localstyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  topBar: {
    backgroundColor: "#2c3e50",
    paddingTop: Platform.OS === "ios" ? 40 : 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  backText: {
    color: "white",
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "500",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookCover: {
    width: width * 0.3,
    height: width * 0.45,
    borderRadius: 8,
  },
  details: {
    flex: 1,
    marginLeft: 15,
    position: "relative",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  author: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
  category: {
    fontSize: 14,
    color: "#777",
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  readMoreButton: {
    marginTop: 5,
    alignSelf: "flex-start",
  },
  readMoreText: {
    color: "#3498db",
    fontWeight: "600",
  },
  favoriteButton: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 5,
  },
  commentSection: {
    marginTop: 25,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 10,
  },
  comment: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 5,
  },
  noComments: {
    fontStyle: "italic",
    color: "#888",
    textAlign: "center",
    padding: 20,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 15,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 20,
    maxHeight: 100,
    backgroundColor: "#f9f9f9",
  },
  postButton: {
    backgroundColor: "#3498db",
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginLeft: 10,
    borderRadius: 20,
  },
  postButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
