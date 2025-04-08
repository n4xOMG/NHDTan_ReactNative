import React from "react";
import { View, Text } from "react-native";
import { usermanagestyles } from "../../style/usermanagestyles";

const UserStatsHeader = ({ users }) => {
  return (
    <View style={usermanagestyles.titleContainer}>
      <Text style={usermanagestyles.screenTitle}>User Management</Text>
      <View style={usermanagestyles.statsContainer}>
        <View style={usermanagestyles.statItem}>
          <Text style={usermanagestyles.statValue}>{users.length}</Text>
          <Text style={usermanagestyles.statLabel}>Total</Text>
        </View>
        <View style={usermanagestyles.statItem}>
          <Text style={usermanagestyles.statValue}>{users.filter((u) => !u.isSuspended && !u.isBanned).length}</Text>
          <Text style={usermanagestyles.statLabel}>Active</Text>
        </View>
        <View style={usermanagestyles.statItem}>
          <Text style={usermanagestyles.statValue}>{users.filter((u) => u.isBanned).length}</Text>
          <Text style={usermanagestyles.statLabel}>Banned</Text>
        </View>
      </View>
    </View>
  );
};

export default UserStatsHeader;
