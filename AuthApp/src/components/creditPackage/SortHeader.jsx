import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { creditmanagestyles } from "../../style/creditmanagestyles";

const SortHeader = ({ sortBy, sortOrder, handleSort }) => {
  return (
    <View style={creditmanagestyles.header}>
      <Text style={creditmanagestyles.headerTitle}>Sort by:</Text>
      <TouchableOpacity
        style={[creditmanagestyles.sortButton, sortBy === "name" && creditmanagestyles.activeSortButton]}
        onPress={() => handleSort("name")}
      >
        <Text style={[creditmanagestyles.sortButtonText, sortBy === "name" && creditmanagestyles.activeSortText]}>
          Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[creditmanagestyles.sortButton, sortBy === "price" && creditmanagestyles.activeSortButton]}
        onPress={() => handleSort("price")}
      >
        <Text style={[creditmanagestyles.sortButtonText, sortBy === "price" && creditmanagestyles.activeSortText]}>
          Price {sortBy === "price" && (sortOrder === "asc" ? "↑" : "↓")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[creditmanagestyles.sortButton, sortBy === "credits" && creditmanagestyles.activeSortButton]}
        onPress={() => handleSort("credits")}
      >
        <Text style={[creditmanagestyles.sortButtonText, sortBy === "credits" && creditmanagestyles.activeSortText]}>
          Credits {sortBy === "credits" && (sortOrder === "asc" ? "↑" : "↓")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SortHeader;
