import axios from "axios";
import { api, API_BASE_URL } from "../api/api";

export const getBooks = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/books`);
    return response.data;
  } catch (error) {
    console.error("Error during fetching books:", error);
    throw error;
  }
};

export const getTop10LikedBooks = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/books/top-likes`);
    return response.data;
  } catch (error) {
    console.error("Error during fetching books:", error);
    throw error;
  }
};

export const searchBooks = async ({ title }) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/books/search`, { title });
    return response.data;
  } catch (error) {
    console.error("Error during fetching books:", error);
    throw error;
  }
};

export const getUserReadingProgressByBookId = async ({ bookId }) => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/reading-progress/books/${bookId}`);
    return response.data;
  } catch (error) {
    console.error("Error during fetching reading progress:", error);
    throw error;
  }
};

export const getUserFavStatus = async ({ bookId }) => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/books/${bookId}/isLiked`);
    return response.data;
  } catch (error) {
    console.error("Error during fetching user fav status:", error);
    throw error;
  }
};

export const toggleUserFavStatus = async ({ bookId }) => {
  try {
    const response = await api.put(`${API_BASE_URL}/api/books/follow/${bookId}`);
    return response.data;
  } catch (error) {
    console.error("Error during toggling user fav status:", error);
    throw error;
  }
};
