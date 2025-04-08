import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { usermanagestyles } from "../../style/usermanagestyles";

const UserFilters = ({ filterRole, setFilterRole, filterStatus, setFilterStatus }) => {
  return (
    <View style={usermanagestyles.filtersContainer}>
      <View style={usermanagestyles.filterGroup}>
        <Text style={usermanagestyles.filterLabel}>Role:</Text>
        <View style={usermanagestyles.filterOptions}>
          <TouchableOpacity
            style={[usermanagestyles.filterButton, filterRole === "all" && usermanagestyles.activeFilterButton]}
            onPress={() => setFilterRole("all")}
          >
            <Text style={[usermanagestyles.filterButtonText, filterRole === "all" && usermanagestyles.activeFilterText]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[usermanagestyles.filterButton, filterRole === "ADMIN" && usermanagestyles.activeFilterButton]}
            onPress={() => setFilterRole("ADMIN")}
          >
            <Text style={[usermanagestyles.filterButtonText, filterRole === "ADMIN" && usermanagestyles.activeFilterText]}>Admin</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[usermanagestyles.filterButton, filterRole === "USER" && usermanagestyles.activeFilterButton]}
            onPress={() => setFilterRole("USER")}
          >
            <Text style={[usermanagestyles.filterButtonText, filterRole === "USER" && usermanagestyles.activeFilterText]}>User</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={usermanagestyles.filterGroup}>
        <Text style={usermanagestyles.filterLabel}>Status:</Text>
        <View style={usermanagestyles.filterOptions}>
          <TouchableOpacity
            style={[usermanagestyles.filterButton, filterStatus === "all" && usermanagestyles.activeFilterButton]}
            onPress={() => setFilterStatus("all")}
          >
            <Text style={[usermanagestyles.filterButtonText, filterStatus === "all" && usermanagestyles.activeFilterText]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[usermanagestyles.filterButton, filterStatus === "active" && usermanagestyles.activeFilterButton]}
            onPress={() => setFilterStatus("active")}
          >
            <Text style={[usermanagestyles.filterButtonText, filterStatus === "active" && usermanagestyles.activeFilterText]}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[usermanagestyles.filterButton, filterStatus === "suspended" && usermanagestyles.activeFilterButton]}
            onPress={() => setFilterStatus("suspended")}
          >
            <Text style={[usermanagestyles.filterButtonText, filterStatus === "suspended" && usermanagestyles.activeFilterText]}>
              Suspended
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[usermanagestyles.filterButton, filterStatus === "banned" && usermanagestyles.activeFilterButton]}
            onPress={() => setFilterStatus("banned")}
          >
            <Text style={[usermanagestyles.filterButtonText, filterStatus === "banned" && usermanagestyles.activeFilterText]}>Banned</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default UserFilters;
