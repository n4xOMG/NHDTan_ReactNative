import React from "react";
import { View, Text, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { bookmanagestyles } from "../style/bookmanagestyles";

const EmptyState = () => {
  // Add a simple pulse animation
  const scaleAnim = new Animated.Value(1);

  React.useEffect(() => {
    // Create a repeating pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={bookmanagestyles.emptyContainer}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Ionicons name="book-outline" size={80} color="#d0d6f2" />
      </Animated.View>
      <Text style={bookmanagestyles.emptyText}>No books found</Text>
      <Text style={[bookmanagestyles.emptyText, { fontSize: 14, marginTop: 4, color: "#aab" }]}>
        Try adjusting your search or add a new book
      </Text>
    </View>
  );
};

export default EmptyState;
