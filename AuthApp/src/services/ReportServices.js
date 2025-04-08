import { api, API_BASE_URL } from "../api/api";

export const getReportCount = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/reports/count`);
    return response.data;
  } catch (error) {
    console.error("Error fetching report count:", error);
    throw error;
  }
};
