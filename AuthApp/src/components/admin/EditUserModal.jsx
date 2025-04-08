import React from "react";
import { View, Text, Modal, TextInput, TouchableOpacity, Image } from "react-native";
import { usermanagestyles } from "../../style/usermanagestyles";

const EditUserModal = ({
  modalVisible,
  setModalVisible,
  currentUser,
  userName,
  setUserName,
  userEmail,
  setUserEmail,
  userRole,
  setUserRole,
  userStatus,
  setUserStatus,
  banReason,
  setBanReason,
  setIsBanned,
  handleSave,
}) => {
  return (
    <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
      <View style={usermanagestyles.modalContainer}>
        <View style={usermanagestyles.modalContent}>
          <Text style={usermanagestyles.modalTitle}>Edit User</Text>

          <View style={usermanagestyles.userAvatarContainer}>
            <Image
              source={{ uri: currentUser?.avatarUrl || "https://randomuser.me/api/portraits/lego/1.jpg" }}
              style={usermanagestyles.modalUserAvatar}
            />
          </View>

          <View style={usermanagestyles.inputGroup}>
            <Text style={usermanagestyles.inputLabel}>Name</Text>
            <TextInput style={usermanagestyles.textInput} value={userName} onChangeText={setUserName} placeholder="User name" />
          </View>

          <View style={usermanagestyles.inputGroup}>
            <Text style={usermanagestyles.inputLabel}>Email</Text>
            <TextInput
              style={usermanagestyles.textInput}
              value={userEmail}
              onChangeText={setUserEmail}
              placeholder="user@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={usermanagestyles.inputGroup}>
            <Text style={usermanagestyles.inputLabel}>Role</Text>
            <View style={usermanagestyles.radioGroup}>
              <TouchableOpacity style={usermanagestyles.radioOption} onPress={() => setUserRole("USER")}>
                <View style={usermanagestyles.radioButton}>
                  {userRole === "USER" && <View style={usermanagestyles.radioButtonSelected} />}
                </View>
                <Text style={usermanagestyles.radioLabel}>User</Text>
              </TouchableOpacity>

              <TouchableOpacity style={usermanagestyles.radioOption} onPress={() => setUserRole("ADMIN")}>
                <View style={usermanagestyles.radioButton}>
                  {userRole === "ADMIN" && <View style={usermanagestyles.radioButtonSelected} />}
                </View>
                <Text style={usermanagestyles.radioLabel}>Admin</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={usermanagestyles.inputGroup}>
            <Text style={usermanagestyles.inputLabel}>Status</Text>
            <View style={usermanagestyles.radioGroup}>
              <TouchableOpacity style={usermanagestyles.radioOption} onPress={() => setUserStatus("active")}>
                <View style={usermanagestyles.radioButton}>
                  {userStatus === "active" && <View style={usermanagestyles.radioButtonSelected} />}
                </View>
                <Text style={usermanagestyles.radioLabel}>Active</Text>
              </TouchableOpacity>

              <TouchableOpacity style={usermanagestyles.radioOption} onPress={() => setUserStatus("suspended")}>
                <View style={usermanagestyles.radioButton}>
                  {userStatus === "suspended" && <View style={usermanagestyles.radioButtonSelected} />}
                </View>
                <Text style={usermanagestyles.radioLabel}>Suspended</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={usermanagestyles.radioOption}
                onPress={() => {
                  setUserStatus("banned");
                  setIsBanned(true);
                }}
              >
                <View style={usermanagestyles.radioButton}>
                  {userStatus === "banned" && <View style={usermanagestyles.radioButtonSelected} />}
                </View>
                <Text style={usermanagestyles.radioLabel}>Banned</Text>
              </TouchableOpacity>
            </View>
          </View>

          {userStatus === "banned" && (
            <View style={usermanagestyles.inputGroup}>
              <Text style={usermanagestyles.inputLabel}>Ban Reason</Text>
              <TextInput
                style={usermanagestyles.textInput}
                value={banReason}
                onChangeText={setBanReason}
                placeholder="Reason for banning this user"
                multiline
                numberOfLines={3}
              />
            </View>
          )}

          <View style={usermanagestyles.modalButtons}>
            <TouchableOpacity style={[usermanagestyles.modalButton, usermanagestyles.cancelButton]} onPress={() => setModalVisible(false)}>
              <Text style={usermanagestyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[usermanagestyles.modalButton, usermanagestyles.saveButton]} onPress={handleSave}>
              <Text style={usermanagestyles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditUserModal;
