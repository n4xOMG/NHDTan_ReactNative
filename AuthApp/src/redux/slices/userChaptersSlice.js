import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getAuthorChaptersByBookId,
  createDraftChapter,
  publishChapter,
  updateChapter,
  deleteChapter,
} from "../../services/ChapterServices";

// Fetch chapters for a specific book
export const fetchChaptersByBookId = createAsyncThunk(
  "userChapters/fetchChaptersByBookId",
  async ({ bookId, token }, { rejectWithValue }) => {
    try {
      console.log("Fetching chapters for book:", bookId);
      const response = await getAuthorChaptersByBookId({ bookId });
      console.log("Fetched chapters response:", response);
      return response;
    } catch (error) {
      console.error("Error fetching chapters:", error);
      return rejectWithValue(error.message || "Failed to fetch chapters");
    }
  }
);

// Create a new draft chapter
export const addDraftChapter = createAsyncThunk("userChapters/addDraftChapter", async ({ bookId, chapterData }, { rejectWithValue }) => {
  try {
    const response = await createDraftChapter({ bookId, chapter: chapterData });
    return response;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// Publish a chapter
export const publishNewChapter = createAsyncThunk(
  "userChapters/publishNewChapter",
  async ({ bookId, chapterData }, { rejectWithValue }) => {
    try {
      const response = await publishChapter({ bookId, chapter: chapterData });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update an existing chapter
export const editChapter = createAsyncThunk("userChapters/editChapter", async ({ chapterId, chapterData }, { rejectWithValue }) => {
  try {
    const response = await updateChapter({ chapterId, chapter: chapterData });
    return response;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// Delete a chapter
export const removeChapter = createAsyncThunk("userChapters/removeChapter", async ({ bookId, chapterId }, { rejectWithValue }) => {
  try {
    await deleteChapter({ bookId, chapterId });
    return chapterId;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const initialState = {
  chapters: [],
  loading: false,
  error: null,
  currentChapter: null,
};

const userChaptersSlice = createSlice({
  name: "userChapters",
  initialState,
  reducers: {
    setCurrentChapter: (state, action) => {
      state.currentChapter = action.payload;
    },
    clearCurrentChapter: (state) => {
      state.currentChapter = null;
    },
    clearChapters: (state) => {
      state.chapters = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch chapters
      .addCase(fetchChaptersByBookId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChaptersByBookId.fulfilled, (state, action) => {
        state.loading = false;
        state.chapters = action.payload;
      })
      .addCase(fetchChaptersByBookId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add draft chapter
      .addCase(addDraftChapter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addDraftChapter.fulfilled, (state, action) => {
        state.loading = false;
        state.chapters.push(action.payload);
      })
      .addCase(addDraftChapter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Publish chapter
      .addCase(publishNewChapter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(publishNewChapter.fulfilled, (state, action) => {
        state.loading = false;
        state.chapters.push(action.payload);
      })
      .addCase(publishNewChapter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Edit chapter
      .addCase(editChapter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editChapter.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.chapters.findIndex((chapter) => chapter.id === action.payload.id);
        if (index !== -1) {
          state.chapters[index] = action.payload;
        }
      })
      .addCase(editChapter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete chapter
      .addCase(removeChapter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeChapter.fulfilled, (state, action) => {
        state.loading = false;
        state.chapters = state.chapters.filter((chapter) => chapter.id !== action.payload);
      })
      .addCase(removeChapter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentChapter, clearCurrentChapter, clearChapters } = userChaptersSlice.actions;
export default userChaptersSlice.reducer;
