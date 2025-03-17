import axios from "axios";
import { API_BASE_URL } from "../api/api";

export const getChaptersByBookId = async ({ bookId }) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/books/${bookId}/chapters`);
    return response.data;
  } catch (error) {
    console.error("Error during fetching chapters:", error);
    throw error;
  }
};
