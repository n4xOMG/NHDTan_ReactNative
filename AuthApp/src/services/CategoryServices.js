import { api, API_BASE_URL } from "../api/api";

/**
 * Fetch the top categories with their books
 * @returns {Promise<Array>} - List of top categories with books
 */
export const getTopCategories = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/top-categories`);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching top categories:", error);
    throw error;
  }
};

/**
 * Get all available categories
 * @returns {Promise<Array>} - List of all categories
 */
export const getAllCategories = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/categories`);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching all categories:", error);
    throw error;
  }
};

/**
 * Get books by category ID
 * @param {number} categoryId - Category ID
 * @returns {Promise<Array>} - List of books in the category
 */
export const getBooksByCategory = async (categoryId) => {
  try {
    const response = await api.get(`${API_BASE_URL}/categories/${categoryId}/books`);
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching books for category ${categoryId}:`, error);
    throw error;
  }
};
