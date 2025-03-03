import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthLink from "../components/AuthLink";
import AuthButton from "../components/AuthButton";
import { login } from "../services/AuthServices";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await login(email, password);
      alert(response.message);
      if (response.token) {
        await AsyncStorage.setItem("userToken", response.token);
        navigation.navigate("Home");
      }
    } catch (error) {
      alert("Error: " + error);
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput style={styles.input} placeholder="Email" onChangeText={setEmail} value={email} />
      <TextInput style={styles.input} placeholder="Password" onChangeText={setPassword} value={password} secureTextEntry />
      <AuthButton title="Login" onPress={handleLogin} />
      <AuthLink title="Don't have an account? Register" onPress={() => navigation.navigate("Register")} />
      <AuthLink title="Forgot Password?" onPress={() => navigation.navigate("ForgotPassword")} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: { height: 40, borderColor: "gray", borderWidth: 1, marginBottom: 20, paddingLeft: 10 },
});

export default LoginScreen;
