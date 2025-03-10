import React, { useState } from "react";
import { Dimensions, Image, View } from "react-native";
import Carousel from "react-native-reanimated-carousel"; // Assuming you're using this
import { styles } from "../../style/styles";

const { width } = Dimensions.get("window");

export const Slideshow = ({ books }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  // Fallback to placeholders if books is empty
  const images =
    books.length > 0
      ? books.map((book) => ({ id: book.id, uri: book.bookCover }))
      : [
          { id: 1, uri: "https://via.placeholder.com/400x200" },
          { id: 2, uri: "https://via.placeholder.com/400x200/ff7f7f" },
          { id: 3, uri: "https://via.placeholder.com/400x200/77ff77" },
        ];

  return (
    <View style={styles.slideshow}>
      <Carousel
        width={width * 0.9}
        height={200}
        data={images}
        renderItem={({ item }) => <Image source={{ uri: item.uri }} style={styles.slideImage} />}
        onSnapToItem={(index) => setActiveSlide(index)}
      />
    </View>
  );
};
