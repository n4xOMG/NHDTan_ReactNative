import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image, Alert, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useDispatch, useSelector } from "react-redux";
import { createNewPost } from "../redux/slices/postSlice";
import * as ImagePicker from "expo-image-picker";
import UploadToCloudinary from "../utils/uploadToCloudinary";

const CreatePostCard = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.posts);
  const { user } = useSelector((state) => state.auth);

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission needed", "Please allow access to your photo library");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets) {
        // Limit to 4 images max
        const newImages = result.assets;
        const allImages = [...selectedImages, ...newImages];

        if (allImages.length > 4) {
          Alert.alert("Limit Exceeded", "You can only select up to 4 images.");
          setSelectedImages(allImages.slice(0, 4));
        } else {
          setSelectedImages(allImages);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const removeImage = (index) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
  };

  const uploadImages = async () => {
    try {
      const uploadPromises = selectedImages.map(async (image, index) => {
        const uploadedUrl = await UploadToCloudinary(image, "social_posts");
        // Update progress as each image uploads
        setUploadProgress(((index + 1) / selectedImages.length) * 100);
        return uploadedUrl;
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Error uploading images:", error);
      throw new Error("Failed to upload images");
    }
  };

  const handleCreatePost = async () => {
    if (!content.trim() && selectedImages.length === 0) {
      Alert.alert("Empty Post", "Please add some text or images to create a post.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      let imageUrls = [];

      // Only upload if there are images
      if (selectedImages.length > 0) {
        imageUrls = await uploadImages();
      }

      const postData = {
        content: content.trim(),
        images: imageUrls,
      };

      await dispatch(createNewPost(postData)).unwrap();

      // Reset form
      setContent("");
      setSelectedImages([]);
      setUploadProgress(0);

      // Notify parent component
      if (onPostCreated) onPostCreated();
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "Failed to create post. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: user?.avatarUrl || "https://via.placeholder.com/40" }} style={styles.avatar} />
        <TextInput style={styles.input} placeholder="What's on your mind?" multiline value={content} onChangeText={setContent} />
      </View>

      {selectedImages.length > 0 && (
        <View style={styles.imagePreviewContainer}>
          {selectedImages.map((image, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri: image.uri }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                <Icon name="close-circle" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {uploading && uploadProgress > 0 && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
          <Text style={styles.progressText}>Uploading images: {Math.round(uploadProgress)}%</Text>
        </View>
      )}

      <View style={styles.divider} />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={pickImage} disabled={uploading}>
          <Icon name="image" size={22} color="#4CAF50" />
          <Text style={styles.actionText}>Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.postButton,
            !content.trim() && selectedImages.length === 0 && styles.disabledButton,
            uploading && styles.uploadingButton,
          ]}
          onPress={handleCreatePost}
          disabled={loading || uploading || (!content.trim() && selectedImages.length === 0)}
        >
          {loading || uploading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color="#fff" />
              {uploading && <Text style={styles.uploadingText}>Uploading...</Text>}
            </View>
          ) : (
            <Text style={styles.postButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 10,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#f0f2f5",
    fontSize: 16,
  },
  imagePreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    justifyContent: "flex-start",
  },
  imageWrapper: {
    position: "relative",
    margin: 4,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
  },
  progressContainer: {
    height: 20,
    width: "100%",
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    marginTop: 10,
    overflow: "hidden",
    position: "relative",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#2196F3",
  },
  progressText: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#f0f2f5",
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#444",
  },
  postButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#90CAF9",
  },
  uploadingButton: {
    backgroundColor: "#64B5F6",
  },
  postButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  loaderContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  uploadingText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
    marginLeft: 5,
  },
});

export default CreatePostCard;
