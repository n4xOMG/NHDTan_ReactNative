import React from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { bookmanagestyles } from "../style/bookmanagestyles";
import { Ionicons } from "@expo/vector-icons";

const SortHeader = ({ sortBy, sortOrder, handleSort }) => {
  // Create animated value for button press feedback
  const createAnimatedValue = () => new Animated.Value(1);
  const titleAnim = createAnimatedValue();
  const viewsAnim = createAnimatedValue();
  const ratingAnim = createAnimatedValue();

  const handlePressIn = (anim) => {
    Animated.spring(anim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (anim) => {
    Animated.spring(anim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  // Helper to get arrow based on sort status
  const getSortArrow = (field) => {
    if (sortBy === field) {
      return sortOrder === "asc" ? <Ionicons name="chevron-up" size={14} /> : <Ionicons name="chevron-down" size={14} />;
    }
    return null;
  };

  return (
    <View style={bookmanagestyles.header}>
      <Text style={bookmanagestyles.headerTitle}>Sort by:</Text>

      <Animated.View style={{ transform: [{ scale: titleAnim }] }}>
        <TouchableOpacity
          style={[bookmanagestyles.sortButton, sortBy === "title" && bookmanagestyles.activeSortButton]}
          onPress={() => handleSort("title")}
          onPressIn={() => handlePressIn(titleAnim)}
          onPressOut={() => handlePressOut(titleAnim)}
        >
          <Text style={[bookmanagestyles.sortButtonText, sortBy === "title" && bookmanagestyles.activeSortText]}>
            Title {getSortArrow("title")}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={{ transform: [{ scale: viewsAnim }] }}>
        <TouchableOpacity
          style={[bookmanagestyles.sortButton, sortBy === "viewCount" && bookmanagestyles.activeSortButton]}
          onPress={() => handleSort("viewCount")}
          onPressIn={() => handlePressIn(viewsAnim)}
          onPressOut={() => handlePressOut(viewsAnim)}
        >
          <Text style={[bookmanagestyles.sortButtonText, sortBy === "viewCount" && bookmanagestyles.activeSortText]}>
            Views {getSortArrow("viewCount")}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={{ transform: [{ scale: ratingAnim }] }}>
        <TouchableOpacity
          style={[bookmanagestyles.sortButton, sortBy === "rating" && bookmanagestyles.activeSortButton]}
          onPress={() => handleSort("rating")}
          onPressIn={() => handlePressIn(ratingAnim)}
          onPressOut={() => handlePressOut(ratingAnim)}
        >
          <Text style={[bookmanagestyles.sortButtonText, sortBy === "rating" && bookmanagestyles.activeSortText]}>
            Rating {getSortArrow("rating")}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default SortHeader;
