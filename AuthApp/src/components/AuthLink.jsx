import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const AuthLink = ({ title, onPress, disabled }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container} disabled={disabled}>
      <Text style={[styles.text, disabled && styles.textDisabled]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 10,
  },
  text: {
    color: "#4F46E5",
    fontSize: 14,
  },
  textDisabled: {
    color: "#9CA3AF",
  },
});

export default AuthLink;
