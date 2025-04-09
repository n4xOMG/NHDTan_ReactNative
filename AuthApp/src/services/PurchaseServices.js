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

export const getPurchaseHistory = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/purchases/history`);
    return response.data;
  } catch (error) {
    console.error("Error fetching purchase history:", error);
    throw error;
  }
};

/**
 * Get purchase history for a specific user
 *
 * @param {number} userId - The user ID to fetch purchase history for
 * @returns {Promise<Array>} - A promise that resolves to an array of purchase objects
 */
export const getPurchaseHistoryByUser = async (userId) => {
  try {
    const response = await api.get(`${API_BASE_URL}/admin/purchases/history/users/${userId}`);

    // Transform the data to match the expected format in the UserDetailsModal component
    return response.data.map((purchase) => ({
      id: purchase.id,
      date: new Date(purchase.purchaseDate).toISOString().split("T")[0], // Format date as YYYY-MM-DD
      product: purchase.creditPackage?.name || "Credit Package",
      price: purchase.creditPackage?.price,
      creditAmount: purchase.creditPackage?.creditAmount,
      paymentIntentId: purchase.paymentIntentId,
    }));
  } catch (error) {
    console.error("Error fetching purchase history:", error);
    throw error;
  }
};
