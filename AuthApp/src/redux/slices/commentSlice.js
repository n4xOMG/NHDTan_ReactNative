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

// Thunks for fetching comments update separate branches:

export const fetchCommentsByBookId = createAsyncThunk(
  "comments/fetchCommentsByBookId",
  async ({ bookId, page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await getBookComments({ bookId, page, size });
      return response; // { comments: [...], totalPages }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchChapterComments = createAsyncThunk(
  "comments/fetchChapterComments",
  async ({ chapterId, page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await getChapterComments({ chapterId, page, size });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPostComments = createAsyncThunk(
  "comments/fetchPostComments",
  async ({ postId, page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await getPostComments({ postId, page, size });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunks for creating comments remain similar
export const addBookComment = createAsyncThunk("comments/addBookComment", async ({ bookId, data }, { rejectWithValue }) => {
  try {
    const response = await createBookComment({ bookId, data });
    return response;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const addChapterComment = createAsyncThunk("comments/addChapterComment", async ({ chapterId, data }, { rejectWithValue }) => {
  try {
    const response = await createChapterComment({ chapterId, data });
    return response;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const addPostComment = createAsyncThunk("comments/addPostComment", async ({ postId, data, token }, { rejectWithValue }) => {
  try {
    const response = await createPostComment({ postId, data, token });
    return response;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// (Other thunks like reply, like, edit and delete remain unchanged)

export const addBookReplyComment = createAsyncThunk(
  "comments/createBookReplyComment",
  async ({ bookId, parentCommentId, data }, { rejectWithValue }) => {
    try {
      const response = await createBookReplyComment({
        bookId,
        parentCommentId,
        data: data,
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk to like (or toggle like) a comment
export const toggleLikeComment = createAsyncThunk("comments/toggleLikeComment", async ({ commentId, commentType }, { rejectWithValue }) => {
  try {
    const response = await likeComment(commentId);
    // Return both the updated comment and the type (book, chapter, or post)
    return { comment: response, commentType };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const editCommentThunk = createAsyncThunk("comments/editComment", async ({ commentId, data }, { rejectWithValue }) => {
  try {
    const response = await editComment(commentId, data);
    return response; // expecting updated comment DTO
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const deleteCommentThunk = createAsyncThunk("comments/deleteComment", async ({ commentId }, { rejectWithValue }) => {
  try {
    const response = await deleteComment(commentId);
    return { commentId, response };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// Thunk for chapter reply comment
export const addChapterReplyComment = createAsyncThunk(
  "comments/addChapterReplyComment",
  async ({ bookId, chapterId, parentCommentId, data }, { rejectWithValue }) => {
    try {
      const response = await createChapterReplyComment({ bookId, chapterId, parentCommentId, data });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk for post reply comment
export const addPostReplyComment = createAsyncThunk(
  "comments/addPostReplyComment",
  async ({ postId, parentCommentId, data, token }, { rejectWithValue }) => {
    try {
      const response = await createPostReplyComment({ postId, parentCommentId, data, token });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  bookComments: {
    comments: [],
    page: 1,
    totalPages: 1,
    loading: false,
    error: null,
  },
  chapterComments: {
    comments: [],
    page: 1,
    totalPages: 1,
    loading: false,
    error: null,
  },
  postComments: {
    comments: [],
    page: 1,
    totalPages: 1,
    loading: false,
    error: null,
  },
};

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    resetComments: (state) => {
      state.bookComments = { comments: [], page: 1, totalPages: 1, loading: false, error: null };
      state.chapterComments = { comments: [], page: 1, totalPages: 1, loading: false, error: null };
      state.postComments = { comments: [], page: 1, totalPages: 1, loading: false, error: null };
    },
  },
  extraReducers: (builder) => {
    // Book Comments
    builder
      .addCase(fetchCommentsByBookId.pending, (state) => {
        state.bookComments.loading = true;
        state.bookComments.error = null;
      })
      .addCase(fetchCommentsByBookId.fulfilled, (state, action) => {
        state.bookComments.loading = false;
        const { comments, totalPages } = action.payload;
        if (action.meta.arg.page === 0) {
          state.bookComments.comments = comments;
        } else {
          state.bookComments.comments = [...state.bookComments.comments, ...comments];
        }
        state.bookComments.totalPages = totalPages;
        state.bookComments.page = action.meta.arg.page + 1;
      })
      .addCase(fetchCommentsByBookId.rejected, (state, action) => {
        state.bookComments.loading = false;
        state.bookComments.error = action.payload;
      })
      // Chapter Comments
      .addCase(fetchChapterComments.pending, (state) => {
        state.chapterComments.loading = true;
        state.chapterComments.error = null;
      })
      .addCase(fetchChapterComments.fulfilled, (state, action) => {
        state.chapterComments.loading = false;
        const { comments, totalPages } = action.payload;
        if (action.meta.arg.page === 0) {
          state.chapterComments.comments = comments;
        } else {
          state.chapterComments.comments = [...state.chapterComments.comments, ...comments];
        }
        state.chapterComments.totalPages = totalPages;
        state.chapterComments.page = action.meta.arg.page + 1;
      })
      .addCase(fetchChapterComments.rejected, (state, action) => {
        state.chapterComments.loading = false;
        state.chapterComments.error = action.payload;
      })
      // Post Comments
      .addCase(fetchPostComments.pending, (state) => {
        state.postComments.loading = true;
        state.postComments.error = null;
      })
      .addCase(fetchPostComments.fulfilled, (state, action) => {
        state.postComments.loading = false;
        const { comments, totalPages } = action.payload;
        if (action.meta.arg.page === 0) {
          state.postComments.comments = comments;
        } else {
          state.postComments.comments = [...state.postComments.comments, ...comments];
        }
        state.postComments.totalPages = totalPages;
        state.postComments.page = action.meta.arg.page + 1;
      })
      .addCase(fetchPostComments.rejected, (state, action) => {
        state.postComments.loading = false;
        state.postComments.error = action.payload;
      })
      // New Comment Adding - update appropriate branch
      .addCase(addBookComment.pending, (state) => {
        state.bookComments.loading = true;
        state.bookComments.error = null;
      })
      .addCase(addBookComment.fulfilled, (state, action) => {
        state.bookComments.loading = false;
        state.bookComments.comments.unshift(action.payload);
      })
      .addCase(addBookComment.rejected, (state, action) => {
        state.bookComments.loading = false;
        state.bookComments.error = action.payload;
      })
      .addCase(addChapterComment.pending, (state) => {
        state.chapterComments.loading = true;
        state.chapterComments.error = null;
      })
      .addCase(addChapterComment.fulfilled, (state, action) => {
        state.chapterComments.loading = false;
        state.chapterComments.comments?.unshift(action.payload);
      })
      .addCase(addChapterComment.rejected, (state, action) => {
        state.chapterComments.loading = false;
        state.chapterComments.error = action.payload;
      })
      .addCase(addPostComment.pending, (state) => {
        state.postComments.loading = true;
        state.postComments.error = null;
      })
      .addCase(addPostComment.fulfilled, (state, action) => {
        state.postComments.loading = false;
        state.postComments.comments?.unshift(action.payload);
      })
      .addCase(addPostComment.rejected, (state, action) => {
        state.postComments.loading = false;
        state.postComments.error = action.payload;
      });
    // Add reply to a book comment
    builder
      .addCase(addBookReplyComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBookReplyComment.fulfilled, (state, action) => {
        state.loading = false;
        const newReply = action.payload; // CommentDTO of the reply
        const parentCommentId = action.meta.arg.parentCommentId;

        // Find the parent comment and append the reply
        state.bookComments.comments = state.bookComments.comments.map((comment) => {
          if (comment.id === parentCommentId) {
            return {
              ...comment,
              replyComment: comment.replyComment ? [...comment.replyComment, newReply] : [newReply], // Initialize array if undefined
            };
          }
          return comment;
        });
      })
      .addCase(addBookReplyComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle like on comment
      .addCase(toggleLikeComment.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        const { commentId } = action.meta.arg;
        // Optimistic update
        state.bookComments.comments = state.bookComments.comments.map((comment) => {
          if (comment.id === commentId) {
            const newLiked = !comment.likedByCurrentUser;
            return {
              ...comment,
              likedByCurrentUser: newLiked,
              likedUsers: newLiked
                ? [...(comment.likedUsers || []), { id: "temp" }] // Add temp user to increase count
                : (comment.likedUsers || []).filter((u) => u.id !== "temp"), // Remove temp user to decrease count
            };
          }
          return comment;
        });
      })
      .addCase(toggleLikeComment.fulfilled, (state, action) => {
        state.loading = false;
        const { comment, commentType } = action.payload;
        if (commentType === "book") {
          state.bookComments.comments = updateCommentInList(state.bookComments.comments, comment);
        } else if (commentType === "chapter") {
          state.chapterComments.comments = updateCommentInList(state.chapterComments.comments, comment);
        } else if (commentType === "post") {
          state.postComments.comments = updateCommentInList(state.postComments.comments, comment);
        }
      })
      .addCase(toggleLikeComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        const { commentId } = action.meta.arg;
        // Revert optimistic update on failure
        state.bookComments.comments = state.bookComments.comments.map((comment) => {
          if (comment.id === commentId) {
            const originalLiked = !comment.likedByCurrentUser; // Revert to original
            return {
              ...comment,
              likedByCurrentUser: originalLiked,
              likedUsers: originalLiked
                ? [...(comment.likedUsers || []).filter((u) => u.id !== "temp"), { id: "temp" }]
                : (comment.likedUsers || []).filter((u) => u.id !== "temp"),
            };
          }
          return comment;
        });
      })
      // Edit comment
      .addCase(editCommentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editCommentThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedComment = action.payload;
        state.bookComments.comments = state.bookComments.comments.map((comment) =>
          comment.id === updatedComment.id ? updatedComment : comment
        );
      })
      .addCase(editCommentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete comment
      .addCase(deleteCommentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCommentThunk.fulfilled, (state, action) => {
        state.loading = false;
        const { commentId } = action.payload;
        state.bookComments.comments = state.bookComments.comments.filter((comment) => comment.id !== commentId);
      })
      .addCase(deleteCommentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Chapter Comments - add reply
      .addCase(addChapterReplyComment.pending, (state) => {
        state.chapterComments.loading = true;
        state.chapterComments.error = null;
      })
      .addCase(addChapterReplyComment.fulfilled, (state, action) => {
        state.chapterComments.loading = false;
        const newReply = action.payload; // the new reply comment DTO
        const parentCommentId = action.meta.arg.parentCommentId;
        state.chapterComments.comments = state.chapterComments.comments.map((comment) => {
          if (comment.id === parentCommentId) {
            return {
              ...comment,
              replyComment: comment.replyComment ? [...comment.replyComment, newReply] : [newReply],
            };
          }
          return comment;
        });
      })
      .addCase(addChapterReplyComment.rejected, (state, action) => {
        state.chapterComments.loading = false;
        state.chapterComments.error = action.payload;
      })
      // Post Comments - add reply
      .addCase(addPostReplyComment.pending, (state) => {
        state.postComments.loading = true;
        state.postComments.error = null;
      })
      .addCase(addPostReplyComment.fulfilled, (state, action) => {
        state.postComments.loading = false;
        const newReply = action.payload;
        const parentCommentId = action.meta.arg.parentCommentId;
        state.postComments.comments = state.postComments.comments.map((comment) => {
          if (comment.id === parentCommentId) {
            return {
              ...comment,
              replyComment: comment.replyComment ? [...comment.replyComment, newReply] : [newReply],
            };
          }
          return comment;
        });
      })
      .addCase(addPostReplyComment.rejected, (state, action) => {
        state.postComments.loading = false;
        state.postComments.error = action.payload;
      });
  },
});
const updateCommentInList = (comments, updatedComment) => {
  return comments.map((c) => {
    if (c.id === updatedComment.id) {
      return updatedComment;
    } else if (c.replyComment && c.replyComment.length > 0) {
      return {
        ...c,
        replyComment: updateCommentInList(c.replyComment, updatedComment),
      };
    }
    return c;
  });
};
export const { resetComments } = commentSlice.actions;
export default commentSlice.reducer;
