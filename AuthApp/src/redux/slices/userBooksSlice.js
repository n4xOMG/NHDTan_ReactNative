import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getUserBooks, createBook, updateBook, deleteBook } from "../../services/BookServices";

// Fetch user books
export const fetchUserBooks = createAsyncThunk("userBooks/fetchUserBooks", async (authorId, { rejectWithValue }) => {
  try {
    const response = await getUserBooks(authorId);
    return response;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// Create a new book
export const addNewBook = createAsyncThunk("userBooks/addNewBook", async (bookData, { rejectWithValue }) => {
  try {
    const response = await createBook(bookData);
    return response;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// Update an existing book
export const editBook = createAsyncThunk("userBooks/editBook", async (bookData, { rejectWithValue }) => {
  try {
    const response = await updateBook(bookData);
    return response;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// Delete a book
export const removeBook = createAsyncThunk("userBooks/removeBook", async (bookId, { rejectWithValue }) => {
  try {
    await deleteBook(bookId);
    return bookId;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const initialState = {
  books: [],
  loading: false,
  error: null,
  currentBook: null,
};

const userBooksSlice = createSlice({
  name: "userBooks",
  initialState,
  reducers: {
    setCurrentBook: (state, action) => {
      state.currentBook = action.payload;
    },
    clearCurrentBook: (state) => {
      state.currentBook = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user books
      .addCase(fetchUserBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
      })
      .addCase(fetchUserBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add new book
      .addCase(addNewBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addNewBook.fulfilled, (state, action) => {
        state.loading = false;
        state.books.push(action.payload);
      })
      .addCase(addNewBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Edit book
      .addCase(editBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editBook.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.books.findIndex((book) => book.id === action.payload.id);
        if (index !== -1) {
          state.books[index] = action.payload;
        }
      })
      .addCase(editBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete book
      .addCase(removeBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeBook.fulfilled, (state, action) => {
        state.loading = false;
        state.books = state.books.filter((book) => book.id !== action.payload);
      })
      .addCase(removeBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentBook, clearCurrentBook } = userBooksSlice.actions;
export default userBooksSlice.reducer;
