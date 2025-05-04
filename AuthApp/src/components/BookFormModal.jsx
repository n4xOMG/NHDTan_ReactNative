import React from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Switch, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import TagSelector from "./TagSelector"; // Assuming TagSelector is in the same directory or imported correctly
import { bookmanagestyles } from "../style/bookmanagestyles"; // Keep existing styles
import { colors } from "../style/modernStyles"; // Import colors if needed for Switch

const BookFormModal = ({
  modalVisible,
  setModalVisible,
  formData, // Use a single formData object
  handleChange, // Use a single handler
  handleSave,
  categories = [], // Pass categories array
  tags = [], // Pass tags array
  isEditing = false, // To adjust title
}) => {
  // Helper to handle changes for different field types
  const handleFieldChange = (field, value) => {
    handleChange(field, value);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
      <View style={bookmanagestyles.modalContainer}>
        <View style={bookmanagestyles.modalContent}>
          <Text style={bookmanagestyles.modalTitle}>{isEditing ? "Edit Book" : "Add New Book"}</Text>

          {/* Wrap form content in ScrollView */}
          <ScrollView style={styles.scrollView}>
            {/* Title */}
            <View style={bookmanagestyles.inputGroup}>
              <Text style={bookmanagestyles.inputLabel}>Title *</Text>
              <TextInput
                style={bookmanagestyles.textInput}
                value={formData?.title || ""}
                onChangeText={(text) => handleFieldChange("title", text)}
                placeholder="Book title"
              />
            </View>

            {/* Author Name (Assuming author is set elsewhere or based on logged-in user for creation) */}
            <View style={bookmanagestyles.inputGroup}>
              <Text style={bookmanagestyles.inputLabel}>Author Name *</Text>
              <TextInput
                style={bookmanagestyles.textInput}
                value={formData?.authorName || ""}
                onChangeText={(text) => handleFieldChange("authorName", text)}
                placeholder="Author name"
              />
              {/* Consider making this read-only or pre-filled based on context */}
            </View>

            {/* Description */}
            <View style={bookmanagestyles.inputGroup}>
              <Text style={bookmanagestyles.inputLabel}>Description</Text>
              <TextInput
                style={[bookmanagestyles.textInput, bookmanagestyles.textAreaInput]}
                value={formData?.description || ""}
                onChangeText={(text) => handleFieldChange("description", text)}
                placeholder="Book description"
                multiline={true}
                numberOfLines={4}
              />
            </View>

            {/* Category Picker */}
            <View style={bookmanagestyles.inputGroup}>
              <Text style={bookmanagestyles.inputLabel}>Category *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData?.categoryId || null}
                  style={styles.picker}
                  onValueChange={(itemValue) => handleFieldChange("categoryId", itemValue)}
                >
                  <Picker.Item label="-- Select a category --" value={null} />
                  {categories.map((category) => (
                    <Picker.Item key={category.id} label={category.name} value={category.id} />
                  ))}
                </Picker>
              </View>
              {formData?.categoryName && !formData?.categoryId && (
                <Text style={styles.selectedCategoryText}>Current category: {formData.categoryName}</Text>
              )}
            </View>

            {/* Tags Selector */}
            <View style={bookmanagestyles.inputGroup}>
              <Text style={bookmanagestyles.inputLabel}>Tags</Text>
              <TagSelector
                selectedTags={formData?.tagIds || []}
                availableTags={tags}
                onTagsChange={(selectedTagIds) => handleFieldChange("tagIds", selectedTagIds)}
              />
            </View>

            {/* Language and Status Row */}
            <View style={bookmanagestyles.rowInputs}>
              <View style={[bookmanagestyles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={bookmanagestyles.inputLabel}>Language</Text>
                <TextInput
                  style={bookmanagestyles.textInput}
                  value={formData?.language || ""}
                  onChangeText={(text) => handleFieldChange("language", text)}
                  placeholder="Language"
                />
              </View>
              <View style={[bookmanagestyles.inputGroup, { flex: 1 }]}>
                <Text style={bookmanagestyles.inputLabel}>Status</Text>
                {/* Consider using a Picker for Status as well if predefined values exist */}
                <TextInput
                  style={bookmanagestyles.textInput}
                  value={formData?.status || ""}
                  onChangeText={(text) => handleFieldChange("status", text)}
                  placeholder="Status (e.g., ONGOING)"
                />
              </View>
            </View>

            {/* Cover Image URL */}
            <View style={bookmanagestyles.inputGroup}>
              <Text style={bookmanagestyles.inputLabel}>Cover Image URL</Text>
              <TextInput
                style={bookmanagestyles.textInput}
                value={formData?.bookCover || ""}
                onChangeText={(text) => handleFieldChange("bookCover", text)}
                placeholder="Image URL"
              />
              {/* Consider adding an Image Picker button here */}
            </View>

            {/* isSuggested Switch */}
            <View style={[bookmanagestyles.inputGroup, styles.switchContainer]}>
              <Text style={bookmanagestyles.inputLabel}>Suggested?</Text>
              <Switch
                trackColor={{ false: "#767577", true: colors.primaryLight }}
                thumbColor={formData?.suggested ? colors.primary : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={(value) => handleFieldChange("suggested", value)}
                value={formData?.suggested || false}
              />
            </View>
          </ScrollView>

          {/* Modal Buttons */}
          <View style={bookmanagestyles.modalButtons}>
            <TouchableOpacity style={[bookmanagestyles.modalButton, bookmanagestyles.cancelButton]} onPress={() => setModalVisible(false)}>
              <Text style={bookmanagestyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[bookmanagestyles.modalButton, bookmanagestyles.saveButton]} onPress={handleSave}>
              <Text style={bookmanagestyles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Add local styles for components not covered by bookmanagestyles
const styles = StyleSheet.create({
  scrollView: {
    maxHeight: "70%", // Limit height to allow buttons to be visible
    marginBottom: 10,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
    marginTop: 5, // Add some margin if needed
  },
  picker: {
    height: 50,
    width: "100%",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  selectedCategoryText: {
    marginTop: 5,
    fontStyle: "italic",
    color: "#888",
  },
});

export default BookFormModal;
