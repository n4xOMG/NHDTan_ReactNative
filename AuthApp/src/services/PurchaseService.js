import { api, API_BASE_URL } from "../api/api";

export const getPurchaseHistory = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/purchases/history`);
    return response.data;
  } catch (error) {
    console.error("Error fetching purchase history:", error);
    throw error;
  }
};
