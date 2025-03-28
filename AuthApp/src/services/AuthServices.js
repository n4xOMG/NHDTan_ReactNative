import axios from "axios";
import { api, API_BASE_URL } from "../api/api";

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/signin`, { email, password });
    return response.data;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};

export const register = async (email, password, username) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/signup`, { email, password, username });
    return response.data;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
    return response.data;
  } catch (error) {
    console.error("Error during forgot password request:", error);
    throw error;
  }
};

export const verifyOtp = async (email, otp, context) => {
  const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, { email, otp, context });
  return response.data;
};

export const resetPassword = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, { email, password });
    return response.data;
  } catch (error) {
    console.error("Error during password reset:", error);
    throw error;
  }
};

export const getCurrentUserFromToken = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/user/profile`);
    return response.data;
  } catch (error) {
    console.error("API error:", error.message);
    throw error;
  }
};

export const updateUserProfile = async (reqData) => {
  try {
    console.log("API called with data:", reqData);
    const response = await api.put(`${API_BASE_URL}/api/user/profile`, reqData);
    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("API error:", error.message);
    throw error;
  }
};

export const updateUserEmail = async (email) => {
  try {
    const response = await api.post(`${API_BASE_URL}/api/user/update-email`, { email });
    return response.data;
  } catch (error) {
    console.log("Api error: ", error.message);
  }
};
