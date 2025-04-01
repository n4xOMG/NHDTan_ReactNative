// components/TopBarNavigation.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { styles } from "../../style/styles";
import NotificationIcon from "../NotificationIcon";

const TopBarNavigation = ({ onSearch }) => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (onSearch) {
      onSearch(text);
    }
  };

  return (
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
      <NotificationIcon />
      <TouchableOpacity style={styles.userIconContainer} onPress={() => navigation.navigate("Profile")}>
        <Icon name="user-circle" size={30} color="white" />
      </TouchableOpacity>
    </View>
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
