import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

// Screen: Introduction
const IntroductionScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Home"); // Chuyển sang HomePage sau 10 giây
    }, 10000);
    return () => clearTimeout(timer); // Xóa timer khi component unmount
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Xin chào! Đây là trang giới thiệu bản thân của Nguyễn Huỳnh Duy Tân</Text>
      <Text style={styles.text}>MSSV: 21110852</Text>
    </View>
  );
};

// Screen: HomePage
const HomePage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Chào mừng đến với HomePage!</Text>
    </View>
  );
};

// Main App Component
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Introduction" component={IntroductionScreen} />
        <Stack.Screen name="Home" component={HomePage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  text: {
    fontSize: 20,
    textAlign: "center",
    margin: 10,
  },
});
