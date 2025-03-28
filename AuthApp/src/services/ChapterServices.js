import axios from "axios";
import { api, API_BASE_URL } from "../api/api";

export const getChaptersByBookId = async ({ token, bookId }) => {
  try {
    const apiClient = token ? api : axios;
    const response = await apiClient.get(`${API_BASE_URL}/books/${bookId}/chapters`);
    return response.data;
  } catch (error) {
    console.error("Error during fetching chapters:", error);
    throw error;
  }
};

export const getChapterById = async ({ token, chapterId }) => {
  try {
    const apiClient = token ? api : axios;
    const response = await apiClient.get(`${API_BASE_URL}/chapters/${chapterId}`);
    return response.data;
  } catch (error) {
    console.error("Error during fetching chapter:", error);
    throw error;
  }
};

export const saveReadingProgress = async ({ chapterId, progress }) => {
  try {
    const response = await api.post(`${API_BASE_URL}/api/chapters/${chapterId}/progress`, {
      progress,
    });
    return response.data;
  } catch (error) {
    console.error("Error saving reading progress:", error);
    throw error;
  }
};

export const unlockChapter = async ({ chapterId }) => {
  try {
    const response = await api.post(`${API_BASE_URL}/api/unlock/${chapterId}`);
    return response.data;
  } catch (error) {
    console.error("Error unlocking chapter:", error);
    throw error;
  }
};
export const likeChapter = async (chapterId) => {
  try {
    const response = await api.post(`${API_BASE_URL}/api/chapters/${chapterId}/like`);
    return response.data;
  } catch (error) {
    console.error("Error liking chapter:", error);
    throw error;
  }
};
