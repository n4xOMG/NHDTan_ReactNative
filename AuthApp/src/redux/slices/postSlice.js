import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as PostServices from "../../services/PostServices";

export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async ({ page = 0, size = 10, sort = "timestamp,desc" }, { rejectWithValue }) => {
    try {
      const response = await PostServices.getPosts({ page, size, sort });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPostById = createAsyncThunk("posts/fetchPostById", async (postId, { rejectWithValue }) => {
  try {
    const response = await PostServices.getPostById(postId);
    return response;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchUserPosts = createAsyncThunk("posts/fetchUserPosts", async (userId, { rejectWithValue }) => {
  try {
    const response = await PostServices.getPostsByUser(userId);
    return { userId, posts: response };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const createNewPost = createAsyncThunk("posts/createPost", async (postData, { rejectWithValue }) => {
  try {
    const response = await PostServices.createPost(postData);
    return response;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateExistingPost = createAsyncThunk("posts/updatePost", async ({ postId, postData }, { rejectWithValue }) => {
  try {
    const response = await PostServices.updatePost(postId, postData);
    return response;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const removePost = createAsyncThunk("posts/deletePost", async (postId, { rejectWithValue }) => {
  try {
    await PostServices.deletePost(postId);
    return postId;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const toggleLikePost = createAsyncThunk("posts/likePost", async (postId, { rejectWithValue, getState }) => {
  try {
    const response = await PostServices.likePost(postId);
    return response;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const initialState = {
  posts: [],
  userPosts: {},
  currentPost: null,
  loading: false,
  error: null,
  page: 0,
  hasMore: true,
  refreshing: false,
};

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearPosts: (state) => {
      state.posts = [];
      state.page = 0;
      state.hasMore = true;
    },
    setRefreshing: (state, action) => {
      state.refreshing = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch posts cases
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        const { content, last, number } = action.payload;
        if (number === 0) {
          state.posts = content;
        } else {
          state.posts = [...state.posts, ...content];
        }
        state.page = number + 1;
        state.hasMore = !last;
        state.loading = false;
        state.refreshing = false;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload;
      })

      // Fetch post by ID cases
      .addCase(fetchPostById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.currentPost = action.payload;
        state.loading = false;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch user posts cases
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        const { userId, posts } = action.payload;
        state.userPosts[userId] = posts;
      })

      // Create post cases
      .addCase(createNewPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewPost.fulfilled, (state, action) => {
        state.posts = [action.payload, ...state.posts];
        state.loading = false;
      })
      .addCase(createNewPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update post cases
      .addCase(updateExistingPost.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        state.posts = state.posts.map((post) => (post.id === updatedPost.id ? updatedPost : post));
        if (state.currentPost && state.currentPost.id === updatedPost.id) {
          state.currentPost = updatedPost;
        }
      })

      // Delete post cases
      .addCase(removePost.fulfilled, (state, action) => {
        const postId = action.payload;
        state.posts = state.posts.filter((post) => post.id !== postId);
        if (state.currentPost && state.currentPost.id === postId) {
          state.currentPost = null;
        }
      })

      // Like post cases
      .addCase(toggleLikePost.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        // Update the post in the posts array
        state.posts = state.posts.map((post) => (post.id === updatedPost.id ? updatedPost : post));

        // Update the post in userPosts collections if it exists there
        for (const userId in state.userPosts) {
          if (state.userPosts[userId]) {
            state.userPosts[userId] = state.userPosts[userId].map((post) => (post.id === updatedPost.id ? updatedPost : post));
          }
        }

        // Update current post if it matches the updated post
        if (state.currentPost && state.currentPost.id === updatedPost.id) {
          state.currentPost = updatedPost;
        }
      });
  },
});

export const { clearPosts, setRefreshing } = postSlice.actions;
export default postSlice.reducer;
