import { api, API_BASE_URL } from "../api/api";

export const getBookComments = async ({ bookId, page = 0, size = 10 }) => {
  try {
    const response = await api.get(`${API_BASE_URL}/books/${bookId}/comments`, {
      params: { page, size },
    });

    return response.data;
  } catch (error) {
    console.error("Error during fetching comments:", error);
    throw error;
  }
};

export const getChapterComments = async ({ chapterId, page = 1, size = 10 }) => {
  try {
    const response = await api.get(`${API_BASE_URL}/chapters/${chapterId}/comments`, {
      params: { page, size },
    });
    return response.data;
  } catch (error) {
    console.error("Error during fetching chapter comments:", error);
    throw error;
  }
};

export const getPostComments = async ({ postId }) => {
  try {
    const response = await api.get(`${API_BASE_URL}/posts/${postId}/comments`);
    return response.data;
  } catch (error) {
    console.error("Error during fetching post comments:", error);
    throw error;
  }
};

export const createBookComment = async (reqData) => {
  try {
    const response = await api.post(`${API_BASE_URL}/api/books/${reqData.bookId}/comments`, reqData.data);
    return response.data;
  } catch (error) {
    console.error("Error during create book comments:", error);
    throw error;
  }
};

export const createChapterComment = async (reqData) => {
  try {
    const response = await api.post(`${API_BASE_URL}/api/chapters/${reqData.chapterId}/comments`, reqData.data);

    return response.data;
  } catch (error) {
    console.error("Error during create chapter comment:", error);
    throw error;
  }
};

export const createPostComment = async (reqData) => {
  try {
    const response = await api.post(`${API_BASE_URL}/api/posts/${reqData.postId}/comments`, reqData.data);
    return response.data;
  } catch (error) {
    console.error("Error during create post comment:", error.response?.data || error.message);
    throw error;
  }
};

export const createBookReplyComment = async (reqData) => {
  try {
    const response = await api.post(`${API_BASE_URL}/api/books/${reqData.bookId}/comments/${reqData.parentCommentId}/reply`, reqData.data);
    return response.data;
  } catch (error) {
    console.error("Error during create book comments:", error);
    throw error;
  }
};

export const createChapterReplyComment = async (reqData) => {
  try {
    const response = await api.post(
      `${API_BASE_URL}/api/books/${reqData.bookId}/chapters/${reqData.chapterId}/comments/${reqData.parentCommentId}/reply`,
      reqData.data
    );
    return response.data;
  } catch (error) {
    console.error("Error during create chapter reply comment:", error.response?.data || error.message);
    throw error;
  }
};

export const createPostReplyComment = async (reqData) => {
  try {
    const response = await api.post(`${API_BASE_URL}/api/posts/${reqData.postId}/comments/${reqData.parentCommentId}/reply`, reqData.data);
    return response.data;
  } catch (error) {
    console.error("Error during create post reply comment:", error.response?.data || error.message);
    throw error;
  }
};

export const likeComment = async (commentId) => {
  try {
    if (!commentId) {
      throw new Error("❌ Comment ID is missing!");
    }
    const response = await api.put(`${API_BASE_URL}/api/comments/${commentId}/like`);

    return response.data;
  } catch (error) {
    console.error("❌ Error during like comment:", error.response?.data || error.message);
    throw error;
  }
};
export const editComment = async (commentId, data) => {
  try {
    if (!commentId) {
      throw new Error("❌ Comment ID is missing!");
    }
    const response = await api.put(`${API_BASE_URL}/api/comments/${commentId}`, data);
    return response.data;
  } catch (error) {
    console.error("❌ Error during edit comment:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteComment = async (commentId) => {
  try {
    if (!commentId) {
      throw new Error("❌ Comment ID is missing!");
    }
    const response = await api.delete(`${API_BASE_URL}/api/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error during delete comment:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches recent comments for a user
 * @param {number|string} userId - The ID of the user
 * @param {number} [page=0] - Page number (zero-based)
 * @param {number} [size=10] - Number of comments per page
 * @returns {Promise<Array>} - Array of comment objects
 */
export const getUserRecentComments = async (userId, page = 0, size = 10) => {
  try {
    console.log(`Fetching recent comments for userId: ${userId}, page: ${page}, size: ${size}`);

    const response = await api.get(`${API_BASE_URL}/admin/comments/recent/${userId}`, {
      params: { page, size },
    });

    console.log("User comments response:", response.data);

    // Handle different response formats
    if (response.data && response.data.content && Array.isArray(response.data.content)) {
      // Paginated response format
      return response.data.content;
    } else if (Array.isArray(response.data)) {
      // Direct array response
      return response.data;
    } else if (response.data) {
      // Unexpected format but not null - convert to array
      console.warn("Unexpected comment response format:", response.data);
      return [response.data];
    } else {
      // No data or null data
      console.warn("No comment data returned");
      return [];
    }
  } catch (error) {
    console.error("Error fetching user comments:", error);
    // Return empty array instead of throwing
    return [];
  }
};

/**
 * Creates a new comment
 * @param {Object} commentData - Comment data object
 * @returns {Promise<Object>} - Created comment object
 */
export const createComment = async (commentData) => {
  try {
    const response = await api.post(`${API_BASE_URL}/comments`, commentData);
    return response.data;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
};

/**
 * Updates an existing comment
 * @param {number|string} commentId - ID of the comment to update
 * @param {Object} commentData - New comment data
 * @returns {Promise<Object>} - Updated comment object
 */
export const updateComment = async (commentId, commentData) => {
  try {
    const response = await api.put(`${API_BASE_URL}/comments/${commentId}`, commentData);
    return response.data;
  } catch (error) {
    console.error("Error updating comment:", error);
    throw error;
  }
};
