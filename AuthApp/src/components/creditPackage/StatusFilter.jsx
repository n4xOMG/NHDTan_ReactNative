import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { creditmanagestyles } from "../../style/creditmanagestyles";

const StatusFilter = ({ filterActive, setFilterActive }) => {
  return (
    <View style={creditmanagestyles.filtersContainer}>
      <View style={creditmanagestyles.filterGroup}>
        <Text style={creditmanagestyles.filterLabel}>Status:</Text>
        <View style={creditmanagestyles.filterOptions}>
          <TouchableOpacity
            style={[creditmanagestyles.filterButton, filterActive === "all" && creditmanagestyles.activeFilterButton]}
            onPress={() => setFilterActive("all")}
          >
            <Text style={[creditmanagestyles.filterButtonText, filterActive === "all" && creditmanagestyles.activeFilterText]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[creditmanagestyles.filterButton, filterActive === "active" && creditmanagestyles.activeFilterButton]}
            onPress={() => setFilterActive("active")}
          >
            <Text style={[creditmanagestyles.filterButtonText, filterActive === "active" && creditmanagestyles.activeFilterText]}>
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[creditmanagestyles.filterButton, filterActive === "inactive" && creditmanagestyles.activeFilterButton]}
            onPress={() => setFilterActive("inactive")}
          >
            <Text style={[creditmanagestyles.filterButtonText, filterActive === "inactive" && creditmanagestyles.activeFilterText]}>
              Inactive
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default StatusFilter;
