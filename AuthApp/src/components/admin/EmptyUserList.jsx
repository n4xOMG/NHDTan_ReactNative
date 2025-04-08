import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usermanagestyles } from "../../style/usermanagestyles";

const EmptyUserList = () => {
  return (
    <View style={usermanagestyles.emptyContainer}>
      <Ionicons name="people-outline" size={60} color="#ccc" />
      <Text style={usermanagestyles.emptyText}>No users found</Text>
    </View>
  );
};

export default EmptyUserList;
