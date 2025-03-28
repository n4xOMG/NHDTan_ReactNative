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
