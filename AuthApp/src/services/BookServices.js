import axios from "axios";
import { API_BASE_URL } from "../api/api";

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
