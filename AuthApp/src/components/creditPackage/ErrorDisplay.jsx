import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { creditmanagestyles } from "../../style/creditmanagestyles";

const ErrorDisplay = ({ error, onRetry }) => {
  return (
    <View style={creditmanagestyles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={60} color="#f44336" />
      <Text style={creditmanagestyles.errorText}>{error}</Text>
      <TouchableOpacity style={creditmanagestyles.retryButton} onPress={onRetry}>
        <Text style={creditmanagestyles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ErrorDisplay;
