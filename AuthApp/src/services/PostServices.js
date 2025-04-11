import { api, API_BASE_URL } from "../api/api";

/**
 * Get paginated posts with optional parameters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (0-based)
 * @param {number} params.size - Page size
 * @param {string} params.sort - Sort parameter (default: "timestamp,desc")
 * @returns {Promise<Object>} - Paginated posts response
 */
export const getPosts = async ({ page = 0, size = 10, sort = "timestamp,desc" }) => {
  try {
    // Fetch posts from API with pagination and sorting parameters
    const response = await api.get(`${API_BASE_URL}/posts`, {
      params: { page, size, sort },
    });

    // Return the paginated response directly from the server
    // The backend already returns a proper Page object
    return response.data;
  } catch (error) {
    console.error("Error fetching posts:", error);
    // Return empty results on error rather than throwing
    return {
      content: [],
      last: true,
      totalElements: 0,
      size: size,
      number: page,
      empty: true,
    };
  }
};

/**
 * Get a specific post by ID
 * @param {number} postId - Post ID
 * @returns {Promise<Object>} - Post details
 */
export const getPostById = async (postId) => {
  try {
    const response = await api.get(`${API_BASE_URL}/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching post ${postId}:`, error);
    throw error;
  }
};

/**
 * Get posts by user ID
 * @param {number} userId - User ID
 * @returns {Promise<Array>} - List of user's posts
 */
export const getPostsByUser = async (userId) => {
  try {
    const response = await api.get(`${API_BASE_URL}/posts/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching posts for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Create a new post
 * @param {Object} postData - Post data
 * @param {string} postData.content - Post content
 * @param {Array<string>} [postData.images] - Optional image URLs
 * @param {number} [postData.sharedPostId] - Optional ID of post being shared
 * @returns {Promise<Object>} - Created post
 */
export const createPost = async (postData) => {
  try {
    const response = await api.post(`${API_BASE_URL}/api/posts`, postData);
    return response.data;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

/**
 * Update an existing post
 * @param {number} postId - Post ID
 * @param {Object} postData - Updated post data
 * @returns {Promise<Object>} - Updated post
 */
export const updatePost = async (postId, postData) => {
  try {
    const response = await api.put(`${API_BASE_URL}/api/posts/${postId}`, postData);
    return response.data;
  } catch (error) {
    console.error(`Error updating post ${postId}:`, error);
    throw error;
  }
};

/**
 * Delete a post
 * @param {number} postId - Post ID
 * @returns {Promise<void>}
 */
export const deletePost = async (postId) => {
  try {
    await api.delete(`${API_BASE_URL}/api/posts/${postId}`);
  } catch (error) {
    console.error(`Error deleting post ${postId}:`, error);
    throw error;
  }
};

/**
 * Like or unlike a post
 * @param {number} postId - Post ID
 * @returns {Promise<Object>} - Updated post with like status
 */
export const likePost = async (postId) => {
  try {
    const response = await api.post(`${API_BASE_URL}/api/posts/${postId}/like`);
    return response.data;
  } catch (error) {
    console.error(`Error liking post ${postId}:`, error);
    throw error;
  }
};
