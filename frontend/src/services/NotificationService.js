import { api } from "./api";

const unwrapResponse = (response) => response.data?.data ?? response.data;

export const notificationService = {
  getNotifications: async () => {
    const response = await api.get("/notifications");
    return unwrapResponse(response);
  },

  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`, null);
    return unwrapResponse(response);
  },

  markAllAsRead: async () => {
    const response = await api.patch("/notifications/read-all", null);
    return unwrapResponse(response);
  },

  getUnreadCount: async () => {
    const response = await api.get("/notifications/unread-count");
    return unwrapResponse(response);
  },
};

export default notificationService;