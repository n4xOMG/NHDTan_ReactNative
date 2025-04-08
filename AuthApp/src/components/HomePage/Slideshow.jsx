import React, { useState, useEffect, useRef } from "react";
import { View, Image, Text, Dimensions, TouchableOpacity, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { modernStyles } from "../../style/modernStyles";

const { width } = Dimensions.get("window");

export const Slideshow = ({ books }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    let interval;
    if (books.length > 0) {
      interval = setInterval(() => {
        const nextIndex = (activeIndex + 1) % books.length;
        setActiveIndex(nextIndex);
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
      }, 3000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activeIndex, books.length]);

  const handleViewBookDetails = (bookId) => {
    navigation.navigate("BookDetail", { bookId });
  };

  const handleScroll = (event) => {
    const slideSize = width - 32;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setActiveIndex(index);
  };

  if (!books || books.length === 0) {
    return null;
  }

  return (
    <View style={modernStyles.slideshow}>
      <FlatList
        ref={flatListRef}
        data={books}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        onScroll={handleScroll}
        getItemLayout={(data, index) => ({
          length: width - 32,
          offset: (width - 32) * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise((resolve) => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          });
        }}
        renderItem={({ item }) => (
          <TouchableOpacity style={modernStyles.slide} onPress={() => handleViewBookDetails(item.id)} activeOpacity={0.9}>
            <Image source={{ uri: item.bookCover }} style={modernStyles.slideImage} />
            <View style={modernStyles.slideTitleContainer}>
              <Text style={modernStyles.slideTitle}>{item.title}</Text>
              <Text style={{ color: "white", fontSize: 14 }}>{item.authorName}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <View
        style={{
          position: "absolute",
          bottom: 10,
          flexDirection: "row",
          alignSelf: "center",
        }}
      >
        {books.map((_, index) => (
          <View
            key={index}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: index === activeIndex ? "white" : "rgba(255,255,255,0.5)",
              margin: 4,
            }}
          />
        ))}
      </View>
    </View>
  );
};
