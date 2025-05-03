import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import AuthButton from "../components/AuthButton";
import AuthLink from "../components/AuthLink";
import { register } from "../services/AuthServices";
import UploadToCloudinary from "../utils/uploadToCloudinary";

const GenderOption = ({ label, selected, onPress }) => (
  <TouchableOpacity style={styles.genderOption} onPress={onPress}>
    <View style={[styles.radioButton, selected && styles.radioButtonSelected]}>{selected && <View style={styles.radioButtonInner} />}</View>
    <Text style={styles.genderLabel}>{label}</Text>
  </TouchableOpacity>
);

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullname, setName] = useState("");
  const [gender, setGender] = useState("male");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const pickImage = async () => {
    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    };

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photo library");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled) {
      setAvatar({ uri: result.assets[0].uri });
      console.log("Image selected:", result.assets[0].uri);
    } else {
      console.log("User cancelled image picker");
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !username || !fullname) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setUploadProgress("Preparing registration...");

    try {
      let avatarUrl = null;

      // Upload avatar to Cloudinary if available
      if (avatar && avatar.uri) {
        setUploadProgress("Uploading avatar...");
        avatarUrl = await UploadToCloudinary(avatar, "user_avatars");
        setUploadProgress("Avatar uploaded successfully!");
      }

      setUploadProgress("Creating account...");

      const userData = {
        email,
        password,
        username,
        fullname,
        gender,
        bio,
        avatarUrl: avatarUrl, // Use the Cloudinary URL instead of local URI
      };

      const response = await register(userData);
      setIsLoading(false);
      alert(response.message);

      if (response.token) {
        navigation.navigate("OtpVerification", { email, context: "register" });
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Registration error:", error);
      alert(error.message || "Registration failed. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Please fill in the details below to register</Text>

          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper} disabled={isLoading}>
              {avatar ? (
                <Image source={avatar} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person-outline" size={40} color="#9CA3AF" />
                </View>
              )}
              <View style={styles.uploadButton}>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name*</Text>
            <TextInput style={styles.input} placeholder="Enter your full name" onChangeText={setName} value={fullname} />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Username*</Text>
            <TextInput style={styles.input} placeholder="Choose a username" onChangeText={setUsername} value={username} />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              onChangeText={setEmail}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password*</Text>
            <TextInput style={styles.input} placeholder="Create a password" onChangeText={setPassword} value={password} secureTextEntry />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.genderContainer}>
              <GenderOption label="Male" selected={gender === "male"} onPress={() => setGender("male")} />
              <GenderOption label="Female" selected={gender === "female"} onPress={() => setGender("female")} />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Bio (Optional)</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Tell us about yourself"
              onChangeText={setBio}
              value={bio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.loadingText}>{uploadProgress}</Text>
            </View>
          ) : (
            <AuthButton title="Create Account" onPress={handleRegister} />
          )}

          <AuthLink title="Already have an account? Login" onPress={() => navigation.navigate("Login")} disabled={isLoading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  uploadButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4F46E5",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 6,
    color: "#4B5563",
    fontWeight: "500",
  },
  input: {
    height: 48,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
  },
  bioInput: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },
  genderContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  genderOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#9CA3AF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioButtonSelected: {
    borderColor: "#4F46E5",
  },
  radioButtonInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#4F46E5",
  },
  genderLabel: {
    fontSize: 16,
    color: "#4B5563",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
  },
});

export default RegisterScreen;
