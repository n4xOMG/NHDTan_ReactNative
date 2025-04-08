import React from "react";
import { View, Text } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { creditmanagestyles } from "../../style/creditmanagestyles";

const EmptyList = () => {
  return (
    <View style={creditmanagestyles.emptyContainer}>
      <FontAwesome5 name="coins" size={60} color="#ccc" />
      <Text style={creditmanagestyles.emptyText}>No credit packages found</Text>
    </View>
  );
};

export default EmptyList;
