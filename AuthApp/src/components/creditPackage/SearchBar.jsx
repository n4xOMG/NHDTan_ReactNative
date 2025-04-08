import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { creditmanagestyles } from "../../style/creditmanagestyles";

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <View style={creditmanagestyles.searchContainer}>
      <Ionicons name="search" size={20} color="#666" style={creditmanagestyles.searchIcon} />
      <TextInput
        style={creditmanagestyles.searchInput}
        placeholder="Search packages by name or description..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {searchQuery ? (
        <TouchableOpacity onPress={() => setSearchQuery("")}>
          <Ionicons name="close-circle" size={20} color="#666" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default SearchBar;
