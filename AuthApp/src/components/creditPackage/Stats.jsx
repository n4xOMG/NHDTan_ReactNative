import React from "react";
import { View, Text } from "react-native";
import { creditmanagestyles } from "../../style/creditmanagestyles";

const Stats = ({ packages }) => {
  return (
    <View style={creditmanagestyles.titleContainer}>
      <Text style={creditmanagestyles.screenTitle}>Credit Package Management</Text>
      <View style={creditmanagestyles.statsContainer}>
        <View style={creditmanagestyles.statItem}>
          <Text style={creditmanagestyles.statValue}>{packages.length}</Text>
          <Text style={creditmanagestyles.statLabel}>Total</Text>
        </View>
        <View style={creditmanagestyles.statItem}>
          <Text style={creditmanagestyles.statValue}>{packages.filter((p) => p.isActive).length}</Text>
          <Text style={creditmanagestyles.statLabel}>Active</Text>
        </View>
        <View style={creditmanagestyles.statItem}>
          <Text style={creditmanagestyles.statValue}>{packages.filter((p) => p.isPopular).length}</Text>
          <Text style={creditmanagestyles.statLabel}>Popular</Text>
        </View>
      </View>
    </View>
  );
};

export default Stats;
