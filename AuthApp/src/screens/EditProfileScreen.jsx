import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, getProfileFromToken } from "../redux/slices/authSlice";
import UploadToCloudinary from "../utils/uploadToCloudinary";
import Icon from "react-native-vector-icons/FontAwesome";

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setInitialLoading(true);
        // Dispatch Redux action to get user profile
        await dispatch(getProfileFromToken()).unwrap();
      } catch (error) {
        Alert.alert("Error", "Failed to load profile data. Please try again.");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchUserProfile();
  }, [dispatch]);

  // Update local state when Redux user data changes
  useEffect(() => {
    if (user) {
      setName(user.username || "");
      setEmail(user.email || "");
      setNewEmail(user.email || "");
      setImage(user.avatarUrl || null);
    }
  }, [user]);

  // Display error alerts when Redux errors occur
  useEffect(() => {
    if (error) {
      Alert.alert("Error", error.message || "Something went wrong");
    }
  }, [error]);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    if (!newEmail.trim()) {
      Alert.alert("Error", "Email cannot be empty");
      return;
    }

    let updatedAvatarUrl = image;

    if (imageFile) {
      try {
        setUploadingImage(true);
        updatedAvatarUrl = await UploadToCloudinary(imageFile, "profile_pictures");
        setUploadingImage(false);
      } catch (error) {
        setUploadingImage(false);
        Alert.alert("Error", "Image upload failed. Please try again.");
        console.log("Error uploading image: ", error);
        return;
      }
    }

    let updatedData = { username: name, avatarUrl: updatedAvatarUrl };

    if (email !== newEmail) {
      updatedData = { email: newEmail, ...updatedData };
    }

    try {
      // Dispatch Redux action to update profile
      await dispatch(updateProfile(updatedData)).unwrap();

      if (email !== newEmail) {
        Alert.alert("Success", "OTP sent! Please verify your email.");
        navigation.navigate("OtpVerification", { email: email, newEmail: newEmail, context: "updateProfile" });
      } else {
        Alert.alert("Success", "Profile updated successfully!", [{ text: "OK", onPress: () => navigation.goBack() }]);
      }
    } catch (error) {
      console.log("Update profile error:", error);
      // Error alerts are handled by the error useEffect
    }
  };

  const pickImage = async () => {
    // Request permission to access media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photo library to choose a profile picture.");
      return;
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setImage(result.assets[0].uri);
        setImageFile({
          uri: result.assets[0].uri,
          type: "image/jpeg",
          name: "profile.jpg",
        });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading profile data...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.profileImageContainer}>
          <Image source={{ uri: image || "https://via.placeholder.com/150" }} style={styles.profileImage} />
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage} disabled={loading || uploadingImage}>
            {uploadingImage ? <ActivityIndicator size="small" color="#fff" /> : <Icon name="camera" size={20} color="#fff" />}
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputContainer}>
              <Icon name="user" size={20} color="#888" style={styles.inputIcon} />
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter your username" editable={!loading} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Icon name="envelope" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
            {email !== newEmail && newEmail && <Text style={styles.emailChangeNotice}>Email change will require verification</Text>}
          </View>

          <TouchableOpacity
            style={[styles.updateButton, (loading || uploadingImage) && styles.disabledButton]}
            onPress={handleUpdateProfile}
            disabled={loading || uploadingImage}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon name="save" size={18} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.updateButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={loading || uploadingImage}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginTop: Platform.OS === "ios" ? 40 : 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 36,
  },
  profileImageContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e1e1e1",
    borderWidth: 3,
    borderColor: "#fff",
  },
  imagePickerButton: {
    position: "absolute",
    bottom: 0,
    right: "32%",
    backgroundColor: "#2196F3",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingVertical: 0,
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    fontSize: 16,
    color: "#333",
  },
  emailChangeNotice: {
    fontSize: 13,
    color: "#e67e22",
    marginTop: 5,
    fontStyle: "italic",
  },
  updateButton: {
    backgroundColor: "#2196F3",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: 8,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#777",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#94bde5",
  },
});

export default EditProfileScreen;
