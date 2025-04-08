import axios from "axios";
import { api, API_BASE_URL } from "../api/api";

export const getUserProfileByJwt = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/user/profile`);
    return response.data;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};

export const getUserCount = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/count`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user count:", error);
    throw error;
  }
};

export const getAllUsers = async (page = 0, size = 10, searchTerm = "") => {
  try {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("size", size);
    if (searchTerm) {
      params.append("searchTerm", searchTerm);
    }

    const response = await api.get(`${API_BASE_URL}/admin/users?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const updateUserStatus = async (userId, isSuspended, isBanned, banReason) => {
  try {
    const response = await api.put(`${API_BASE_URL}/users/${userId}/status`, {
      isSuspended,
      isBanned,
      banReason,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error;
  }
};
