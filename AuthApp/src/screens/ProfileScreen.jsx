import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logout } from "../redux/slices/authSlice";
import Icon from "react-native-vector-icons/FontAwesome";

// Import the separated tab components
import ProfileTab from "../components/Profile/ProfileTab";
import PurchasesTab from "../components/Profile/PurchasesTab";
import ReadingTab from "../components/Profile/ReadingTab";
import SettingsTab from "../components/Profile/SettingsTab";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "profile", title: "Profile" },
    { key: "purchases", title: "Purchases" },
    { key: "reading", title: "Reading" },
    { key: "settings", title: "Settings" },
  ]);

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("userToken");
            dispatch(logout());
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          } catch (error) {
            console.error("Error logging out:", error);
            Alert.alert("Error", "Failed to log out. Please try again.");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const renderScene = SceneMap({
    profile: ProfileTab,
    purchases: PurchasesTab,
    reading: ReadingTab,
    settings: SettingsTab,
  });

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={styles.tabIndicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor="#2196F3"
      inactiveColor="#888"
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        renderTabBar={renderTabBar}
        initialLayout={{ width: "100%" }}
      />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="sign-out" size={20} color="#fff" style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    backgroundColor: "#2196F3",
    paddingTop: 40,
    paddingBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  backButton: {
    padding: 5,
  },
  placeholder: {
    width: 30,
  },
  tabBar: {
    backgroundColor: "#fff",
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tabIndicator: {
    backgroundColor: "#2196F3",
    height: 3,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "none",
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#FF6B6B",
    borderRadius: 25,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutIcon: {
    marginRight: 10,
  },
});

export default ProfileScreen;
