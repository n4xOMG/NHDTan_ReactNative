import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

//This url might changed on runtime since it's generated with ngrok for local testing
export const API_BASE_URL = "https://e1d0-2402-800-6340-aaf4-5974-7c5f-96f6-d072.ngrok-free.app";

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
        console.log("Token retrieved successfully", token);
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
