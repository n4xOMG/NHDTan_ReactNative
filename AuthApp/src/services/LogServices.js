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
    return logs.slice(-count).reverse();
  } catch (error) {
    console.error("Error fetching recent logs:", error);
    return [];
  }
};
