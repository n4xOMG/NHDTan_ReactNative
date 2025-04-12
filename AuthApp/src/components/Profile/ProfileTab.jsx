import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";

const ProfileTab = () => {
  const user = useSelector((state) => state.auth.user);
  const navigation = useNavigation();

  const handleEditProfile = () => {
    navigation.navigate("EditProfile");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileHeader}>
        <Image source={{ uri: user?.avatarUrl || "https://via.placeholder.com/150" }} style={styles.profileImage} />
        <Text style={styles.username}>{user?.username || "Username"}</Text>
        <Text style={styles.email}>{user?.email || "email@example.com"}</Text>
        {user?.isVerified && (
          <View style={styles.verifiedBadge}>
            <Icon name="check-circle" size={16} color="#4CAF50" style={styles.verifiedIcon} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
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
          <Text style={styles.infoLabel}>Credits Amount</Text>
          <Text style={styles.infoValue}>{user?.credits || 0}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Bio</Text>
          <Text style={styles.infoValue}>{user?.bio || "No bio provided"}</Text>
        </View>
      </View>

      {(user?.preferredCategories?.length > 0 || user?.preferredTags?.length > 0) && (
        <View style={styles.preferencesCard}>
          <Text style={styles.preferencesTitle}>Preferences</Text>

          {user?.preferredCategories?.length > 0 && (
            <View style={styles.preferencesSection}>
              <Text style={styles.preferencesLabel}>Categories</Text>
              <View style={styles.tagContainer}>
                {user.preferredCategories.map((category, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{category.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {user?.preferredTags?.length > 0 && (
            <View style={styles.preferencesSection}>
              <Text style={styles.preferencesLabel}>Tags</Text>
              <View style={styles.tagContainer}>
                {user.preferredTags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
        <Icon name="edit" size={16} color="#fff" style={styles.editIcon} />
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
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
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 8,
  },
  verifiedIcon: {
    marginRight: 4,
  },
  verifiedText: {
    color: "#4CAF50",
    fontWeight: "600",
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
  preferencesCard: {
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
  preferencesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  preferencesSection: {
    marginBottom: 12,
  },
  preferencesLabel: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#E3F2FD",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  tagText: {
    color: "#2196F3",
    fontSize: 14,
    fontWeight: "500",
  },
  editButton: {
    backgroundColor: "#2196F3",
    borderRadius: 25,
    padding: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  editIcon: {
    marginRight: 4,
  },
});

export default ProfileTab;
