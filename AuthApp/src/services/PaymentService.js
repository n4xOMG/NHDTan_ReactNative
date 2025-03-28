import { api, API_BASE_URL } from "../api/api";

export const createPaymentIntent = async (purchaseRequest) => {
  try {
    const response = await api.post(`${API_BASE_URL}/api/payments/create-payment-intent`, purchaseRequest);
    return response.data;
  } catch (error) {
    console.error("Error create payment intent:", error);
    throw error;
  }
};

export const confirmPayment = async (confirmPaymentRequest) => {
  try {
    const response = await api.post(`${API_BASE_URL}/api/payments/confirm-payment`, confirmPaymentRequest);
    return response.data;
  } catch (error) {
    throw error;
  }
};
