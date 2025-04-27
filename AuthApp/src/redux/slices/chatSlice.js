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

export const sendChatMessage = createAsyncThunk("chat/sendChatMessage", async (messageData, { rejectWithValue, getState }) => {
  try {
    // Make sure timestamp is included
    const messageWithTimestamp = {
      ...messageData,
      timestamp: messageData.timestamp || new Date().toISOString(),
    };

    const data = await sendMessage(messageWithTimestamp);
    return data;
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

      // Check if message already exists to avoid duplicates
      const messageExists = state.chatMessages[chatId].some((m) => m.id === message.id);

      if (!messageExists) {
        state.chatMessages[chatId].push(message);
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
        state.loading = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.loading = false;
        const chatId = action.payload.chatId;
        if (!state.chatMessages[chatId]) {
          state.chatMessages[chatId] = [];
        }

        // Check if message already exists
        const messageExists = state.chatMessages[chatId].some((m) => m.id === action.payload.id);

        if (!messageExists) {
          state.chatMessages[chatId].push(action.payload);
        }
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setActiveChat, addReceivedMessage, clearChatState } = chatSlice.actions;
export default chatSlice.reducer;
