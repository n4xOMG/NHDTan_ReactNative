import React, { useState, useEffect, useRef } from "react";
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
import { useRoute, useNavigation } from "@react-navigation/native";
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
} from "../redux/slices/chatSlice";
import {
  connectToWebSocket,
  disconnectWebSocket,
  subscribeToChatMessages,
  sendChatMessage as sendWsMessage,
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

  useEffect(() => {
    // Set the chat partner's name as the title
    navigation.setOptions({
      title: username || "Chat",
    });

    // Initialize chat
    initializeChat();

    // Cleanup on component unmount
    return () => {
      disconnectWebSocket();
      dispatch(clearChatState());
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatMessages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages]);

  const initializeChat = async () => {
    try {
      // Create or get existing chat with the other user
      const chatAction = await dispatch(createChat(otherUserId));
      if (createChat.fulfilled.match(chatAction)) {
        const chat = chatAction.payload;
        console.log("Chat created/retrieved:", chat);

        // Set active chat
        dispatch(setActiveChat(chat));

        // Fetch messages for this chat
        dispatch(fetchChatMessages(chat.id));

        // Connect to WebSocket
        connectToWebSocket(() => {
          // Subscribe to chat messages once connected
          subscribeToChatMessages(chat.id, (receivedMessage) => {
            console.log("Received message via WebSocket:", receivedMessage);

            // Only add the message if it's from the other user
            // This prevents duplicate messages when sending messages through both API and WebSocket
            if (receivedMessage.sender && receivedMessage.sender.id !== currentUser.id) {
              dispatch(addReceivedMessage({ chatId: chat.id, message: receivedMessage }));
            }
          });
        });
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
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
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Could not select image");
    }
  };

  const handleSend = async () => {
    if ((!message.trim() && !selectedImage) || !activeChat) return;

    try {
      setIsUploading(selectedImage !== null);

      // Upload image if selected
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await UploadToCloudinary(selectedImage, "chat_images");
      }

      // Create complete message data with sender information
      const messageData = {
        chatId: activeChat.id,
        content: message.trim(),
        imageUrl: imageUrl,
        sender: {
          id: currentUser.id,
          username: currentUser.username,
          email: currentUser.email,
          fullname: currentUser.fullname,
          avatarUrl: currentUser.avatarUrl,
        },
        receiver: {
          id: otherUserId,
        },
        timestamp: new Date().toISOString(),
      };

      console.log("Sending message:", messageData);

      // Send through API
      dispatch(sendChatMessage(messageData));

      // Also send through WebSocket for real-time delivery
      sendWsMessage(activeChat.id, messageData);

      // Clear input and selected image
      setMessage("");
      setSelectedImage(null);
      setIsUploading(false);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsUploading(false);
      Alert.alert("Error", "Failed to send message");
    }
  };

  const getOtherUser = () => {
    if (!activeChat) return null;

    // Determine which user in the chat is not the current user
    if (activeChat.userOne.id === currentUser.id) {
      return activeChat.userTwo;
    } else {
      return activeChat.userOne;
    }
  };

  const renderMessage = ({ item }) => {
    // Determine if the message is from the current user
    const isMyMessage = item.sender && item.sender.id === currentUser.id;

    return (
      <View style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.theirMessage]}>
        {item.content && item.content.trim() !== "" && (
          <Text style={[styles.messageText, isMyMessage ? styles.myMessageText : styles.theirMessageText]}>{item.content}</Text>
        )}
        {item.imageUrl && (
          <TouchableOpacity
            onPress={() => {
              // You could add a lightbox or full-screen image view here
              console.log("Image pressed:", item.imageUrl);
            }}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
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
              <Text style={styles.headerStatus}>Online</Text>
            </View>
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={chatMessages}
          keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
          renderItem={renderMessage}
          contentContainerStyle={[styles.messagesContainer, chatMessages.length === 0 && styles.emptyMessagesContainer]}
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
          <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
            <Ionicons name="image-outline" size={24} color="#3498db" />
          </TouchableOpacity>

          <TextInput style={styles.input} value={message} onChangeText={setMessage} placeholder="Type a message..." multiline />

          {isUploading ? (
            <View style={styles.sendButton}>
              <ActivityIndicator size="small" color="white" />
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.sendButton, !message.trim() && !selectedImage && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!message.trim() && !selectedImage}
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
});

export default ChatScreen;
