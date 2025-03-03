import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import AuthButton from "../components/AuthButton";
import { updateUserEmail, verifyOtp } from "../services/AuthServices";

const OtpVerificationScreen = ({ navigation, route }) => {
  const { email, newEmail, context } = route.params;
  const [otp, setOtp] = useState("");

  const handleVerifyOtp = async () => {
    try {
      console.log("Email: ", email);
      const response = await verifyOtp(email, otp, context);
      alert(response);
      if (response === "OTP verified successfully. Please reset your password.") {
        navigation.navigate("ResetPassword", { email });
      } else if (response === "OTP verified successfully. Registration complete.") {
        navigation.navigate("Login");
      } else if (response === "OTP verified successfully. Update profile complete") {
        console.log("New email:", newEmail);
        await updateUserEmail(newEmail);
        navigation.navigate("Login");
      }
    } catch (error) {
      console.log("Error verify OTP:", error.response?.data || error.message);
      alert("OTP verification failed. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <TextInput style={styles.input} placeholder="OTP" onChangeText={setOtp} value={otp} />
      <AuthButton title="Verify OTP" onPress={handleVerifyOtp} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: { height: 40, borderColor: "gray", borderWidth: 1, marginBottom: 20, paddingLeft: 10 },
});

export default OtpVerificationScreen;
