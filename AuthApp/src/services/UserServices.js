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

export const getUserActivityLogs = async (username, page = 0, size = 20) => {
  try {
    const response = await api.get(`${API_BASE_URL}/admin/logs/user/${username}`, {
      params: { page, size },
    });

    // Check if the response matches the LogPageResponse structure
    if (response.data && Array.isArray(response.data.logs)) {
      // Process logs from the proper structure
      const processedLogs = response.data.logs.map((logEntry, index) => {
        // Extract timestamp - assuming logs have timestamp at the beginning
        const timestampMatch = logEntry.match(/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/);
        const timestamp = timestampMatch ? timestampMatch[0] : "Unknown date";

        // Determine the activity type
        let type = "other";
        if (logEntry.includes("login") || logEntry.includes("Login")) {
          type = "login";
        } else if (logEntry.includes("profile") || logEntry.includes("Profile")) {
          type = "profile_update";
        }

        // Generate a truly unique ID using timestamp and random number
        const uniqueId = `${page}-${index}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        return {
          id: uniqueId,
          date: new Date(timestamp),
          type: type,
          details: logEntry.replace(/\[\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\]\s*INFO.*?:\s*/g, ""), // Clean up log prefix
        };
      });

      // Return both the processed logs and pagination info
      return {
        logs: processedLogs,
        pagination: {
          page: response.data.page,
          size: response.data.size,
          hasNext: response.data.hasNext,
          totalElements: response.data.totalElements,
        },
      };
    } else if (Array.isArray(response.data)) {
      // Handle case where response is just an array of logs (legacy format)
      console.warn("Legacy log response format detected");
      const processedLogs = response.data.map((logEntry, index) => {
        // Generate a truly unique ID
        const uniqueId = `legacy-${page}-${index}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        return {
          id: uniqueId,
          date: new Date(),
          type: "other",
          details: logEntry,
        };
      });

      return {
        logs: processedLogs,
        pagination: {
          page: page,
          size: size,
          hasNext: false,
          totalElements: processedLogs.length,
        },
      };
    } else {
      // Handle unexpected response format
      console.warn("Unexpected logs response format:", response.data);

      return {
        logs: [],
        pagination: {
          page: page,
          size: size,
          hasNext: false,
          totalElements: 0,
        },
      };
    }
  } catch (error) {
    console.error("Error fetching user activity logs:", error);
    // Return empty result rather than throwing
    return {
      logs: [],
      pagination: {
        page: page,
        size: size,
        hasNext: false,
        totalElements: 0,
      },
    };
  }
};

export const getCurrentUserLogs = async (page = 0, size = 20) => {
  try {
    const response = await api.get(`${API_BASE_URL}/admin/logs/current-user`, {
      params: { page, size },
    });

    // Process the response following the same pattern as getUserActivityLogs
    if (response.data && Array.isArray(response.data.logs)) {
      // Process logs from the proper structure
      const processedLogs = response.data.logs.map((logEntry, index) => {
        const timestampMatch = logEntry.match(/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/);
        const timestamp = timestampMatch ? timestampMatch[0] : "Unknown date";

        let type = "other";
        if (logEntry.includes("login") || logEntry.includes("Login")) {
          type = "login";
        } else if (logEntry.includes("profile") || logEntry.includes("Profile")) {
          type = "profile_update";
        }

        const uniqueId = `current-${page}-${index}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        return {
          id: uniqueId,
          date: new Date(timestamp),
          type: type,
          details: logEntry.replace(/\[\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\]\s*INFO.*?:\s*/g, ""),
        };
      });

      return {
        logs: processedLogs,
        pagination: {
          page: response.data.page,
          size: response.data.size,
          hasNext: response.data.hasNext,
          totalElements: response.data.totalElements,
        },
      };
    } else if (Array.isArray(response.data)) {
      // Handle legacy format
      const processedLogs = response.data.map((logEntry, index) => {
        const uniqueId = `legacy-current-${index}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        return {
          id: uniqueId,
          date: new Date(),
          type: "other",
          details: logEntry,
        };
      });

      return {
        logs: processedLogs,
        pagination: {
          page: page,
          size: size,
          hasNext: false,
          totalElements: processedLogs.length,
        },
      };
    } else {
      // Handle unexpected response format
      console.warn("Unexpected logs response format:", response.data);

      return {
        logs: [],
        pagination: {
          page: page,
          size: size,
          hasNext: false,
          totalElements: 0,
        },
      };
    }
  } catch (error) {
    console.error("Error fetching current user logs:", error);
    // Return empty result rather than throwing
    return {
      logs: [],
      pagination: {
        page: page,
        size: size,
        hasNext: false,
        totalElements: 0,
      },
    };
  }
};

/**
 * Get user profile by ID
 * @param {number} userId - The ID of the user to fetch
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfileById = async (userId) => {
  try {
    const response = await api.get(`${API_BASE_URL}/user/profile/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user profile for ID ${userId}:`, error);
    throw error;
  }
};

/**
 * Follow a user
 * @param {number} userId - The ID of the user to follow
 * @returns {Promise<Object>} Updated user relationship status
 */
export const followUser = async (userId) => {
  try {
    const response = await api.post(`${API_BASE_URL}/user/follow/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error following user ${userId}:`, error);
    throw error;
  }
};

/**
 * Unfollow a user
 * @param {number} userId - The ID of the user to unfollow
 * @returns {Promise<Object>} Updated user relationship status
 */
export const unfollowUser = async (userId) => {
  try {
    const response = await api.post(`${API_BASE_URL}/user/unfollow/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error unfollowing user ${userId}:`, error);
    throw error;
  }
};

/**
 * Update user profile information
 * @param {number} userId - The ID of the user to update
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} Updated user data
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`${API_BASE_URL}/admin/users/update/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error;
  }
};

/**
 * Delete a user
 * @param {number} userId - The ID of the user to delete
 * @returns {Promise<Object>} Confirmation of deletion
 */
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`${API_BASE_URL}/admin/users/delete/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    throw error;
  }
};

/**
 * Suspend a user
 * @param {number} userId - The ID of the user to suspend
 * @returns {Promise<Object>} Updated user data
 */
export const suspendUser = async (userId) => {
  try {
    const response = await api.patch(`${API_BASE_URL}/admin/users/suspend/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error suspending user ${userId}:`, error);
    throw error;
  }
};

/**
 * Unsuspend a user
 * @param {number} userId - The ID of the user to unsuspend
 * @returns {Promise<Object>} Updated user data
 */
export const unsuspendUser = async (userId) => {
  try {
    const response = await api.patch(`${API_BASE_URL}/admin/users/unsuspend/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error unsuspending user ${userId}:`, error);
    throw error;
  }
};

/**
 * Ban a user
 * @param {number} userId - The ID of the user to ban
 * @returns {Promise<Object>} Updated user data
 */
export const banUser = async (userId) => {
  try {
    const response = await api.patch(`${API_BASE_URL}/admin/users/ban/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error banning user ${userId}:`, error);
    throw error;
  }
};

/**
 * Unban a user
 * @param {number} userId - The ID of the user to unban
 * @returns {Promise<Object>} Updated user data
 */
export const unbanUser = async (userId) => {
  try {
    const response = await api.patch(`${API_BASE_URL}/admin/users/unban/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error unbanning user ${userId}:`, error);
    throw error;
  }
};

/**
 * Update a user's role
 * @param {number} userId - The ID of the user
 * @param {string} roleName - The new role to assign
 * @returns {Promise<Object>} Updated user data
 */
export const updateUserRole = async (userId, roleName) => {
  try {
    const response = await api.put(`${API_BASE_URL}/admin/users/${userId}/role?roleName=${roleName}`);
    return response.data;
  } catch (error) {
    console.error(`Error updating role for user ${userId}:`, error);
    throw error;
  }
};
