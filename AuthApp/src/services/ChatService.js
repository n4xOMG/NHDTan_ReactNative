import { api, API_BASE_URL } from "../api/api";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;
let subscriptions = {}; // Track active subscriptions
let isConnecting = false;
let reconnectTimer = null;

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
    if (!messageData.sender || !messageData.sender.id) {
      throw new Error("Sender information is missing");
    }
    if (!messageData.receiver || !messageData.receiver.id) {
      throw new Error("Receiver information is missing");
    }
    if (!messageData.timestamp) {
      messageData.timestamp = new Date().toISOString();
    }

    // Remove imageUrl if it's null to prevent potential server issues
    const dataToSend = { ...messageData };
    if (!dataToSend.imageUrl) {
      delete dataToSend.imageUrl;
    }

    const response = await api.post(`${API_BASE_URL}/api/chats/create-message`, dataToSend);
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// WebSocket functionality
export const connectToWebSocket = (callback) => {
  if (isConnecting) {
    console.log("WebSocket connection already in progress");
    return;
  }

  if (stompClient && stompClient.connected) {
    console.log("WebSocket already connected");
    if (callback) callback();
    return;
  }

  isConnecting = true;
  clearTimeout(reconnectTimer);

  // Clean up any existing connection
  if (stompClient) {
    try {
      stompClient.deactivate();
    } catch (e) {
      console.error("Error deactivating existing STOMP client:", e);
    }
  }

  console.log("Connecting to WebSocket...");

  // Create a WebSocket factory for SockJS
  const webSocketFactory = () => {
    console.log("Creating new SockJS instance");
    return new SockJS(`${API_BASE_URL}/ws`);
  };

  // Initialize STOMP client
  stompClient = new Client({
    webSocketFactory,
    reconnectDelay: 5000, // Reconnect every 5 seconds
    heartbeatIncoming: 4000, // Heartbeat to keep connection alive
    heartbeatOutgoing: 4000,
  });

  // Handle connection success
  stompClient.onConnect = (frame) => {
    console.log("WebSocket connected successfully:", frame);
    isConnecting = false;
    if (callback) callback();
  };

  // Handle connection errors
  stompClient.onStompError = (frame) => {
    console.error("STOMP Error:", frame);
    isConnecting = false;

    // Clear subscriptions on error
    subscriptions = {};

    // Attempt to reconnect
    reconnectTimer = setTimeout(() => {
      connectToWebSocket(callback);
    }, 5000);
  };

  // Handle WebSocket disconnection
  stompClient.onWebSocketClose = (event) => {
    console.log("WebSocket disconnected:", event);
    isConnecting = false;
    subscriptions = {};

    // Attempt to reconnect
    reconnectTimer = setTimeout(() => {
      connectToWebSocket(callback);
    }, 5000);
  };

  // Activate the STOMP client
  try {
    stompClient.activate();
  } catch (error) {
    console.error("Error activating STOMP client:", error);
    isConnecting = false;

    // Attempt to reconnect
    reconnectTimer = setTimeout(() => {
      connectToWebSocket(callback);
    }, 5000);
  }
};

export const disconnectWebSocket = () => {
  clearTimeout(reconnectTimer);
  isConnecting = false;

  if (stompClient) {
    // Unsubscribe from all active subscriptions
    Object.values(subscriptions).forEach((sub) => {
      try {
        if (sub && typeof sub.unsubscribe === "function") {
          sub.unsubscribe();
        }
      } catch (error) {
        console.error("Error unsubscribing:", error);
      }
    });
    subscriptions = {};

    try {
      stompClient.deactivate();
      console.log("WebSocket disconnected");
    } catch (error) {
      console.error("Error disconnecting WebSocket:", error);
    } finally {
      stompClient = null;
    }
  }
};

export const isWebSocketConnected = () => {
  return stompClient !== null && stompClient.connected;
};

export const subscribeToChatMessages = (chatId, callback) => {
  if (!stompClient || !stompClient.connected) {
    console.error("Cannot subscribe, WebSocket not connected");
    return null;
  }

  // Unsubscribe previous subscription for this chat
  if (subscriptions[chatId]) {
    try {
      subscriptions[chatId].unsubscribe();
      console.log(`Unsubscribed from previous subscription for chat ${chatId}`);
    } catch (error) {
      console.error(`Error unsubscribing from chat ${chatId}:`, error);
    }
  }

  const destination = `/group/${chatId}/private`;
  console.log(`Subscribing to destination: ${destination}`);

  try {
    const subscription = stompClient.subscribe(destination, (message) => {
      try {
        const receivedMessage = JSON.parse(message.body);
        console.log("Received WebSocket message:", receivedMessage);
        if (callback) callback(receivedMessage);
      } catch (error) {
        console.error("Error parsing received message:", error);
      }
    });

    // Store the subscription reference
    subscriptions[chatId] = subscription;
    console.log(`Subscribed to chat ${chatId}`);

    return subscription;
  } catch (error) {
    console.error(`Error subscribing to chat ${chatId}:`, error);
    return null;
  }
};

export const sendChatMessage = (chatId, messageData) => {
  if (!stompClient || !stompClient.connected) {
    console.error("Cannot send message, WebSocket not connected");
    return;
  }

  if (!messageData.timestamp) {
    messageData.timestamp = new Date().toISOString();
  }

  try {
    stompClient.publish({
      destination: `/app/chat/${chatId}`,
      body: JSON.stringify(messageData),
    });
    console.log("Message sent via WebSocket:", messageData);
  } catch (error) {
    console.error("Error sending message via WebSocket:", error);
  }
};
