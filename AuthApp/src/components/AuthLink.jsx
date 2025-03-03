import React from "react";
import { Text, StyleSheet } from "react-native";

const AuthLink = ({ title, onPress }) => {
  return (
    <Text style={styles.link} onPress={onPress}>
      {title}
    </Text>
  );
};

const styles = StyleSheet.create({
  link: {
    color: "blue",
    marginTop: 20,
    textAlign: "center",
  },
});

export default AuthLink;
