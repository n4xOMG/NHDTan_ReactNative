import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { styles } from "../../style/styles";

const TopBarNavigation = ({ onSearch }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleMenuAction = (action) => {
    setDropdownVisible(false);
    if (action === "edit") {
      console.log("Navigate to Edit Profile");
    } else if (action === "logout") {
      console.log("Log out user");
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (onSearch) {
      onSearch(text);
    }
  };

  return (
    <>
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>My Book App</Text>
        <View style={localStyles.searchContainer}>
          <TextInput
            style={localStyles.searchInput}
            placeholder="Search books..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <Icon name="search" size={20} color="#888" style={localStyles.searchIcon} />
        </View>
        <TouchableOpacity style={styles.userIconContainer} onPress={() => setDropdownVisible(true)}>
          <Icon name="user-circle" size={30} color="white" />
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu */}
      <Modal transparent={true} visible={dropdownVisible} animationType="fade" onRequestClose={() => setDropdownVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setDropdownVisible(false)} />
          <View style={styles.dropdownMenu}>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => handleMenuAction("edit")}>
              <Text style={styles.dropdownText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => handleMenuAction("logout")}>
              <Text style={styles.dropdownText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const localStyles = StyleSheet.create({
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 10,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#333",
  },
  searchIcon: {
    marginLeft: 5,
  },
});

export default TopBarNavigation;
