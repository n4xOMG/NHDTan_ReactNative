import { api, API_BASE_URL } from "../api/api";

/**
 * Retrieve all available tags
 * @returns {Promise<Array>} - List of tag objects
 */
export const getAllTags = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/books/tags`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tags:", error);
    throw error;
  }
};

/**
 * Retrieve tags for a specific book
 * @param {number} bookId - The book ID
 * @returns {Promise<Array>} - List of tag objects for the book
 */
export const getTagsByBook = async (bookId) => {
  try {
    const response = await api.get(`${API_BASE_URL}/books/${bookId}/tags`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tags for book ${bookId}:`, error);
    throw error;
  }
};

/**
 * Retrieve all available categories
 * @returns {Promise<Array>} - List of category objects
 */
export const getAllCategories = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/categories`);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

/**
 * Retrieve category information by ID
 * @param {number} categoryId - The category ID
 * @returns {Promise<Object>} - Category details
 */
export const getCategoryById = async (categoryId) => {
  try {
    const response = await api.get(`${API_BASE_URL}/books/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching category ${categoryId}:`, error);
    throw error;
  }
};
