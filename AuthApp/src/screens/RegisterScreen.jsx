import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import AuthButton from "../components/AuthButton";
import AuthLink from "../components/AuthLink";
import { register } from "../services/AuthServices";

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleRegister = async () => {
    try {
      const response = await register(email, password, username);
      alert(response.message);
      if (response.token) {
        navigation.navigate("OtpVerification", { email, context: "register" });
      }
    } catch (error) {
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput style={styles.input} placeholder="Username" onChangeText={setUsername} value={username} />
      <TextInput style={styles.input} placeholder="Email" onChangeText={setEmail} value={email} />
      <TextInput style={styles.input} placeholder="Password" onChangeText={setPassword} value={password} secureTextEntry />
      <AuthButton title="Register" onPress={handleRegister} />
      <AuthLink title="Already have an account? Login" onPress={() => navigation.navigate("Login")} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: { height: 40, borderColor: "gray", borderWidth: 1, marginBottom: 20, paddingLeft: 10 },
});

export default RegisterScreen;
