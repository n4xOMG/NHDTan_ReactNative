import axios from "axios";
import { api, API_BASE_URL } from "../api/api";

export const getChaptersByBookId = async ({ token, bookId }) => {
  try {
    const apiClient = token ? api : axios;
    const response = await apiClient.get(`${API_BASE_URL}/books/${bookId}/chapters`);
    console.log("Response from getChaptersByBookId:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error during fetching chapters:", error);
    throw error;
  }
};

export const getChapterById = async ({ token, chapterId }) => {
  try {
    if (!chapterId) {
      throw new Error("Chapter ID is required");
    }

    console.log("Fetching chapter with ID:", chapterId);
    const apiClient = token ? api : axios;
    const response = await apiClient.get(`${API_BASE_URL}/chapters/${chapterId}`);
    return response.data;
  } catch (error) {
    console.error(`Error during fetching chapter (ID: ${chapterId}):`, error);
    throw error;
  }
};

export const getReadingProgress = async ({ chapterId }) => {
  try {
    if (!chapterId) {
      throw new Error("Chapter ID is required");
    }

    console.log("Fetching reading progress for chapter ID:", chapterId);
    // Make sure the API endpoint matches exactly what the backend expects
    const response = await api.get(`${API_BASE_URL}/api/reading-progress/chapters/${chapterId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching reading progress (ID: ${chapterId}):`, error);
    // Return a default object instead of throwing to prevent crashes
    return { progress: 0 };
  }
};

export const saveReadingProgress = async ({ chapterId, progress }) => {
  try {
    if (!chapterId) {
      throw new Error("Chapter ID is required");
    }

    console.log("Saving reading progress:", { chapterId, progress });
    const response = await api.post(`${API_BASE_URL}/api/chapters/${chapterId}/progress`, {
      progress,
    });
    console.log("Response from saveReadingProgress:", response.data);
    return { chapterId, progress }; // Ensure we return both the ID and progress value
  } catch (error) {
    console.error(`Error saving reading progress (ID: ${chapterId}):`, error);
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

export const toggleLikeChapter = async (chapterId) => {
  try {
    const response = await api.put(`${API_BASE_URL}/api/chapters/${chapterId}/like`);
    return response.data;
  } catch (error) {
    console.error("Error liking chapter:", error);
    throw error;
  }
};

// Get author's chapters by book ID
export const getAuthorChaptersByBookId = async ({ bookId }) => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/books/${bookId}/chapters`);
    return response.data;
  } catch (error) {
    console.error("Error during fetching author's chapters:", error);
    throw error;
  }
};

// Create a draft chapter
export const createDraftChapter = async ({ bookId, chapter }) => {
  try {
    const response = await api.post(`${API_BASE_URL}/api/books/${bookId}/chapters/draft`, chapter);
    return response.data;
  } catch (error) {
    console.error("Error creating draft chapter:", error);
    throw error;
  }
};

// Publish a chapter
export const publishChapter = async ({ bookId, chapter }) => {
  try {
    const response = await api.post(`${API_BASE_URL}/api/books/${bookId}/chapters`, chapter);
    return response.data;
  } catch (error) {
    console.error("Error publishing chapter:", error);
    throw error;
  }
};

// Update a chapter
export const updateChapter = async ({ chapterId, chapter }) => {
  try {
    const response = await api.put(`${API_BASE_URL}/api/chapters/${chapterId}`, chapter);
    return response.data;
  } catch (error) {
    console.error("Error updating chapter:", error);
    throw error;
  }
};

// Delete a chapter
export const deleteChapter = async ({ bookId, chapterId }) => {
  try {
    const response = await api.delete(`${API_BASE_URL}/api/books/${bookId}/chapters/${chapterId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting chapter:", error);
    throw error;
  }
};
