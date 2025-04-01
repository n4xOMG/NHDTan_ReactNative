import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getBookComments,
  getChapterComments,
  getPostComments,
  createBookComment,
  createChapterComment,
  createPostComment,
  likeComment,
  createBookReplyComment,
  editComment,
  deleteComment,
  createChapterReplyComment,
  createPostReplyComment,
} from "../../services/CommentService";

// Create a helper for the comment state shape
const createCommentState = () => ({
  comments: [],
  page: 0,
  totalPages: 1,
  loading: false,
  error: null,
});

// Thunk to fetch comments based on type
export const fetchComments = createAsyncThunk("comments/fetchComments", async ({ type, id, page = 0, size = 10 }, { rejectWithValue }) => {
  try {
    const response =
      type === "book"
        ? await getBookComments({ bookId: id, page, size })
        : type === "chapter"
        ? await getChapterComments({ chapterId: id, page, size })
        : await getPostComments({ postId: id, page, size });
    return { type, data: response };
  } catch (error) {
    return rejectWithValue({ type, error: error.message });
  }
});

// Add Comment thunk
export const addComment = createAsyncThunk("comments/addComment", async ({ type, id, data }, { rejectWithValue }) => {
  try {
    const response =
      type === "book"
        ? await createBookComment({ bookId: id, data })
        : type === "chapter"
        ? await createChapterComment({ chapterId: id, data })
        : await createPostComment({ postId: id, data });
    return { type, comment: response };
  } catch (error) {
    return rejectWithValue({ type, error: error.message });
  }
});

// Add Reply thunk
export const addReply = createAsyncThunk("comments/addReply", async ({ type, id, parentCommentId, data }, { rejectWithValue }) => {
  try {
    const response =
      type === "book"
        ? await createBookReplyComment({ bookId: id, parentCommentId, data })
        : type === "chapter"
        ? await createChapterReplyComment({ bookId: id, chapterId: id, parentCommentId, data })
        : await createPostReplyComment({ postId: id, parentCommentId, data });
    return { type, parentCommentId, reply: response };
  } catch (error) {
    return rejectWithValue({ type, error: error.message });
  }
});

// Toggle Like thunk
export const toggleLike = createAsyncThunk("comments/toggleLike", async ({ commentId, type }, { rejectWithValue }) => {
  try {
    const response = await likeComment(commentId);
    return { type, comment: response };
  } catch (error) {
    return rejectWithValue({ type, error: error.message });
  }
});

// Edit Comment thunk
export const editCommentThunk = createAsyncThunk("comments/editComment", async ({ commentId, data, type }, { rejectWithValue }) => {
  try {
    const response = await editComment(commentId, data);
    return { type, comment: response };
  } catch (error) {
    return rejectWithValue({ type, error: error.message });
  }
});

// Delete Comment thunk
export const deleteCommentThunk = createAsyncThunk("comments/deleteComment", async ({ commentId, type }, { rejectWithValue }) => {
  try {
    await deleteComment(commentId);
    return { type, commentId };
  } catch (error) {
    return rejectWithValue({ type, error: error.message });
  }
});

// Updated initial state with separate branches
const initialState = {
  book: createCommentState(),
  chapter: createCommentState(),
  post: createCommentState(),
};

// Helper to update comments recursively
const updateCommentsRecursively = (comments, updatedComment) => {
  return comments.map((c) =>
    c.id === updatedComment.id
      ? updatedComment
      : {
          ...c,
          replyComment: c.replyComment ? updateCommentsRecursively(c.replyComment, updatedComment) : c.replyComment,
        }
  );
};

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    resetComments: (state, action) => {
      // Reset a specific branch or all if no type provided
      const type = action.payload?.type;
      if (type) {
        state[type] = createCommentState();
      } else {
        return initialState;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Comments
      .addCase(fetchComments.pending, (state, action) => {
        const type = action.meta.arg.type;
        state[type].loading = true;
        state[type].error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        const { type, data } = action.payload;
        state[type].loading = false;

        if (action.meta.arg.page === 0) {
          state[type].comments = data.comments;
        } else {
          state[type].comments = [...state[type].comments, ...data.comments];
        }

        state[type].page = action.meta.arg.page + 1;
        state[type].totalPages = data.totalPages;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        const { type, error } = action.payload;
        state[type].loading = false;
        state[type].error = error;
      })

      // Add Comment
      .addCase(addComment.pending, (state, action) => {
        const type = action.meta.arg.type;
        state[type].loading = true;
        state[type].error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { type, comment } = action.payload;
        state[type].loading = false;
        state[type].comments.unshift(comment);
      })
      .addCase(addComment.rejected, (state, action) => {
        const { type, error } = action.payload;
        state[type].loading = false;
        state[type].error = error;
      })

      // Add Reply
      .addCase(addReply.pending, (state, action) => {
        const type = action.meta.arg.type;
        state[type].loading = true;
        state[type].error = null;
      })
      .addCase(addReply.fulfilled, (state, action) => {
        const { type, parentCommentId, reply } = action.payload;
        state[type].loading = false;
        state[type].comments = state[type].comments.map((comment) =>
          comment.id === parentCommentId ? { ...comment, replyComment: [...(comment.replyComment || []), reply] } : comment
        );
      })
      .addCase(addReply.rejected, (state, action) => {
        const { type, error } = action.payload;
        state[type].loading = false;
        state[type].error = error;
      })

      // Toggle Like
      .addCase(toggleLike.pending, (state, action) => {
        const type = action.meta.arg.type;
        state[type].loading = true;
        state[type].error = null;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { type, comment } = action.payload;
        state[type].loading = false;
        state[type].comments = updateCommentsRecursively(state[type].comments, comment);
      })
      .addCase(toggleLike.rejected, (state, action) => {
        const { type, error } = action.payload;
        state[type].loading = false;
        state[type].error = error;
      })

      // Edit Comment
      .addCase(editCommentThunk.pending, (state, action) => {
        const type = action.meta.arg.type;
        state[type].loading = true;
        state[type].error = null;
      })
      .addCase(editCommentThunk.fulfilled, (state, action) => {
        const { type, comment } = action.payload;
        state[type].loading = false;
        state[type].comments = updateCommentsRecursively(state[type].comments, comment);
      })
      .addCase(editCommentThunk.rejected, (state, action) => {
        const { type, error } = action.payload;
        state[type].loading = false;
        state[type].error = error;
      })

      // Delete Comment
      .addCase(deleteCommentThunk.pending, (state, action) => {
        const type = action.meta.arg.type;
        state[type].loading = true;
        state[type].error = null;
      })
      .addCase(deleteCommentThunk.fulfilled, (state, action) => {
        const { type, commentId } = action.payload;
        state[type].loading = false;

        // Filter out the deleted comment from the top level
        state[type].comments = state[type].comments.filter((c) => c.id !== commentId);

        // Remove from reply comments as well
        state[type].comments = state[type].comments.map((c) => ({
          ...c,
          replyComment: (c.replyComment || []).filter((r) => r.id !== commentId),
        }));
      })
      .addCase(deleteCommentThunk.rejected, (state, action) => {
        const { type, error } = action.payload;
        state[type].loading = false;
        state[type].error = error;
      });
  },
});

export const { resetComments } = commentSlice.actions;
export default commentSlice.reducer;
