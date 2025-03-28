import { api, API_BASE_URL } from "../api/api";

export const getAllCreditPackages = async () => {
  try {
    const response = await api.post(`${API_BASE_URL}/credit-packages`);
    return response.data;
  } catch (error) {
    console.error("Error unlocking chapter:", error);
    throw error;
  }
};

export const getActiveCreditPackages = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/credit-packages/active`);
    return response.data;
  } catch (error) {
    console.error("Error getting active credit packages:", error);
    throw error;
  }
};

export const getCreditPackageById = async ({ id }) => {
  try {
    const response = await api.post(`${API_BASE_URL}/credit-packages/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error unlocking chapter:", error);
    throw error;
  }
};

export const createCreditPackage = async ({ creditPackage }) => {
  try {
    const response = await api.post(`${API_BASE_URL}/credit-packages`, {
      creditPackage,
    });
    return response.data;
  } catch (error) {
    console.error("Error unlocking chapter:", error);
    throw error;
  }
};
