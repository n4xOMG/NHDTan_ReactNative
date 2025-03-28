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
    return rejectWithValue(error.message);
  }
});

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
    return rejectWithValue(error.message);
  }
});

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
    return rejectWithValue(error.message);
  }
});

export const toggleLike = createAsyncThunk("comments/toggleLike", async ({ commentId, type }, { rejectWithValue }) => {
  try {
    const response = await likeComment(commentId);
    return { type, comment: response };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const editCommentThunk = createAsyncThunk("comments/editComment", async ({ commentId, data, type }, { rejectWithValue }) => {
  try {
    const response = await editComment(commentId, data);
    return { type, comment: response };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const deleteCommentThunk = createAsyncThunk("comments/deleteComment", async ({ commentId, type }, { rejectWithValue }) => {
  try {
    await deleteComment(commentId);
    return { type, commentId };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const initialState = {
  comments: [],
  page: 0,
  totalPages: 1,
  loading: false,
  error: null,
  type: null, // "book", "chapter", or "post"
};

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    resetComments: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch Comments
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        state.type = action.payload.type;
        if (action.meta.arg.page === 0) {
          state.comments = action.payload.data.comments;
        } else {
          state.comments = [...state.comments, ...action.payload.data.comments];
        }
        state.page = action.meta.arg.page + 1;
        state.totalPages = action.payload.data.totalPages;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Comment
      .addCase(addComment.fulfilled, (state, action) => {
        state.comments.unshift(action.payload.comment);
      })
      // Add Reply
      .addCase(addReply.fulfilled, (state, action) => {
        const { parentCommentId, reply } = action.payload;
        state.comments = state.comments.map((comment) =>
          comment.id === parentCommentId ? { ...comment, replyComment: [...(comment.replyComment || []), reply] } : comment
        );
      })
      // Toggle Like
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { comment } = action.payload;
        const updateComments = (comments) =>
          comments.map((c) =>
            c.id === comment.id ? comment : { ...c, replyComment: c.replyComment ? updateComments(c.replyComment) : c.replyComment }
          );
        state.comments = updateComments(state.comments);
      })
      // Edit Comment
      .addCase(editCommentThunk.fulfilled, (state, action) => {
        const { comment } = action.payload;
        state.comments = state.comments.map((c) =>
          c.id === comment.id ? comment : { ...c, replyComment: (c.replyComment || []).map((r) => (r.id === comment.id ? comment : r)) }
        );
      })
      // Delete Comment
      .addCase(deleteCommentThunk.fulfilled, (state, action) => {
        const { commentId } = action.payload;
        state.comments = state.comments
          .filter((c) => c.id !== commentId)
          .map((c) => ({ ...c, replyComment: (c.replyComment || []).filter((r) => r.id !== commentId) }));
      });
  },
});

export const { resetComments } = commentSlice.actions;
export default commentSlice.reducer;
