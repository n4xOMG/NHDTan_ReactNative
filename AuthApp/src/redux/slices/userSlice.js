import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as UserServices from "../../services/UserServices";

export const fetchUserProfile = createAsyncThunk("users/fetchUserProfile", async (userId, { rejectWithValue }) => {
  try {
    const response = await UserServices.getUserProfileById(userId);
    return response;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const toggleFollowUser = createAsyncThunk("users/toggleFollow", async (userId, { getState, rejectWithValue }) => {
  try {
    const {
      user: { profileView },
    } = getState();
    const isFollowing = profileView?.isFollowedByCurrentUser;

    let response;
    if (isFollowing) {
      response = await UserServices.unfollowUser(userId);
    } else {
      response = await UserServices.followUser(userId);
    }

    return { userId, isFollowing: !isFollowing };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const initialState = {
  profileView: null,
  profileLoading: false,
  profileError: null,
  userProfiles: {},
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearProfileView: (state) => {
      state.profileView = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profileView = action.payload;
        state.userProfiles[action.payload.id] = action.payload;
        state.profileLoading = false;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload;
      })
      .addCase(toggleFollowUser.fulfilled, (state, action) => {
        const { userId, isFollowing } = action.payload;

        if (state.profileView && state.profileView.id === userId) {
          state.profileView.isFollowedByCurrentUser = isFollowing;
        }

        if (state.userProfiles[userId]) {
          state.userProfiles[userId].isFollowedByCurrentUser = isFollowing;
        }
      });
  },
});

export const { clearProfileView } = userSlice.actions;
export default userSlice.reducer;
