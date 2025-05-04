import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Share,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import { addDraftChapter, publishNewChapter, editChapter, clearCurrentChapter } from "../../redux/slices/userChaptersSlice";
import { colors } from "../../style/modernStyles";
import Icon from "react-native-vector-icons/Ionicons";

const ChapterEditorScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const { bookId, chapterId, isEditing, isDraft } = route.params || {};

  // Safely access state with fallbacks
  const userChaptersState = useSelector((state) => state.userChapters || {});
  const { currentChapter, loading, error } = userChaptersState;

  // Chapter form state
  const [title, setTitle] = useState("");
  const [chapterNum, setChapterNum] = useState("");
  const [content, setContent] = useState("");
  const [price, setPrice] = useState("0");
  const [locked, setLocked] = useState(false);
  const [draft, setDraft] = useState(isDraft || false);
  const [localError, setLocalError] = useState(null);
  const [roomId, setRoomId] = useState("");
  const [contentPreviewText, setContentPreviewText] = useState("");

  useEffect(() => {
    if (!bookId) {
      setLocalError("Book ID is missing. Cannot create/edit chapter.");
    }

    // If editing, populate fields with current chapter data
    if (isEditing && currentChapter) {
      setTitle(currentChapter.title || "");
      setChapterNum(currentChapter.chapterNum?.toString() || "");
      setContent(currentChapter.content || "");
      setContentPreviewText(stripHtml(currentChapter.content || ""));
      setPrice(currentChapter.price?.toString() || "0");
      setLocked(currentChapter.locked || false);
      setDraft(currentChapter.draft || false);
      setRoomId(currentChapter.roomId || "");
    }

    return () => {
      dispatch(clearCurrentChapter());
    };
  }, [currentChapter, isEditing, bookId]);

  // Helper function to strip HTML for preview
  const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, "").substring(0, 200);
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Chapter title is required.");
      return false;
    }
    if (!chapterNum.trim()) {
      Alert.alert("Validation Error", "Chapter number is required.");
      return false;
    }
    if (!content.trim() && !draft) {
      Alert.alert("Validation Error", "Chapter content is required for published chapters.");
      return false;
    }
    return true;
  };

  const handleEditContent = () => {
    // Store current state in Redux before navigating
    dispatch({
      type: "chapter/saveTemporaryState",
      payload: {
        title,
        chapterNum,
        content,
        price,
        locked,
        draft,
        roomId,
      },
    });

    navigation.navigate("CollaborativeEditor", {
      bookId,
      chapterId,
      initialContent: content,
      roomId,
      // Remove the function from navigation params
      returnRoute: route.name, // Pass the route name instead of a function
    });
  };

  const handleShareCollabLink = async () => {
    if (!roomId) {
      Alert.alert("Info", "Room ID will be generated when you save the chapter or edit content.");
      return;
    }

    try {
      const collabUrl = `${process.env.EXPO_PUBLIC_EDITOR_URL}/edit-chapter/${roomId}`;
      await Share.share({
        message: `Join me to edit this chapter: ${collabUrl}`,
        url: collabUrl,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share collaboration link");
    }
  };

  const handleSave = async () => {
    if (!bookId) {
      Alert.alert("Error", "Book ID is missing. Cannot save chapter.");
      return;
    }

    if (!validateForm()) return;

    const chapterData = {
      title,
      chapterNum,
      content,
      price: parseInt(price, 10) || 0,
      locked: locked,
      draft,
      roomId,
    };

    try {
      if (isEditing && chapterId) {
        await dispatch(
          editChapter({
            chapterId,
            chapterData: { ...chapterData, id: chapterId, bookId },
          })
        ).unwrap();
        Alert.alert("Success", "Chapter updated successfully");
      } else if (draft) {
        await dispatch(addDraftChapter({ bookId, chapterData })).unwrap();
        Alert.alert("Success", "Draft chapter created successfully");
      } else {
        await dispatch(publishNewChapter({ bookId, chapterData })).unwrap();
        Alert.alert("Success", "Chapter published successfully");
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", err.toString());
    }
  };

  if (localError || error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Error: {localError || error}</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? "Edit Chapter" : draft ? "Create Draft Chapter" : "Create Chapter"}</Text>
        <TouchableOpacity style={[styles.saveButton, loading && styles.disabledButton]} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Chapter Number *</Text>
          <TextInput style={styles.input} value={chapterNum} onChangeText={setChapterNum} keyboardType="numeric" placeholder="e.g., 1" />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Enter chapter title" />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Save as Draft</Text>
          <Switch value={draft} onValueChange={setDraft} trackColor={{ false: "#767577", true: colors.primary }} thumbColor="#f4f3f4" />
        </View>

        {!draft && (
          <>
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Locked (Premium)</Text>
              <Switch
                value={locked}
                onValueChange={setLocked}
                trackColor={{ false: "#767577", true: colors.primary }}
                thumbColor="#f4f3f4"
              />
            </View>

            {locked && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Price (Coins)</Text>
                <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="e.g., 50" />
              </View>
            )}
          </>
        )}

        <View style={styles.formGroup}>
          <View style={styles.contentHeaderContainer}>
            <Text style={styles.label}>Content {!draft && "*"}</Text>
            <View style={styles.actionsContainer}>
              {roomId && (
                <TouchableOpacity style={styles.collabButton} onPress={handleShareCollabLink}>
                  <Icon name="share-social-outline" size={20} color={colors.primary} />
                  <Text style={styles.collabButtonText}>Share</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.editContentButton} onPress={handleEditContent}>
                <Icon name="create-outline" size={20} color="#fff" />
                <Text style={styles.editContentButtonText}>Edit Content</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.contentPreview}>
            {contentPreviewText ? (
              <Text numberOfLines={5} ellipsizeMode="tail">
                {contentPreviewText}
              </Text>
            ) : (
              <Text style={styles.placeholderText}>No content yet. Tap "Edit Content" to create content.</Text>
            )}
          </View>
          <Text style={styles.helperText}>Edit content in the collaborative editor. {roomId ? "Room ID: " + roomId : ""}</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  // ...existing styles...
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
    flex: 1,
    textAlign: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: colors.primary + "80", // Add opacity
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: colors.text.primary,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
  },
  contentInput: {
    minHeight: 200,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  helperText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    color: colors.danger,
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  contentHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  editContentButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  editContentButtonText: {
    color: "#fff",
    marginLeft: 4,
    fontWeight: "500",
  },

  collabButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
  },

  collabButtonText: {
    color: colors.primary,
    marginLeft: 4,
    fontWeight: "500",
  },

  contentPreview: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
  },

  placeholderText: {
    color: colors.text.secondary,
    fontStyle: "italic",
  },
});

export default ChapterEditorScreen;
