import React from "react";
import { View, TextInput, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { bookmanagestyles } from "../style/bookmanagestyles";

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  // Create animated value for focus effect
  const focusAnim = new Animated.Value(0);

  const handleFocus = () => {
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  // Interpolate animation values
  const shadowOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.2],
  });

  const shadowRadius = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 12],
  });

  return (
    <Animated.View
      style={[
        bookmanagestyles.searchContainer,
        {
          shadowOpacity,
          shadowRadius,
        },
      ]}
    >
      <Ionicons name="search" size={20} color="#5d7bff" style={bookmanagestyles.searchIcon} />
      <TextInput
        style={bookmanagestyles.searchInput}
        placeholder="Search books by title, author or category..."
        placeholderTextColor="#aab"
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {searchQuery ? (
        <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close-circle" size={22} color="#aab" />
        </TouchableOpacity>
      ) : null}
    </Animated.View>
  );
};

export default SearchBar;
