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
