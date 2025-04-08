import React from "react";
import { View, Text, Image, TouchableOpacity, Animated } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { bookmanagestyles } from "../style/bookmanagestyles";

const BookItem = ({ item, onEdit, onDelete }) => {
  // Create animated value for simple press feedback
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[bookmanagestyles.bookItem, { transform: [{ scale: scaleAnim }] }]}>
      <Image
        source={{
          uri: item.bookCover || "https://via.placeholder.com/100x150?text=No+Cover",
        }}
        style={bookmanagestyles.bookImage}
        resizeMode="cover"
      />
      <View style={bookmanagestyles.bookInfo}>
        <View>
          <Text style={bookmanagestyles.bookTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={bookmanagestyles.bookAuthor}>by {item.authorName || "Unknown Author"}</Text>
          <Text style={bookmanagestyles.bookCategory}>{item.categoryName || "Uncategorized"}</Text>
        </View>

        <View>
          <View style={bookmanagestyles.bookDetails}>
            <View style={bookmanagestyles.statsContainer}>
              <Text style={bookmanagestyles.statItem}>
                <Ionicons name="eye-outline" size={14} color="#5d7bff" /> {item.viewCount || 0}
              </Text>
              <Text style={bookmanagestyles.statItem}>
                <Ionicons name="heart-outline" size={14} color="#ff5d7b" /> {item.favCount || 0}
              </Text>
              <Text style={bookmanagestyles.statItem}>
                <Ionicons name="star-outline" size={14} color="#ffbe0b" /> {item.avgRating?.toFixed(1) || "N/A"}
              </Text>
            </View>
            <Text style={bookmanagestyles.bookStatus}>{item.status || "Unknown"}</Text>
          </View>
          <Text style={bookmanagestyles.chaptersInfo}>
            <Ionicons name="document-text-outline" size={14} /> Chapters: {item.chapterCount || 0}
          </Text>
        </View>
      </View>

      <View style={bookmanagestyles.actionButtons}>
        <TouchableOpacity
          onPress={() => onEdit(item)}
          style={bookmanagestyles.editButton}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <MaterialIcons name="edit" size={22} color="#5d7bff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          style={bookmanagestyles.deleteButton}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <MaterialIcons name="delete" size={22} color="#ff5d7b" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default BookItem;
