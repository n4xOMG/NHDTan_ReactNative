import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import bookReducer from "./slices/bookSlice";
import commentReducer from "./slices/commentSlice";
import notificationReducer from "./slices/notificationSlice";
import userBooksReducer from "./slices/userBooksSlice";
import postReducer from "./slices/postSlice";
import userChaptersReducer from "./slices/userChaptersSlice";
import userReducer from "./slices/userSlice";
import chatReducer from "./slices/chatSlice";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth"],
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    books: bookReducer,
    comments: commentReducer,
    notifications: notificationReducer,
    userBooks: userBooksReducer,
    posts: postReducer,
    userChapters: userChaptersReducer,
    user: userReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);
