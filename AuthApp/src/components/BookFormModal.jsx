import React from "react";
import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native";
import { bookmanagestyles } from "../style/bookmanagestyles";

const BookFormModal = ({
  modalVisible,
  setModalVisible,
  currentBook,
  bookTitle,
  setBookTitle,
  bookAuthor,
  setBookAuthor,
  bookDescription,
  setBookDescription,
  bookCategory,
  setBookCategory,
  bookLanguage,
  setBookLanguage,
  bookStatus,
  setBookStatus,
  bookImage,
  setBookImage,
  handleSave,
}) => {
  return (
    <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
      <View style={bookmanagestyles.modalContainer}>
        <View style={bookmanagestyles.modalContent}>
          <Text style={bookmanagestyles.modalTitle}>{currentBook ? "Edit Book" : "Add New Book"}</Text>

          <View style={bookmanagestyles.inputGroup}>
            <Text style={bookmanagestyles.inputLabel}>Title *</Text>
            <TextInput style={bookmanagestyles.textInput} value={bookTitle} onChangeText={setBookTitle} placeholder="Book title" />
          </View>

          <View style={bookmanagestyles.inputGroup}>
            <Text style={bookmanagestyles.inputLabel}>Author *</Text>
            <TextInput style={bookmanagestyles.textInput} value={bookAuthor} onChangeText={setBookAuthor} placeholder="Author name" />
          </View>

          <View style={bookmanagestyles.inputGroup}>
            <Text style={bookmanagestyles.inputLabel}>Description</Text>
            <TextInput
              style={[bookmanagestyles.textInput, bookmanagestyles.textAreaInput]}
              value={bookDescription}
              onChangeText={setBookDescription}
              placeholder="Book description"
              multiline={true}
              numberOfLines={4}
            />
          </View>

          <View style={bookmanagestyles.inputGroup}>
            <Text style={bookmanagestyles.inputLabel}>Category *</Text>
            <TextInput style={bookmanagestyles.textInput} value={bookCategory} onChangeText={setBookCategory} placeholder="Book category" />
          </View>

          <View style={bookmanagestyles.rowInputs}>
            <View style={[bookmanagestyles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={bookmanagestyles.inputLabel}>Language</Text>
              <TextInput style={bookmanagestyles.textInput} value={bookLanguage} onChangeText={setBookLanguage} placeholder="Language" />
            </View>

            <View style={[bookmanagestyles.inputGroup, { flex: 1 }]}>
              <Text style={bookmanagestyles.inputLabel}>Status</Text>
              <TextInput style={bookmanagestyles.textInput} value={bookStatus} onChangeText={setBookStatus} placeholder="Status" />
            </View>
          </View>

          <View style={bookmanagestyles.inputGroup}>
            <Text style={bookmanagestyles.inputLabel}>Cover Image URL</Text>
            <TextInput style={bookmanagestyles.textInput} value={bookImage} onChangeText={setBookImage} placeholder="Image URL" />
          </View>

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

export default BookFormModal;
