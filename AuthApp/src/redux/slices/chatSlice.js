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
      if (!state.chatMessages[chatId]) {
        state.chatMessages[chatId] = [];
      }

      // Deduplicate by id or tempId
      const existingMessageIndex = state.chatMessages[chatId].findIndex(
        (m) => (m.id && m.id === message.id) || (m.tempId && m.tempId === message.tempId)
      );

      if (existingMessageIndex >= 0) {
        // Update existing message
        state.chatMessages[chatId][existingMessageIndex] = {
          ...state.chatMessages[chatId][existingMessageIndex],
          ...message,
          tempId: state.chatMessages[chatId][existingMessageIndex].tempId || message.tempId,
        };
      } else {
        // Add new message
        state.chatMessages[chatId].push(message);
      }

      // Update last message in chat list
      const chatIndex = state.chats.findIndex((chat) => chat.id === parseInt(chatId));
      if (chatIndex !== -1) {
        state.chats[chatIndex] = {
          ...state.chats[chatIndex],
          lastMessage: { ...message, createdAt: message.timestamp },
        };
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
      state.chatMessages = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.loading = false;
        state.activeChat = action.payload;
        const existingChatIndex = state.chats.findIndex((chat) => chat.id === action.payload.id);
        if (existingChatIndex >= 0) {
          state.chats[existingChatIndex] = action.payload;
        } else {
          state.chats.push(action.payload);
        }
      })
      .addCase(createChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
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
      .addCase(fetchChatMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { chatId, messages } = action.payload;
        state.chatMessages[chatId] = messages;
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendChatMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.loading = false;
        const { chatId, tempId } = action.payload;
        if (!state.chatMessages[chatId]) {
          state.chatMessages[chatId] = [];
        }

        // Update existing message by tempId
        const existingMessageIndex = state.chatMessages[chatId].findIndex((m) => m.tempId === tempId);
        if (existingMessageIndex >= 0) {
          state.chatMessages[chatId][existingMessageIndex] = { ...action.payload, tempId };
        }
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setActiveChat, addReceivedMessage, clearChatState, setWebSocketConnected, markMessagesAsRead } = chatSlice.actions;
export default chatSlice.reducer;
