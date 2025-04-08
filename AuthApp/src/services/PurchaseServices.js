import { api, API_BASE_URL } from "../api/api";

export const getTotalSalesAmount = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/admin/purchases/total-sales`);
    return response.data;
  } catch (error) {
    console.error("Error fetching total sales amount:", error);
    throw error;
  }
};
