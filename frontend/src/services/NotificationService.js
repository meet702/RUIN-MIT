import axios from "axios";

const API_BASE_URL = "http://localhost:8089/api/notifications";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};

const unwrapResponse = (response) => response.data?.data ?? response.data;

export const notificationService = {
  getNotifications: async () => {
    const response = await axios.get(API_BASE_URL, {
      headers: getAuthHeaders(),
    });
    return unwrapResponse(response);
  },

  markAsRead: async (id) => {
    const response = await axios.patch(`${API_BASE_URL}/${id}/read`, null, {
      headers: getAuthHeaders(),
    });
    return unwrapResponse(response);
  },

  markAllAsRead: async () => {
    const response = await axios.patch(`${API_BASE_URL}/read-all`, null, {
      headers: getAuthHeaders(),
    });
    return unwrapResponse(response);
  },

  getUnreadCount: async () => {
    const response = await axios.get(`${API_BASE_URL}/unread-count`, {
      headers: getAuthHeaders(),
    });
    return unwrapResponse(response);
  },
};

export default notificationService;
