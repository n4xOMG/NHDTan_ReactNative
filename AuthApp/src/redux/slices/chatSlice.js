import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createOrGetChat, getUserChats, getChatMessages, sendMessage } from "../../services/ChatService";

export const createChat = createAsyncThunk("chat/createChat", async (otherUserId, { rejectWithValue }) => {
  try {
    const data = await createOrGetChat(otherUserId);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchUserChats = createAsyncThunk("chat/fetchUserChats", async (_, { rejectWithValue }) => {
  try {
    const data = await getUserChats();
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchChatMessages = createAsyncThunk("chat/fetchChatMessages", async (chatId, { rejectWithValue }) => {
  try {
    const data = await getChatMessages(chatId);
    return { chatId, messages: data };
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const sendChatMessage = createAsyncThunk("chat/sendChatMessage", async (messageData, { rejectWithValue }) => {
  try {
    // Make sure timestamp is included
    const messageWithTimestamp = {
      ...messageData,
      timestamp: messageData.timestamp || new Date().toISOString(),
    };

    const data = await sendMessage(messageWithTimestamp);
    return { ...data, tempId: messageData.tempId };
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

const initialState = {
  chats: [],
  activeChat: null,
  chatMessages: {},
  loading: false,
  error: null,
  wsConnected: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
    addReceivedMessage: (state, action) => {
      const { chatId, message } = action.payload;

      // Initialize messages array if it doesn't exist
      if (!state.chatMessages[chatId]) {
        state.chatMessages[chatId] = [];
      }

      // Check for duplicates by id or tempId
      const messageExists = state.chatMessages[chatId].some(
        (m) => (m.id && m.id === message.id) || (m.tempId && message.tempId && m.tempId === message.tempId)
      );

      if (!messageExists) {
        // Add the message to the array
        state.chatMessages[chatId].push(message);

        // Sort messages by timestamp
        state.chatMessages[chatId].sort((a, b) => {
          const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
          const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
          return dateA - dateB;
        });

        // Update last message in chat list
        const chatIndex = state.chats.findIndex((chat) => chat.id === parseInt(chatId));
        if (chatIndex !== -1) {
          state.chats[chatIndex] = {
            ...state.chats[chatIndex],
            lastMessage: {
              ...message,
              createdAt: message.timestamp,
            },
          };
        }
      } else {
        // If message exists, update it with new data
        const existingIndex = state.chatMessages[chatId].findIndex(
          (m) => (m.id && m.id === message.id) || (m.tempId && message.tempId && m.tempId === message.tempId)
        );

        if (existingIndex !== -1) {
          state.chatMessages[chatId][existingIndex] = {
            ...state.chatMessages[chatId][existingIndex],
            ...message,
            // Keep tempId for consistency
            tempId: state.chatMessages[chatId][existingIndex].tempId || message.tempId,
          };
        }
      }
    },
    setWebSocketConnected: (state, action) => {
      state.wsConnected = action.payload;
    },
    markMessagesAsRead: (state, action) => {
      const { chatId } = action.payload;
      if (state.chatMessages[chatId]) {
        state.chatMessages[chatId] = state.chatMessages[chatId].map((msg) => ({
          ...msg,
          isRead: true,
        }));
      }
    },
    clearChatState: (state) => {
      state.activeChat = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Chat
      .addCase(createChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.loading = false;
        state.activeChat = action.payload;
        // Check if chat already exists in the list
        const existingChatIndex = state.chats.findIndex((chat) => chat.id === action.payload.id);
        if (existingChatIndex >= 0) {
          // Update existing chat
          state.chats[existingChatIndex] = action.payload;
        } else {
          // Add new chat
          state.chats.push(action.payload);
        }
      })
      .addCase(createChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch User Chats
      .addCase(fetchUserChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload;
      })
      .addCase(fetchUserChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Chat Messages
      .addCase(fetchChatMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { chatId, messages } = action.payload;
        // Sort messages by timestamp if available
        const sortedMessages = [...messages].sort((a, b) => {
          const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
          const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
          return dateA - dateB;
        });
        state.chatMessages[chatId] = sortedMessages;
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send Chat Message
      .addCase(sendChatMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.loading = false;
        const chatId = action.payload.chatId;

        if (!state.chatMessages[chatId]) {
          state.chatMessages[chatId] = [];
          return;
        }

        // Find message with matching tempId
        const tempId = action.payload.tempId;
        if (!tempId) return;

        const existingMessageIndex = state.chatMessages[chatId].findIndex((m) => m.tempId === tempId);

        if (existingMessageIndex >= 0) {
          // Update existing message with server data but keep tempId
          state.chatMessages[chatId][existingMessageIndex] = {
            ...action.payload,
            tempId, // Keep tempId for identifying this message
          };
        }

        // Sort messages by timestamp
        state.chatMessages[chatId].sort((a, b) => {
          const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
          const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
          return dateA - dateB;
        });
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setActiveChat, addReceivedMessage, clearChatState, setWebSocketConnected, markMessagesAsRead } = chatSlice.actions;
export default chatSlice.reducer;
