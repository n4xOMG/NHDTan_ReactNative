import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logout } from "../redux/slices/authSlice";
import Icon from "react-native-vector-icons/FontAwesome";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

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

  // Tab content components
  const ProfileTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <View style={styles.profileHeader}>
        <Image source={{ uri: user?.avatarUrl || "https://via.placeholder.com/150" }} style={styles.profileImage} />
        <Text style={styles.username}>{user?.username || "Username"}</Text>
        <Text style={styles.email}>{user?.email || "email@example.com"}</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Full Name</Text>
          <Text style={styles.infoValue}>{user?.fullname || "Not provided"}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Gender</Text>
          <Text style={styles.infoValue}>{user?.gender || "Not provided"}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Bio</Text>
          <Text style={styles.infoValue}>{user?.bio || "No bio provided"}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const PurchasesTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.emptyStateText}>No purchase history yet.</Text>
    </View>
  );

  const ReadingTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.emptyStateText}>Your reading history will appear here.</Text>
    </View>
  );

  const SettingsTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <View style={styles.settingsCard}>
        <TouchableOpacity style={styles.settingsRow}>
          <Icon name="bell" size={20} color="#555" style={styles.settingIcon} />
          <Text style={styles.settingText}>Notification Settings</Text>
          <Icon name="chevron-right" size={16} color="#999" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.settingsRow}>
          <Icon name="lock" size={20} color="#555" style={styles.settingIcon} />
          <Text style={styles.settingText}>Privacy</Text>
          <Icon name="chevron-right" size={16} color="#999" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.settingsRow}>
          <Icon name="question-circle" size={20} color="#555" style={styles.settingIcon} />
          <Text style={styles.settingText}>Help & Support</Text>
          <Icon name="chevron-right" size={16} color="#999" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.settingsRow}>
          <Icon name="info-circle" size={20} color="#555" style={styles.settingIcon} />
          <Text style={styles.settingText}>About</Text>
          <Icon name="chevron-right" size={16} color="#999" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

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
  tabContent: {
    padding: 20,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    backgroundColor: "#e1e1e1",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#888",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: "#555",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  editButton: {
    backgroundColor: "#2196F3",
    borderRadius: 25,
    padding: 12,
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyStateText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 30,
  },
  settingsCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  settingIcon: {
    marginRight: 15,
    width: 20,
    textAlign: "center",
  },
  settingText: {
    fontSize: 16,
    flex: 1,
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
