import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator } from "react-native";
import { useDispatch } from "react-redux";
import { updateExistingPost } from "../redux/slices/postSlice";
import Icon from "react-native-vector-icons/FontAwesome";

const EditPostScreen = ({ route, navigation }) => {
  const { post } = route.params;
  const [content, setContent] = useState(post.content);
  const [images, setImages] = useState(post.images || []);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleUpdatePost = async () => {
    if (!content.trim()) {
      Alert.alert("Error", "Post content cannot be empty");
      return;
    }

    try {
      setIsLoading(true);
      const updatedPostData = { content, images };
      await dispatch(updateExistingPost({ postId: post.id, postData: updatedPostData })).unwrap();
      Alert.alert("Success", "Post updated successfully");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating post:", error);
      Alert.alert("Error", "Failed to update post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Post</Text>
        <TouchableOpacity
          style={[styles.postButton, !content.trim() && styles.disabledButton]}
          onPress={handleUpdatePost}
          disabled={!content.trim() || isLoading}
        >
          <Text style={styles.postButtonText}>Update</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <TextInput style={styles.input} multiline value={content} onChangeText={setContent} placeholder="What's on your mind?" autoFocus />

        {images.length > 0 && (
          <View style={styles.imagePreviewContainer}>
            {images.map((image, index) => (
              <View key={index} style={styles.imagePreview}>
                <Image source={{ uri: image }} style={styles.previewImage} />
                <TouchableOpacity style={styles.removeImageButton} onPress={() => handleRemoveImage(index)}>
                  <Icon name="times" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0066cc" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  postButton: {
    backgroundColor: "#1877f2",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  postButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  input: {
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  imagePreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 15,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginRight: 10,
    marginBottom: 10,
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EditPostScreen;
