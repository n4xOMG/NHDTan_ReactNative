import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { modernStyles } from "../../style/modernStyles";

export const TopLikedBooks = ({ top10LikedBooks }) => {
  const navigation = useNavigation();

  if (!top10LikedBooks || top10LikedBooks.length === 0) {
    return null;
  }

  const handleBookPress = (bookId) => {
    navigation.navigate("BookDetail", { bookId });
  };

  return (
    <View style={modernStyles.topLikedContainer}>
      <Text style={modernStyles.sectionTitle}>Top Liked Books</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {top10LikedBooks.map((book) => (
          <TouchableOpacity key={book.id} style={modernStyles.topLikedBook} onPress={() => handleBookPress(book.id)} activeOpacity={0.8}>
            <Image source={{ uri: book.bookCover }} style={modernStyles.topLikedCover} resizeMode="cover" />
            <Text style={modernStyles.topLikedTitle} numberOfLines={1}>
              {book.title}
            </Text>
            <Text style={modernStyles.topLikedAuthor} numberOfLines={1}>
              {book.authorName}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
              <Text style={{ ...modernStyles.small, fontWeight: "bold" }}>⭐ {book.rating ? book.rating.toFixed(1) : "N/A"}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
