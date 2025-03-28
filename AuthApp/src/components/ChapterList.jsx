import { AntDesign } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import * as Progress from "react-native-progress";
import { useSelector } from "react-redux";
import { unlockChapter } from "../services/ChapterServices";
import { chapteritemstyles } from "../style/chapteritemstyles";

const ChapterList = ({ chapters, navigation, onChapterUnlocked }) => {
  const readingProgress = useSelector((state) => state.books.readingProgress);
  const user = useSelector((state) => state.auth.user);

  const getChapterProgress = (chapterId) => {
    const progress = readingProgress.find((p) => p.chapterId === chapterId);
    return progress ? progress.progress : 0;
  };

  const handleUnlockChapter = async (chapter) => {
    if (user.credits < chapter.price) {
      Alert.alert(
        "Not Enough Credits",
        `You need ${chapter.price} credits, but you only have ${user.credits}. Do you want to purchase more credits?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Go to Purchase",
            onPress: () => navigation.navigate("PaymentScreen"), // Navigate to purchase screen
          },
        ],
        { cancelable: true }
      );
      return;
    }

    Alert.alert(
      "Unlock Chapter",
      `This chapter costs ${chapter.price} credits. Do you want to unlock it?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unlock",
          onPress: async () => {
            try {
              const updatedChapter = await unlockChapter({ chapterId: chapter.id });
              onChapterUnlocked(chapter.id, updatedChapter); // Update parent state
              Alert.alert("Success", "Chapter unlocked successfully!");
              navigation.navigate("ChapterDetail", { chapterId: chapter.id });
            } catch (error) {
              Alert.alert("Error", error.message || "Failed to unlock chapter.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleChapterPress = (chapter) => {
    if (chapter.unlockedByUser || chapter.price === 0) {
      const chapterId = chapter.id;
      navigation.navigate("ChapterDetail", { chapterId });
    } else {
      handleUnlockChapter(chapter);
    }
  };

  const renderChapterItem = ({ item }) => (
    <TouchableOpacity style={chapteritemstyles.chapterItem} onPress={() => handleChapterPress(item)}>
      <View style={chapteritemstyles.chapterHeader}>
        <Text style={chapteritemstyles.chapterTitle}>
          Chapter {item.chapterNum}: {item.title}
        </Text>
        {!item.unlockedByUser && item.price > 0 && (
          <TouchableOpacity onPress={() => handleUnlockChapter(item)}>
            <AntDesign name="lock" size={20} color="gray" />
          </TouchableOpacity>
        )}
      </View>
      <View style={chapteritemstyles.progressContainer}>
        <Progress.Bar
          style={chapteritemstyles.progressBar}
          progress={getChapterProgress(item.id) / 100}
          color="#4CAF50"
          width={null}
          height={8}
        />
        <Text style={chapteritemstyles.progressText}>{Math.round(getChapterProgress(item.id))}%</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={chapteritemstyles.container}>
      <Text style={chapteritemstyles.sectionTitle}>Chapters</Text>
      <FlatList
        data={chapters}
        renderItem={renderChapterItem}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        style={chapteritemstyles.chapterList}
      />
    </View>
  );
};

export default ChapterList;
