import React, { useState, useRef } from "react";
import { View, Image, StyleSheet, Dimensions, TouchableOpacity, StatusBar, Text, ActivityIndicator, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const ImageGalleryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { images, initialIndex = 0 } = route.params;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loading, setLoading] = useState({});
  const flatListRef = useRef(null);

  // Scroll to initial index when component mounts
  React.useEffect(() => {
    if (flatListRef.current && initialIndex > 0) {
      flatListRef.current.scrollToIndex({
        index: initialIndex,
        animated: false,
      });
    }
  }, [initialIndex]);

  const handleImageLoad = (index) => {
    setLoading((prev) => ({
      ...prev,
      [index]: false,
    }));
  };

  const handleViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const renderItem = ({ item, index }) => (
    <View style={styles.imageContainer}>
      {loading[index] !== false && <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />}
      <Image source={{ uri: item }} style={styles.image} resizeMode="contain" onLoad={() => handleImageLoad(index)} />
    </View>
  );

  const handleClose = () => {
    navigation.goBack();
  };

  const goToPreviousImage = () => {
    if (currentIndex > 0) {
      flatListRef.current.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
    }
  };

  const goToNextImage = () => {
    if (currentIndex < images.length - 1) {
      flatListRef.current.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <AntDesign name="close" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {currentIndex + 1} / {images.length}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderItem}
        keyExtractor={(_, index) => `image-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={3}
      />

      <View style={styles.navigationControls}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.disabledNavButton]}
          onPress={goToPreviousImage}
          disabled={currentIndex === 0}
        >
          <AntDesign name="left" size={24} color={currentIndex === 0 ? "#555" : "white"} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, currentIndex === images.length - 1 && styles.disabledNavButton]}
          onPress={goToNextImage}
          disabled={currentIndex === images.length - 1}
        >
          <AntDesign name="right" size={24} color={currentIndex === images.length - 1 ? "#555" : "white"} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  imageContainer: {
    width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: width,
    height: height * 0.8,
  },
  loader: {
    position: "absolute",
    zIndex: 1,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  counterContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  counterText: {
    color: "white",
    fontWeight: "bold",
  },
  navigationControls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  disabledNavButton: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
});

export default ImageGalleryScreen;
