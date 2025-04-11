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

  useEffect(() => {
    if (!bookId) {
      setLocalError("Book ID is missing. Cannot create/edit chapter.");
    }

    // If editing, populate fields with current chapter data
    if (isEditing && currentChapter) {
      setTitle(currentChapter.title || "");
      setChapterNum(currentChapter.chapterNum?.toString() || "");
      setContent(currentChapter.content || "");
      setPrice(currentChapter.price?.toString() || "0");
      setLocked(currentChapter.isLocked || false);
      setDraft(currentChapter.draft || false);
    }

    return () => {
      dispatch(clearCurrentChapter());
    };
  }, [currentChapter, isEditing, bookId]);

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
      isLocked: locked,
      draft,
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
          <Text style={styles.label}>Content {!draft && "*"}</Text>
          <TextInput
            style={[styles.input, styles.contentInput]}
            value={content}
            onChangeText={setContent}
            placeholder="Enter chapter content (supports HTML formatting)"
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.helperText}>You can use HTML formatting in your content.</Text>
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
});

export default ChapterEditorScreen;
