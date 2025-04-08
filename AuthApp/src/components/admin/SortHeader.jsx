import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { usermanagestyles } from "../../style/usermanagestyles";

const SortHeader = ({ sortBy, sortOrder, handleSort }) => {
  return (
    <View style={usermanagestyles.header}>
      <Text style={usermanagestyles.headerTitle}>Sort by:</Text>
      <TouchableOpacity
        style={[usermanagestyles.sortButton, sortBy === "fullname" && usermanagestyles.activeSortButton]}
        onPress={() => handleSort("fullname")}
      >
        <Text style={[usermanagestyles.sortButtonText, sortBy === "fullname" && usermanagestyles.activeSortText]}>
          Name {sortBy === "fullname" && (sortOrder === "asc" ? "↑" : "↓")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[usermanagestyles.sortButton, sortBy === "credits" && usermanagestyles.activeSortButton]}
        onPress={() => handleSort("credits")}
      >
        <Text style={[usermanagestyles.sortButtonText, sortBy === "credits" && usermanagestyles.activeSortText]}>
          Credits {sortBy === "credits" && (sortOrder === "asc" ? "↑" : "↓")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SortHeader;
