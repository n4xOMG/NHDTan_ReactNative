import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

const SettingsTab = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
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
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
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
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
  },
});

export default SettingsTab;
