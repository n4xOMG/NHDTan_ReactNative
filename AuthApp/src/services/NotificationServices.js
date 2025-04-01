import { api, API_BASE_URL } from "../api/api";

export const getUnreadNotifications = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/notifications/unread`);
    return response.data;
  } catch (error) {
    console.error("Error during getting unread notifications:", error);
    throw error;
  }
};

export const updateAllNotificationsAsRead = async (notificationIds) => {
  try {
    const response = await Promise.all(notificationIds.map((id) => api.put(`${API_BASE_URL}/api/notifications/${id}/read`)));
    return response.data;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};
