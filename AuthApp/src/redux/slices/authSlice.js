import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  forgotPassword,
  getCurrentUserFromToken,
  login,
  register,
  resetPassword,
  updateUserEmail,
  updateUserProfile,
  verifyOtp,
} from "../../services/AuthServices";

// Async thunks for async actions
export const loginUser = createAsyncThunk("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    const data = await login(email, password);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const registerUser = createAsyncThunk("auth/register", async ({ email, password, username }, { rejectWithValue }) => {
  try {
    const data = await register(email, password, username);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const forgotPasswordRequest = createAsyncThunk("auth/forgotPassword", async (email, { rejectWithValue }) => {
  try {
    const data = await forgotPassword(email);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const verifyOtpCode = createAsyncThunk("auth/verifyOtp", async ({ email, otp, context }, { rejectWithValue }) => {
  try {
    const data = await verifyOtp(email, otp, context);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const resetUserPassword = createAsyncThunk("auth/resetPassword", async ({ email, password }, { rejectWithValue }) => {
  try {
    const data = await resetPassword(email, password);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const getProfileFromToken = createAsyncThunk("auth/getProfile", async (_, { rejectWithValue }) => {
  try {
    const data = await getCurrentUserFromToken();
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const updateProfile = createAsyncThunk("auth/updateProfile", async (reqData, { rejectWithValue }) => {
  try {
    const data = await updateUserProfile(reqData);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const updateEmail = createAsyncThunk("auth/updateEmail", async (email, { rejectWithValue }) => {
  try {
    const data = await updateUserEmail(email);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

// Initial state
const initialState = {
  isLoggedIn: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.token = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Forgot Password
      .addCase(forgotPasswordRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPasswordRequest.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPasswordRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify OTP
      .addCase(verifyOtpCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtpCode.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(verifyOtpCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reset Password
      .addCase(resetUserPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetUserPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Profile From Token
      .addCase(getProfileFromToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfileFromToken.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getProfileFromToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Email
      .addCase(updateEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user.email = action.payload.email;
      })
      .addCase(updateEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
