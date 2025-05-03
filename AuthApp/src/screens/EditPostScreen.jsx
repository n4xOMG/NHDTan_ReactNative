import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { updateExistingPost } from "../redux/slices/postSlice";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import UploadToCloudinary from "../utils/uploadToCloudinary";
import NetInfo from "@react-native-community/netinfo";

const EditPostScreen = ({ route }) => {
  const { post } = route.params;
  const [content, setContent] = useState(post.content || "");
  const [images, setImages] = useState(post.images || []);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [networkStatus, setNetworkStatus] = useState(null);

  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Determine if the post is a shared type (book or chapter share)
  const isSharedPost = post.postType === "BOOK_SHARE" || post.postType === "CHAPTER_SHARE";

  useEffect(() => {
    // Request permissions when component mounts
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "We need access to your media library to upload images.");
      }
    })();
  }, []);

  useEffect(() => {
    // Check network connectivity
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkStatus(state);
      if (!state.isConnected) {
        Alert.alert("No Internet Connection", "You need an active internet connection to upload images.");
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const pickImage = async () => {
    try {
      // Check connectivity first
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        Alert.alert("No Internet Connection", "You need an active internet connection to upload images.");
        return;
      }

      // Maximum of 4 images can be selected
      const maxImages = 4 - images.length;

      if (maxImages <= 0) {
        Alert.alert("Maximum Images", "You can only have up to 4 images per post.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: maxImages,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Process assets to make sure they're valid
        const validAssets = result.assets.filter(
          (asset) => asset.uri && (asset.uri.startsWith("file://") || asset.uri.startsWith("content://"))
        );

        if (validAssets.length === 0) {
          Alert.alert("Error", "Could not process the selected images.");
          return;
        }

        // Store the selected image files for later upload
        setNewImageFiles((prevFiles) => [...prevFiles, ...validAssets]);

        // Show preview of the selected images
        const previews = validAssets.map((asset) => asset.uri);
        setImages((prevImages) => [...prevImages, ...previews]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image from gallery");
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    // If this was a new image, also remove it from the newImageFiles array
    if (index >= post.images.length) {
      const newIndex = index - post.images.length;
      const updatedFiles = [...newImageFiles];
      updatedFiles.splice(newIndex, 1);
      setNewImageFiles(updatedFiles);
    }
  };

  const uploadImages = async () => {
    if (newImageFiles.length === 0) return [];

    // Check network connectivity before attempting upload
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      throw new Error("No internet connection available. Please check your connection and try again.");
    }

    try {
      setUploadingImages(true);
      const uploadedUrls = [];
      let failedUploads = 0;

      // Upload each new image to Cloudinary
      for (const file of newImageFiles) {
        try {
          const imageUrl = await UploadToCloudinary(file, "book_app/posts");
          if (imageUrl) {
            uploadedUrls.push(imageUrl);
          } else {
            failedUploads++;
          }
        } catch (error) {
          console.error("Error uploading specific image:", error);
          failedUploads++;
        }
      }

      if (failedUploads > 0) {
        if (uploadedUrls.length === 0) {
          throw new Error(`Failed to upload all images. Please try again later.`);
        } else {
          // Some uploads succeeded, continue but with a warning
          Alert.alert(
            "Partial Upload",
            `${failedUploads} image(s) failed to upload. You can continue with the successfully uploaded images or try again.`
          );
        }
      }

      return uploadedUrls;
    } catch (error) {
      console.error("Error uploading images:", error);
      throw new Error(`Failed to upload images: ${error.message}`);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async () => {
    // Check network connectivity
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      Alert.alert("No Internet Connection", "You need an active internet connection to update your post.");
      return;
    }

    if (!content.trim() && images.length === 0) {
      Alert.alert("Error", "Please add content or images to your post");
      return;
    }

    setLoading(true);
    try {
      let finalImages = [];

      if (isSharedPost) {
        // For shared posts, we don't modify images, use original
        finalImages = post.images || [];
      } else {
        // Keep original images that weren't removed
        const keptOriginalImages = post.images ? post.images.filter((img) => images.includes(img)) : [];

        if (newImageFiles.length > 0) {
          try {
            // Upload new images if there are any
            const newUploadedUrls = await uploadImages();
            // Combine kept original images with newly uploaded ones
            finalImages = [...keptOriginalImages, ...newUploadedUrls];
          } catch (error) {
            // If upload fails but we have the original images, we can still update
            if (keptOriginalImages.length > 0 || content.trim()) {
              finalImages = keptOriginalImages;
              Alert.alert("Warning", `Could not upload new images: ${error.message}. Your post will be updated with existing images only.`);
            } else {
              throw error; // Re-throw if we don't have anything to save
            }
          }
        } else {
          finalImages = keptOriginalImages;
        }
      }

      const postData = {
        content: content.trim(),
        images: finalImages,
        // Preserve these fields for shared posts
        postType: post.postType,
        sharedPostId: post.sharedPostId,
        sharedBook: post.sharedBook,
        sharedChapter: post.sharedChapter,
      };

      await dispatch(updateExistingPost({ postId: post.id, postData })).unwrap();
      Alert.alert("Success", "Post updated successfully");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", `Failed to update post: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : null}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <View style={styles.container}>
        {/* Network warning banner */}
        {networkStatus && !networkStatus.isConnected && (
          <View style={styles.networkWarning}>
            <MaterialIcons name="signal-wifi-off" size={16} color="#e74c3c" />
            <Text style={styles.networkWarningText}>No internet connection</Text>
          </View>
        )}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntDesign name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Post</Text>
          <TouchableOpacity
            style={[styles.postButton, !content.trim() && images.length === 0 && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading || uploadingImages || (!content.trim() && images.length === 0)}
          >
            {loading || uploadingImages ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.postButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Post title banner for shared items */}
          {post.postType === "BOOK_SHARE" && (
            <View style={styles.sharedItemBanner}>
              <MaterialIcons name="menu-book" size={16} color="#3498db" />
              <Text style={styles.sharedItemText}>Sharing a book - only content can be edited</Text>
            </View>
          )}

          {post.postType === "CHAPTER_SHARE" && (
            <View style={styles.sharedItemBanner}>
              <MaterialIcons name="bookmark" size={16} color="#3498db" />
              <Text style={styles.sharedItemText}>Sharing a chapter - only content can be edited</Text>
            </View>
          )}

          <TextInput
            style={styles.input}
            placeholder="What's on your mind?"
            multiline
            value={content}
            onChangeText={setContent}
            autoFocus
            maxLength={500}
          />

          {/* Only show image upload button for standard posts */}
          {!isSharedPost && (
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
              <AntDesign name="picture" size={20} color="#3498db" />
              <Text style={styles.imagePickerText}>Add Images</Text>
            </TouchableOpacity>
          )}

          {images.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              {images.map((image, index) => (
                <View key={index} style={styles.imagePreview}>
                  <Image source={{ uri: image }} style={styles.previewImage} resizeMode="cover" />
                  {/* Only allow removing images for standard posts, or new images for all posts */}
                  {(!isSharedPost || index >= post.images?.length) && (
                    <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                      <AntDesign name="closecircle" size={20} color="white" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}

          {uploadingImages && (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="small" color="#3498db" />
              <Text style={styles.uploadingText}>Uploading images... This may take a moment</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  postButton: {
    backgroundColor: "#3498db",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  postButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  input: {
    fontSize: 16,
    lineHeight: 24,
    padding: 0,
    marginBottom: 16,
    minHeight: 100,
  },
  imagePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#deebf7",
    marginBottom: 16,
  },
  imagePickerText: {
    marginLeft: 8,
    color: "#3498db",
    fontWeight: "500",
  },
  imagePreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  imagePreview: {
    width: "31%",
    aspectRatio: 1,
    margin: "1%",
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
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    padding: 2,
  },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 16,
  },
  uploadingText: {
    marginLeft: 8,
    color: "#3498db",
  },
  sharedItemBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f7f9fc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e6ecf5",
    marginBottom: 16,
  },
  sharedItemText: {
    marginLeft: 8,
    color: "#3498db",
    fontWeight: "500",
    fontSize: 14,
  },
  networkWarning: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    backgroundColor: "#ffebee",
    borderBottomWidth: 1,
    borderBottomColor: "#ffcdd2",
  },
  networkWarningText: {
    marginLeft: 8,
    color: "#e74c3c",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default EditPostScreen;
