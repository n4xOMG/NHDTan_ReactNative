import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import AuthButton from "../components/AuthButton";
import AuthLink from "../components/AuthLink";
import { forgotPassword } from "../services/AuthServices";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");

  const handleForgotPassword = async () => {
    try {
      const response = await forgotPassword(email);
      alert(response);
      navigation.navigate("OtpVerification", { email, context: "resetPassword" });
    } catch (error) {
      alert("Failed to send reset link. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <TextInput style={styles.input} placeholder="Email" onChangeText={setEmail} value={email} />
      <AuthButton title="Send Reset Link" onPress={handleForgotPassword} />
      <AuthLink title="Back to Login" onPress={() => navigation.navigate("Login")} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: { height: 40, borderColor: "gray", borderWidth: 1, marginBottom: 20, paddingLeft: 10 },
});

export default ForgotPasswordScreen;
