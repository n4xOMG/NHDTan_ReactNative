import { api, API_BASE_URL } from "../api/api";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

let stompClient = null;
let isConnected = false;
let onConnectCallback = null;

// Create or get existing chat
export const createOrGetChat = async (otherUserId) => {
  try {
    const response = await api.post(`${API_BASE_URL}/api/chats/${otherUserId}`);
    return response.data;
  } catch (error) {
    console.error("Error creating/getting chat:", error);
    throw error;
  }
};

// Get all chats for the current user
export const getUserChats = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/chats`);
    return response.data;
  } catch (error) {
    console.error("Error getting user chats:", error);
    throw error;
  }
};

// Get messages for a specific chat
export const getChatMessages = async (chatId) => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/chats/${chatId}/messages`);
    return response.data;
  } catch (error) {
    console.error("Error getting chat messages:", error);
    throw error;
  }
};

// Send a message
export const sendMessage = async (messageData) => {
  try {
    // Ensure all required fields are present in the message data
    if (!messageData.sender || !messageData.sender.id) {
      throw new Error("Sender information is missing");
    }

    if (!messageData.receiver || !messageData.receiver.id) {
      throw new Error("Receiver information is missing");
    }

    // Include timestamp if not present
    if (!messageData.timestamp) {
      messageData.timestamp = new Date().toISOString();
    }

    const response = await api.post(`${API_BASE_URL}/api/chats/create-message`, messageData);
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// WebSocket functionality
export const connectToWebSocket = (callback) => {
  if (isConnected && stompClient) {
    if (callback) callback();
    return;
  }

  onConnectCallback = callback;

  const socket = new SockJS(`${API_BASE_URL}/ws`);
  stompClient = Stomp.over(socket);

  stompClient.connect(
    {},
    () => {
      console.log("WebSocket connected");
      isConnected = true;
      if (onConnectCallback) onConnectCallback();
    },
    (error) => {
      console.error("WebSocket connection error:", error);
      isConnected = false;
      // Attempt to reconnect after a delay
      setTimeout(() => connectToWebSocket(callback), 5000);
    }
  );
};

export const disconnectWebSocket = () => {
  if (stompClient && isConnected) {
    stompClient.disconnect();
    isConnected = false;
    console.log("WebSocket disconnected");
  }
};

export const subscribeToChatMessages = (chatId, callback) => {
  if (!isConnected || !stompClient) {
    console.error("Cannot subscribe, WebSocket not connected");
    return;
  }

  // Unsubscribe previous subscription to avoid duplicates
  try {
    stompClient.unsubscribe(`/group/${chatId}/private`);
  } catch (error) {
    // Ignore errors if there was no previous subscription
  }

  const subscription = stompClient.subscribe(`/group/${chatId}/private`, (message) => {
    try {
      const receivedMessage = JSON.parse(message.body);
      console.log("Received WebSocket message:", receivedMessage);
      if (callback) callback(receivedMessage);
    } catch (error) {
      console.error("Error parsing received message:", error);
    }
  });

  console.log(`Subscribed to chat ${chatId}`);
  return subscription;
};

export const sendChatMessage = (chatId, messageData) => {
  if (!isConnected || !stompClient) {
    console.error("Cannot send message, WebSocket not connected");
    return;
  }

  // Ensure timestamp is set
  if (!messageData.timestamp) {
    messageData.timestamp = new Date().toISOString();
  }

  try {
    stompClient.send(`/app/chat/${chatId}`, {}, JSON.stringify(messageData));
    console.log("Message sent via WebSocket:", messageData);
  } catch (error) {
    console.error("Error sending message via WebSocket:", error);
  }
};
