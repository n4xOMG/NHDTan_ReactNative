import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getUnreadNotifications, updateAllNotificationsAsRead } from "../../services/NotificationServices";

// Thunk to fetch unread notifications
export const fetchUnreadNotifications = createAsyncThunk("notifications/fetchUnreadNotifications", async (_, { rejectWithValue }) => {
  try {
    const response = await getUnreadNotifications();
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

// Thunk to mark all notifications as read
export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllNotificationsAsRead",
  async (notificationIds, { rejectWithValue }) => {
    try {
      await updateAllNotificationsAsRead(notificationIds);
      return notificationIds;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  unreadNotifications: [],
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Add new notification from WebSocket
    addNotification: (state, action) => {
      state.unreadNotifications.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnreadNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.unreadNotifications = action.payload;
      })
      .addCase(fetchUnreadNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.loading = false;
        state.unreadNotifications = []; // Clear unread notifications
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
