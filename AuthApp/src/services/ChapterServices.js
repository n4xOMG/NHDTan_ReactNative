import axios from "axios";
import { api, API_BASE_URL } from "../api/api";

// Add this utility function to help the web-based editor access the token
export const tokenHelper = {
  // This function can be used by the web application code to extract token from localStorage
  getJwtFromStorage: () => {
    return localStorage.getItem("jwtToken");
  },

  // Method to create axios instance with auth headers from localStorage
  getAuthenticatedClient: () => {
    const token = localStorage.getItem("jwtToken");
    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  },
};

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
    if (!chapterId) {
      throw new Error("Chapter ID is required");
    }
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
    const response = await api.get(`${API_BASE_URL}/api/reading-progress/chapters/${chapterId}`);
    return response.data;
  } catch (error) {
    if (error.response.status === 404) {
      console.log(`Reading progress not found for chapter ID: ${chapterId}`);
      return { progress: 0 }; // Return a default value if not found
    }
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

    const response = await api.post(`${API_BASE_URL}/api/chapters/${chapterId}/progress`, {
      progress,
    });
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

// Get or create room ID for collaborative editing
export const getChapterRoomId = async ({ chapterId, bookId }) => {
  try {
    console.log("Getting or creating room ID for chapter:", { chapterId, bookId });
    // If editing an existing chapter
    if (chapterId) {
      const response = await api.get(`${API_BASE_URL}/api/chapters/${chapterId}/room`);
      return response.data;
    }
    // If creating a new chapter, generate a room ID linked to the book
    else if (bookId) {
      const response = await api.post(`${API_BASE_URL}/api/books/${bookId}/chapters/room`);
      return response.data;
    } else {
      throw new Error("Either chapterId or bookId is required");
    }
  } catch (error) {
    console.error("Error getting/creating room ID:", error);
    throw error;
  }
};

// Save chapter content from collaborative editor
export const saveChapterContent = async ({ roomId, content }) => {
  try {
    if (!roomId) {
      throw new Error("Room ID is required");
    }
    const response = await api.put(`${API_BASE_URL}/api/chapters/room/${roomId}/content`, { content });
    return response.data;
  } catch (error) {
    console.error("Error saving chapter content:", error);
    throw error;
  }
};
