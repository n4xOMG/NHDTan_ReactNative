import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_BASE_URL = "https://be8c-2402-800-63a7-fc91-b1be-6224-649b-363f.ngrok-free.app"; //This url might changed on runtime since it's generated with ngrok for local testing
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("userToken"); // Await the token retrieval
      if (token && token.trim() !== "") {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error retrieving token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
