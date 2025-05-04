import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import AuthButton from "../components/AuthButton";
import AuthLink from "../components/AuthLink";
import { forgotPassword } from "../services/AuthServices";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword(email);
      setLoading(false);
      alert(response);
      navigation.navigate("OtpVerification", { email, context: "resetPassword" });
    } catch (error) {
      setLoading(false);
      alert("Failed to send reset link. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <TextInput style={styles.input} placeholder="Email" onChangeText={setEmail} value={email} editable={!loading} />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Sending reset link...</Text>
        </View>
      ) : (
        <AuthButton title="Send Reset Link" onPress={handleForgotPassword} />
      )}
      <AuthLink title="Back to Login" onPress={() => navigation.navigate("Login")} disabled={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: { height: 40, borderColor: "gray", borderWidth: 1, marginBottom: 20, paddingLeft: 10 },
  loadingContainer: { alignItems: "center", marginBottom: 20 },
  loadingText: { marginTop: 10, color: "#666" },
});

export default ForgotPasswordScreen;
