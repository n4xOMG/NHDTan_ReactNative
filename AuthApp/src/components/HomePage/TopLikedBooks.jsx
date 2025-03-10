import React from "react";
import { FlatList, Image, Text, View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { styles } from "../../style/styles";

export const TopLikedBooks = ({ top10LikedBooks }) => {
  const navigation = useNavigation();

  const renderBook = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate("BookDetail", { book: item })}>
      <View style={styles.topBookItem}>
        <Image source={{ uri: item.bookCover }} style={styles.topBookImage} />
        <View style={styles.topBookDetails}>
          <Text style={styles.topBookTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.topBookAuthor} numberOfLines={1}>
            {item.authorName || "Unknown Author"}
          </Text>
          <Text style={styles.topBookRating}>Rating: {item.rating ? item.rating.toFixed(1) : "N/A"}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.section, styles.topBooks]}>
      <Text style={styles.text}>Top 10 Liked Books</Text>
      <FlatList
        data={top10LikedBooks}
        renderItem={renderBook}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.topBooksList}
      />
    </View>
  );
};
