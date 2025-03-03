import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { Alert, Button, Image, Text, TextInput, View } from "react-native";
import { updateUserProfile } from "../services/AuthServices";
import { getUserProfileByJwt } from "../services/UserServices";
import UploadToCloudinary from "../utils/uploadToCloudinary";

const EditProfileScreen = () => {
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await getUserProfileByJwt();
        setName(response.username);
        setEmail(response.email);
        setNewEmail((prevEmail) => (prevEmail ? prevEmail : response.email));
        setImage(response.avatarUrl);
      } catch (error) {
        console.log("Error fetching user profile", error);
      }
    };
    fetchUserProfile();
  }, []);
  const handleUpdateProfile = async () => {
    let updatedAvatarUrl = image;

    if (imageFile) {
      try {
        updatedAvatarUrl = await UploadToCloudinary(imageFile, "profile_pictures");
      } catch (error) {
        Alert.alert("Image upload failed");
        console.log("Error image: ", error);
        return;
      }
    }

    let updatedData = { username: name, avatarUrl: updatedAvatarUrl };
    if (email !== newEmail) {
      try {
        updatedData = { email: newEmail, ...updatedData };
        await updateUserProfile(updatedData);
        Alert.alert("OTP sent! Please verify your email.");
        navigation.navigate("OtpVerification", { email: email, newEmail: newEmail, context: "updateProfile" });
      } catch (error) {
        console.log("Error sending OTP:", error.response?.data || error.message);
        Alert.alert("Error sending OTP", error.response?.data?.message || "Something went wrong.");
      }
    } else {
      try {
        console.log(updatedData);
        await updateUserProfile(updatedData);
        Alert.alert("Profile updated successfully!");
      } catch (error) {
        Alert.alert("Error updating profile.");
      }
    }
  };

  const pickImage = async () => {
    // Request permission to access media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "You need to allow access to your gallery.");
      return;
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      console.log("Picked Image Result:", result); // Debugging

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
      Alert.alert("Error", "Failed to pick image.");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Name</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Enter your name" />
      <Text>Email</Text>
      <TextInput value={newEmail} onChangeText={setNewEmail} placeholder="Enter new email" />
      <Button title="Pick Image" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={{ width: 100, height: 100 }} />}
      <Button title="Update Profile" onPress={handleUpdateProfile} />
    </View>
  );
};

export default EditProfileScreen;
