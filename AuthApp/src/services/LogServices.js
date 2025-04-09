import { api, API_BASE_URL } from "../api/api";

export const getAllLogs = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/admin/logs`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all logs:", error);
    // Return mock data for development/testing
    return [
      "2023-11-15 14:30:45 - User john.doe registered successfully",
      "2023-11-15 15:20:30 - New book added: 'The Great Gatsby'",
      "2023-11-15 16:45:12 - New purchase: Credit package $10",
      "2023-11-15 17:12:05 - User jane.smith logged in",
      "2023-11-15 18:05:22 - Report submitted for book ID #123",
      "2023-11-16 09:34:18 - Admin user updated system settings",
      "2023-11-16 10:15:40 - New credit package created: Premium Pack",
      "2023-11-16 11:22:33 - User account deleted: guest_user",
      "2023-11-16 13:05:10 - Book status changed to 'inactive' for ID #456",
      "2023-11-16 14:30:45 - System backup completed successfully",
    ];
  }
};

export const getRecentLogs = async (count = 3) => {
  try {
    const logs = await getAllLogs();

    // Check if logs is an array before using slice
    if (!Array.isArray(logs)) {
      console.warn("Logs returned is not an array:", logs);
      return [];
    }

    return logs.slice(-Math.abs(count)).reverse();
  } catch (error) {
    console.error("Error fetching recent logs:", error);
    return [];
  }
};

/**
 * Get paginated logs
 * @param {number} page - Page number (0-based)
 * @param {number} size - Number of items per page
 * @returns {Promise<Object>} - Paginated log data
 */
export const getPaginatedLogs = async (page = 0, size = 20) => {
  try {
    // Try to get from paginated endpoint first
    try {
      const response = await api.get(`${API_BASE_URL}/admin/logs`, {
        params: { page, size },
      });

      // Check if we got a proper pagination structure
      if (response.data && (response.data.content || response.data.logs)) {
        const logs = response.data.content || response.data.logs || [];
        return {
          logs: logs,
          page: response.data.page || page,
          size: response.data.size || size,
          totalElements: response.data.totalElements || logs.length,
          totalPages: response.data.totalPages || Math.ceil(logs.length / size),
          hasNext: response.data.hasNext || false,
        };
      }
    } catch (paginationError) {
      console.warn("Pagination endpoint failed, falling back to getAllLogs:", paginationError);
    }

    // Fallback to manual pagination with getAllLogs
    const allLogs = await getAllLogs();

    // Check if logs is an array before using slice
    if (!Array.isArray(allLogs)) {
      console.warn("getAllLogs did not return an array:", allLogs);
      return {
        logs: [],
        page: page,
        size: size,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
      };
    }

    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedLogs = allLogs.slice(startIndex, endIndex);

    return {
      logs: paginatedLogs,
      page: page,
      size: size,
      totalElements: allLogs.length,
      totalPages: Math.ceil(allLogs.length / size),
      hasNext: endIndex < allLogs.length,
    };
  } catch (error) {
    console.error("Error in getPaginatedLogs:", error);
    return {
      logs: [],
      page: page,
      size: size,
      totalElements: 0,
      totalPages: 0,
      hasNext: false,
    };
  }
};
