import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { styles } from "../../style/styles";

export const BookItem = ({ book }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity onPress={() => navigation.navigate("BookDetail", { book })}>
      <View style={styles.bookItem}>
        <Image source={{ uri: book.bookCover }} style={styles.bookImage} />
        <View>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text>{book.authorName || "Unknown Author"}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
