import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import AuthButton from "../components/AuthButton";
import { resetPassword } from "../services/AuthServices";

const ResetPasswordScreen = ({ navigation, route }) => {
  const { email } = route.params;
  const [password, setPassword] = useState("");

  const handleResetPassword = async () => {
    try {
      const response = await resetPassword(email, password);
      alert(response);
      if (response === "Password has been reset successfully.") {
        navigation.navigate("Login");
      }
    } catch (error) {
      alert("Password reset failed. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <TextInput style={styles.input} placeholder="New Password" onChangeText={setPassword} value={password} secureTextEntry />
      <AuthButton title="Reset Password" onPress={handleResetPassword} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: { height: 40, borderColor: "gray", borderWidth: 1, marginBottom: 20, paddingLeft: 10 },
});

export default ResetPasswordScreen;
