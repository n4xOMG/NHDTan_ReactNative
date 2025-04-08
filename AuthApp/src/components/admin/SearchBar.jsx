import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usermanagestyles } from "../../style/usermanagestyles";

const SearchBar = ({ searchQuery, setSearchQuery, handleSearch, handleClear }) => {
  return (
    <View style={usermanagestyles.searchContainer}>
      <Ionicons name="search" size={20} color="#666" style={usermanagestyles.searchIcon} />
      <TextInput
        style={usermanagestyles.searchInput}
        placeholder="Search users by name or email..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
      />
      {searchQuery ? (
        <TouchableOpacity onPress={handleClear}>
          <Ionicons name="close-circle" size={20} color="#666" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default SearchBar;
