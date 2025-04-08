import { api, API_BASE_URL } from "../api/api";

export const getAllCreditPackages = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/credit-packages`);
    return response.data;
  } catch (error) {
    console.error("Error fetching credit packages:", error);
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

export const getCreditPackageById = async (id) => {
  try {
    const response = await api.get(`${API_BASE_URL}/credit-packages/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error getting credit package:", error);
    throw error;
  }
};

export const createCreditPackage = async (creditPackage) => {
  try {
    const response = await api.post(`${API_BASE_URL}/credit-packages`, creditPackage);
    return response.data;
  } catch (error) {
    console.error("Error creating credit package:", error);
    throw error;
  }
};

export const updateCreditPackage = async (id, creditPackage) => {
  try {
    const response = await api.put(`${API_BASE_URL}/credit-packages/${id}`, creditPackage);
    return response.data;
  } catch (error) {
    console.error("Error updating credit package:", error);
    throw error;
  }
};

export const deleteCreditPackage = async (id) => {
  try {
    const response = await api.delete(`${API_BASE_URL}/credit-packages/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting credit package:", error);
    throw error;
  }
};

export const toggleCreditPackageStatus = async (id, isActive) => {
  try {
    const response = await api.patch(`${API_BASE_URL}/credit-packages/${id}/status`, { isActive });
    return response.data;
  } catch (error) {
    console.error("Error toggling credit package status:", error);
    throw error;
  }
};
