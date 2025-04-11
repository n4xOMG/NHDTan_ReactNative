import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addNewBook, editBook } from "../../redux/slices/userBooksSlice";
import { colors } from "../../style/modernStyles";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import TagSelector from "../../components/TagSelector";
import { getAllTags, getAllCategories, getTagsByBook } from "../../services/BookMetadataServices";
import UploadToCloudinary from "../../utils/uploadToCloudinary";

const STATUSES = ["ONGOING", "COMPLETED", "HIATUS", "CANCELLED"];
const LANGUAGES = ["English", "Vietnamese", "Japanese", "Korean", "Chinese", "Other"];

const BookEditorScreen = ({ route }) => {
  const { book, isEditing = false } = route.params || {};
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.userBooks);
  const { user } = useSelector((state) => state.auth);

  // Form state
  const [formData, setFormData] = useState({
    id: book?.id || null,
    title: book?.title || "",
    author: book?.author || user?.username || "",
    authorName: book?.authorName || user?.username || null,
    description: book?.description || "",
    bookCover: book?.bookCover || "",
    language: book?.language || "English",
    status: book?.status || "ONGOING",
    categoryId: book?.categoryId || 1,
    tagIds: book?.tagIds || [],
  });

  // Metadata states
  const [coverImage, setCoverImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [errors, setErrors] = useState({});
  const [metadataLoading, setMetadataLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch categories and tags on component mount
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        setMetadataLoading(true);
        const [tagsData, categoriesData] = await Promise.all([getAllTags(), getAllCategories()]);

        setTags(tagsData || []);
        setCategories(categoriesData || []);

        if (isEditing && book?.id) {
          try {
            const bookTags = await getTagsByBook(book.id);
            if (bookTags && Array.isArray(bookTags)) {
              // Extract tag IDs if they aren't already in the book object
              if (!book.tagIds || book.tagIds.length === 0) {
                setFormData((prev) => ({
                  ...prev,
                  tagIds: bookTags.map((tag) => tag.id),
                }));
              }
            }
          } catch (error) {
            console.error("Error fetching book tags:", error);
          }
        }
      } catch (error) {
        console.error("Error loading metadata:", error);
        Alert.alert("Error", "Failed to load categories and tags");
      } finally {
        setMetadataLoading(false);
      }
    };

    loadMetadata();

    navigation.setOptions({
      title: isEditing ? "Edit Book" : "Create New Book",
    });
  }, [navigation, isEditing, book?.id]);

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });

    // Clear validation error when field is edited
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }

    if (!isEditing && !formData.bookCover && !coverImage) {
      newErrors.bookCover = "Book cover is required";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    try {
      // Request permissions first (may be needed on some devices)
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission Required", "Please grant camera roll permissions to change the book cover");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        // Fix: Remove the incorrect MediaType.Images reference
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [2, 3],
        quality: 0.8,
      });

      console.log("Image picker result:", result);

      if (!result.canceled && result.assets && result.assets[0]) {
        console.log("Selected image URI:", result.assets[0].uri);
        setCoverImage(result.assets[0].uri);
        setErrors({
          ...errors,
          bookCover: null,
        });

        // Add visual feedback
        Alert.alert("Success", "Book cover image selected successfully");
      } else {
        console.log("Image selection was cancelled or failed");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      let imageUrl = formData.bookCover;

      // If a new image was selected, upload it to Cloudinary
      if (coverImage) {
        setUploadingImage(true);
        try {
          imageUrl = await UploadToCloudinary({ uri: coverImage }, "book_covers");
          if (!imageUrl) {
            throw new Error("Failed to upload image");
          }
        } catch (err) {
          Alert.alert("Upload Error", "Failed to upload book cover. Please try again.");
          setUploadingImage(false);
          return;
        }
        setUploadingImage(false);
      }

      const bookData = {
        ...formData,
        bookCover: imageUrl,
      };

      if (!isEditing) {
        bookData.author = {
          id: user.id,
          username: user.username,
        };
        // Keep authorName as a string for display purposes
        bookData.authorName = user.username;
      }

      if (isEditing) {
        dispatch(editBook(bookData))
          .unwrap()
          .then(() => {
            Alert.alert("Success", "Book updated successfully");
            navigation.goBack();
          })
          .catch((err) => {
            Alert.alert("Error", err.message || "Failed to update book");
          });
      } else {
        dispatch(addNewBook(bookData))
          .unwrap()
          .then(() => {
            Alert.alert("Success", "Book created successfully");
            navigation.goBack();
          })
          .catch((err) => {
            Alert.alert("Error", err.message || "Failed to create book");
          });
      }
    } catch (err) {
      console.error("Error in form submission:", err);
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  // Function to handle tag selection changes
  const handleTagsChange = (selectedTagIds) => {
    handleChange("tagIds", selectedTagIds);
  };

  if (metadataLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading book metadata...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        {/* Book Cover */}
        <View style={styles.coverContainer}>
          <TouchableOpacity style={styles.coverPicker} onPress={pickImage}>
            {coverImage || formData.bookCover ? (
              <Image source={{ uri: coverImage || formData.bookCover }} style={styles.coverImage} resizeMode="cover" />
            ) : (
              <View style={styles.placeholderCover}>
                <Icon name="image-outline" size={40} color="#aaa" />
                <Text style={styles.placeholderText}>Tap to add cover</Text>
              </View>
            )}
          </TouchableOpacity>
          {errors.bookCover && <Text style={styles.errorText}>{errors.bookCover}</Text>}
        </View>

        {/* Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            value={formData.title}
            onChangeText={(text) => handleChange("title", text)}
            placeholder="Enter book title"
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.textArea, errors.description && styles.inputError]}
            value={formData.description}
            onChangeText={(text) => handleChange("description", text)}
            placeholder="Enter book description"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          <View style={[styles.pickerContainer, errors.categoryId && styles.inputError]}>
            <Picker
              selectedValue={formData.categoryId}
              style={styles.picker}
              onValueChange={(itemValue) => handleChange("categoryId", itemValue)}
            >
              <Picker.Item label="-- Select a category --" value={null} />
              {categories.map((category) => (
                <Picker.Item key={category.id} label={category.name} value={category.id} />
              ))}
            </Picker>
          </View>
          {errors.categoryId && <Text style={styles.errorText}>{errors.categoryId}</Text>}
        </View>

        {/* Tags */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tags</Text>
          <Text style={styles.helperText}>Select tags that describe your book (optional)</Text>
          <TagSelector selectedTags={formData.tagIds} availableTags={tags} onTagsChange={handleTagsChange} error={errors.tagIds} />
        </View>

        {/* Language */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Language</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.language}
              style={styles.picker}
              onValueChange={(itemValue) => handleChange("language", itemValue)}
            >
              {LANGUAGES.map((language) => (
                <Picker.Item key={language} label={language} value={language} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Status */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={formData.status} style={styles.picker} onValueChange={(itemValue) => handleChange("status", itemValue)}>
              {STATUSES.map((status) => (
                <Picker.Item key={status} label={status} value={status} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading || uploadingImage}>
          {loading || uploadingImage ? (
            <View style={styles.loadingButtonContent}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={[styles.submitButtonText, styles.loadingText]}>{uploadingImage ? "Uploading Image..." : "Saving..."}</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>{isEditing ? "Update Book" : "Create Book"}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  formContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text.secondary,
  },
  coverContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  coverPicker: {
    width: 150,
    height: 225,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 8,
  },
  coverImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  placeholderCover: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  placeholderText: {
    marginTop: 8,
    color: "#aaa",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: colors.text.primary,
    fontWeight: "500",
  },
  helperText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },
  inputError: {
    borderColor: colors.danger,
  },
  textArea: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
    minHeight: 120,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 40,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginLeft: 8,
  },
});

export default BookEditorScreen;
