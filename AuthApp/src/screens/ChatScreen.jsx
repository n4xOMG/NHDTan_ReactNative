import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Alert,
} from "react-native";
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  createChat,
  fetchChatMessages,
  sendChatMessage,
  setActiveChat,
  addReceivedMessage,
  clearChatState,
  setWebSocketConnected,
  markMessagesAsRead,
} from "../redux/slices/chatSlice";
import {
  connectToWebSocket,
  disconnectWebSocket,
  subscribeToChatMessages,
  sendChatMessage as sendWsMessage,
  isWebSocketConnected,
} from "../services/ChatService";
import UploadToCloudinary from "../utils/uploadToCloudinary";

const ChatScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const flatListRef = useRef(null);
  const { otherUserId, username } = route.params;

  const currentUser = useSelector((state) => state.auth.user);
  const activeChat = useSelector((state) => state.chat.activeChat);
  const chatMessages = useSelector((state) => (state.chat.activeChat ? state.chat.chatMessages[state.chat.activeChat.id] || [] : []));
  const loading = useSelector((state) => state.chat.loading);
  const error = useSelector((state) => state.chat.error);
  const wsConnected = useSelector((state) => state.chat.wsConnected);

  const subscriptionRef = useRef(null);

  // Sort messages by timestamp for rendering
  const sortedMessages = [...chatMessages].sort((a, b) => {
    const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
    const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
    return dateA - dateB;
  });

  // Handle incoming WebSocket messages
  const handleReceivedMessage = useCallback(
    (receivedMessage) => {
      if (!activeChat) return;

      // Skip messages with no content
      if (!receivedMessage.content && !receivedMessage.imageUrl) return;

      // More robust duplicate detection
      const isDuplicate = chatMessages.some(
        (m) =>
          // Match by ID
          (m.id && receivedMessage.id && m.id === receivedMessage.id) ||
          // Match by tempId
          (m.tempId && receivedMessage.tempId && m.tempId === receivedMessage.tempId) ||
          // Match by timestamp and content (fallback)
          (m.timestamp === receivedMessage.timestamp &&
            m.content === receivedMessage.content &&
            m.sender?.id === receivedMessage.sender?.id)
      );

      // Don't process duplicate messages
      if (isDuplicate) return;

      // Proceed with message processing
      const formattedMessage = {
        ...receivedMessage,
        chatId: activeChat.id,
        tempId: receivedMessage.tempId || receivedMessage.id || `temp-${Date.now()}-${Math.random()}`,
      };

      dispatch(
        addReceivedMessage({
          chatId: activeChat.id,
          message: formattedMessage,
        })
      );

      if (receivedMessage.sender?.id !== currentUser.id) {
        dispatch(markMessagesAsRead({ chatId: activeChat.id }));
      }
    },
    [activeChat, currentUser?.id, dispatch]
  );

  useEffect(() => {
    navigation.setOptions({
      title: username || "Chat",
    });

    initializeChat();

    return () => {
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        } catch (error) {
          console.error("Error unsubscribing:", error);
        }
      }
      disconnectWebSocket();
      dispatch(clearChatState());
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      const checkAndReconnect = async () => {
        if (!isWebSocketConnected()) {
          console.log("WebSocket disconnected, reconnecting...");
          connectToWebSocket(() => {
            dispatch(setWebSocketConnected(true));
            setupChatSubscription();
          });
        }
      };

      checkAndReconnect();
      const intervalId = setInterval(checkAndReconnect, 10000);

      return () => clearInterval(intervalId);
    }, [activeChat])
  );

  // Optimize the dependency array by removing chatMessages
  const setupChatSubscription = useCallback(() => {
    if (!activeChat) return;

    const attemptSubscription = (retries = 3, delay = 1000) => {
      if (!isWebSocketConnected()) {
        if (retries > 0) {
          console.log(`WebSocket not connected, retrying in ${delay}ms...`);
          setTimeout(() => attemptSubscription(retries - 1, delay * 2), delay);
        } else {
          console.error("Failed to subscribe: WebSocket not connected after retries");
        }
        return;
      }

      const subscription = subscribeToChatMessages(activeChat.id, handleReceivedMessage);
      if (subscription) {
        if (subscriptionRef.current) {
          try {
            subscriptionRef.current.unsubscribe();
          } catch (e) {
            console.warn("Error unsubscribing:", e);
          }
        }
        subscriptionRef.current = subscription;
      }

      dispatch(markMessagesAsRead({ chatId: activeChat.id }));
    };

    attemptSubscription();
  }, [activeChat, handleReceivedMessage, dispatch]);

  useEffect(() => {
    if (activeChat) {
      setupChatSubscription();
    }
  }, [activeChat, setupChatSubscription]);

  // Better management of auto-scrolling with memoized scrollToEnd function
  const scrollToEnd = useCallback(
    (animated = false) => {
      if (flatListRef.current && sortedMessages.length > 0) {
        try {
          flatListRef.current.scrollToEnd({ animated });
        } catch (error) {
          console.warn("Failed to scroll to end:", error);
        }
      }
    },
    [sortedMessages.length]
  );

  // Replace the scrolling effect with a more reliable implementation
  useEffect(() => {
    if (sortedMessages.length === 0) return;

    const timer = setTimeout(() => {
      scrollToEnd(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [sortedMessages.length, scrollToEnd]);

  const initializeChat = async () => {
    try {
      const chatAction = await dispatch(createChat(otherUserId));
      if (createChat.fulfilled.match(chatAction)) {
        const chat = chatAction.payload;
        dispatch(setActiveChat(chat));
        dispatch(fetchChatMessages(chat.id));

        connectToWebSocket(() => {
          dispatch(setWebSocketConnected(true));
          setupChatSubscription();
        });
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
      dispatch(setWebSocketConnected(false));
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission required", "You need to give permission to access your photos");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.4,
        base64: false,
        exif: false,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        if (result.assets[0].fileSize && result.assets[0].fileSize > 2 * 1024 * 1024) {
          Alert.alert("Large Image", "The selected image is large and may take longer to upload. Continue?", [
            { text: "Cancel", style: "cancel", onPress: () => setSelectedImage(null) },
            { text: "Continue", onPress: () => setSelectedImage(result.assets[0]) },
          ]);
        } else {
          setSelectedImage(result.assets[0]);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Could not select image");
    }
  };

  const handleSend = async () => {
    if ((!message.trim() && !selectedImage) || !activeChat) return;

    try {
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      let imageUrl = null;

      if (selectedImage) {
        setIsUploading(true);
        const imageToUpload = {
          uri: selectedImage.uri,
          type: "image/jpeg",
          name: `chat_image_${Date.now()}.jpg`,
        };

        const initialMessage = {
          chatId: activeChat.id,
          content: message.trim(),
          sender: {
            id: currentUser.id,
            username: currentUser.username,
            email: currentUser.email,
            fullname: currentUser.fullname,
            avatarUrl: currentUser.avatarUrl,
          },
          receiver: { id: otherUserId },
          timestamp: new Date().toISOString(),
          tempId,
          isUploading: true,
        };

        dispatch(
          addReceivedMessage({
            chatId: activeChat.id,
            message: initialMessage,
          })
        );

        try {
          imageUrl = await UploadToCloudinary(imageToUpload, "chat_images");
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          if (message.trim()) {
            Alert.alert("Upload failed", "Could not upload image, but your text message will be sent.", [{ text: "OK" }]);
          } else {
            setIsUploading(false);
            Alert.alert("Upload failed", "Could not upload image. Please try again.");
            return;
          }
        }
      }

      const finalMessageData = {
        chatId: activeChat.id,
        content: message.trim(),
        imageUrl,
        sender: {
          id: currentUser.id,
          username: currentUser.username,
          email: currentUser.email,
          fullname: currentUser.fullname,
          avatarUrl: currentUser.avatarUrl,
        },
        receiver: { id: otherUserId },
        timestamp: new Date().toISOString(),
        tempId,
        isUploading: false,
      };

      // Update UI with final message only if no image (to avoid duplicate dispatch)
      if (!selectedImage) {
        dispatch(
          addReceivedMessage({
            chatId: activeChat.id,
            message: finalMessageData,
          })
        );
      }

      // Send to server
      dispatch(sendChatMessage(finalMessageData));

      // Send via WebSocket
      sendWsMessage(activeChat.id, finalMessageData);

      setMessage("");
      setSelectedImage(null);
      setIsUploading(false);

      // Use the memoized scrollToEnd function
      setTimeout(() => scrollToEnd(true), 300);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsUploading(false);
      Alert.alert("Error", "Failed to send message: " + error.message);
    }
  };

  const getOtherUser = () => {
    if (!activeChat) return null;
    return activeChat.userOne.id === currentUser.id ? activeChat.userTwo : activeChat.userOne;
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender && item.sender.id === currentUser.id;

    return (
      <View style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.theirMessage]}>
        {item.content && item.content.trim() !== "" && (
          <Text style={[styles.messageText, isMyMessage ? styles.myMessageText : styles.theirMessageText]}>{item.content}</Text>
        )}
        {item.isUploading && (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="small" color={isMyMessage ? "white" : "#3498db"} />
            <Text style={[styles.uploadingText, isMyMessage ? { color: "white" } : { color: "#666" }]}>Uploading image...</Text>
          </View>
        )}
        {item.imageUrl && (
          <TouchableOpacity onPress={() => console.log("Image pressed:", item.imageUrl)}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.messageImage}
              resizeMode="cover"
              onError={(e) => console.error("Image loading error:", e.nativeEvent.error)}
            />
          </TouchableOpacity>
        )}
        <Text style={[styles.messageTime, isMyMessage ? styles.myMessageTime : styles.theirMessageTime]}>
          {item.timestamp
            ? new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
    );
  };

  if (loading && !activeChat) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {typeof error === "string" ? error : JSON.stringify(error)}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={initializeChat}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const otherUser = getOtherUser();

  const renderConnectionStatus = () => {
    if (!wsConnected) {
      return (
        <TouchableOpacity style={styles.connectionStatusBanner} onPress={() => initializeChat()}>
          <Text style={styles.connectionStatusText}>
            <Ionicons name="wifi-outline" size={16} color="#fff" /> Reconnecting...
          </Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        {otherUser && (
          <View style={styles.chatHeader}>
            <Image source={{ uri: otherUser.avatarUrl || "https://via.placeholder.com/40" }} style={styles.headerAvatar} />
            <View style={styles.headerInfo}>
              <Text style={styles.headerName}>{otherUser.fullname || otherUser.username}</Text>
              <Text style={styles.headerStatus}>{wsConnected ? "Online" : "Connecting..."}</Text>
            </View>
          </View>
        )}
        {renderConnectionStatus()}
        <FlatList
          ref={flatListRef}
          data={sortedMessages}
          keyExtractor={(item, index) => (item.id ? item.id.toString() : item.tempId || `msg-${index}`)}
          renderItem={renderMessage}
          contentContainerStyle={[styles.messagesContainer, sortedMessages.length === 0 && styles.emptyMessagesContainer]}
          onContentSizeChange={() => scrollToEnd(false)}
          onLayout={() => scrollToEnd(false)}
          removeClippedSubviews={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubText}>Start the conversation!</Text>
            </View>
          }
        />
        {selectedImage && (
          <View style={styles.selectedImageContainer}>
            <Image source={{ uri: selectedImage.uri }} style={styles.selectedImagePreview} />
            <TouchableOpacity style={styles.removeImageButton} onPress={() => setSelectedImage(null)}>
              <Ionicons name="close-circle" size={24} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton} onPress={pickImage} disabled={isUploading}>
            <Ionicons name="image-outline" size={24} color={isUploading ? "#cccccc" : "#3498db"} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            multiline
            editable={!isUploading}
          />
          {isUploading ? (
            <View style={styles.sendButton}>
              <ActivityIndicator size="small" color="white" />
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.sendButton, !message.trim() && !selectedImage && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={(!message.trim() && !selectedImage) || isUploading}
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#e74c3c",
    marginBottom: 15,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  headerStatus: {
    fontSize: 12,
    color: "#4CAF50",
  },
  messagesContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  emptyMessagesContainer: {
    flex: 1,
    justifyContent: "center",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 18,
    marginVertical: 5,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#3498db",
    borderBottomRightRadius: 5,
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: "white",
  },
  theirMessageText: {
    color: "#333",
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginTop: 5,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  myMessageTime: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  theirMessageTime: {
    color: "#888",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
    backgroundColor: "#f9f9f9",
  },
  sendButton: {
    backgroundColor: "#3498db",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: "#9eb4c7",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#888",
  },
  emptySubText: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 8,
  },
  selectedImageContainer: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    flexDirection: "row",
    alignItems: "center",
  },
  selectedImagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
  },
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "white",
    borderRadius: 12,
  },
  attachButton: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  connectionStatusBanner: {
    backgroundColor: "#e74c3c",
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  connectionStatusText: {
    color: "#fff",
    fontWeight: "bold",
  },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  uploadingText: {
    marginLeft: 5,
    fontSize: 12,
  },
});

export default ChatScreen;
