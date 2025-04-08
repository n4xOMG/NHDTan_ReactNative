import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getBookCount, getBooks, getTop10LikedBooks, getUserReadingProgressByBookId } from "../../services/BookServices";
import { saveReadingProgress } from "../../services/ChapterServices";

export const fetchBooks = createAsyncThunk("books/fetchBooks", async (page, { rejectWithValue }) => {
  try {
    const response = await getBooks(page);
    return response;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchTop10LikedBooks = createAsyncThunk("books/fetchTop10LikedBooks", async (_, { rejectWithValue }) => {
  try {
    const response = await getTop10LikedBooks();
    return response;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateReadingProgress = createAsyncThunk(
  "books/updateReadingProgress",
  async ({ chapterId, progress }, { rejectWithValue }) => {
    try {
      console.log("Updating reading progress:", { chapterId, progress });
      await saveReadingProgress({ chapterId, progress });
      return { chapterId, progress };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// New thunk to fetch reading progress
export const fetchReadingProgressByBookId = createAsyncThunk(
  "books/fetchReadingProgressByBookId",
  async ({ bookId }, { rejectWithValue }) => {
    try {
      const response = await getUserReadingProgressByBookId({ bookId });
      return response; // Expecting [{ chapterId, progress }, ...]
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBookCount = createAsyncThunk("books/fetchBookCount", async (_, { rejectWithValue }) => {
  try {
    const response = await getBookCount();
    return response;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const initialState = {
  books: [],
  top10LikedBooks: [],
  filteredBooks: [],
  readingProgress: [],
  loading: false,
  error: null,
  page: 1,
  searchQuery: "",
  bookCount: 0,
};

const bookSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      const query = action.payload;
      state.searchQuery = query;
      if (query.trim() === "") {
        state.filteredBooks = state.books;
      } else {
        state.filteredBooks = state.books.filter((book) => book.title.toLowerCase().includes(query.toLowerCase()));
      }
    },
    resetBooks: (state) => {
      state.books = [];
      state.filteredBooks = [];
      state.page = 1;
    },
    // Optionally add a reducer to clear or update comments
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        const newBooks = action.payload.filter((book) => !state.books.some((existing) => existing.id === book.id));
        state.books = [...state.books, ...newBooks];
        state.filteredBooks = state.searchQuery ? state.filteredBooks : state.books;
        state.page += 1;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTop10LikedBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTop10LikedBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.top10LikedBooks = action.payload;
      })
      .addCase(fetchTop10LikedBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateReadingProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReadingProgress.fulfilled, (state, action) => {
        state.loading = false;
        const { chapterId, progress } = action.payload;
        const existingIndex = state.readingProgress.findIndex((p) => p.chapterId === chapterId);
        if (existingIndex !== -1) {
          state.readingProgress[existingIndex] = {
            ...state.readingProgress[existingIndex],
            progress,
          };
        } else {
          state.readingProgress.push({ chapterId, progress });
        }
      })
      .addCase(updateReadingProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // New case for fetchReadingProgressByBookId
      .addCase(fetchReadingProgressByBookId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReadingProgressByBookId.fulfilled, (state, action) => {
        state.loading = false;
        state.readingProgress = action.payload;
      })
      .addCase(fetchReadingProgressByBookId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBookCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookCount.fulfilled, (state, action) => {
        state.loading = false;
        state.bookCount = action.payload;
      })
      .addCase(fetchBookCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSearchQuery, resetBooks } = bookSlice.actions;
export default bookSlice.reducer;
