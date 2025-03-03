import { api, API_BASE_URL } from "../api/api";

export const getUserProfileByJwt = async (jwt) => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/user/profile`);
    return response.data;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};
