import { api, API_BASE_URL } from "../api/api";

export const getUserReadingHistory = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/reading-progress`);
    return response.data;
  } catch (error) {
    console.error("Error fetching reading history:", error);
    throw error;
  }
};
