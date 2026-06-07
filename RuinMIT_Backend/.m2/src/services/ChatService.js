import { api } from "../api/api";

export const getChatToken = () => localStorage.getItem("token") || localStorage.getItem("accessToken");

export const chatService = {
  getConversations: async () => {
    const response = await api.get("/chat/conversations");
    return response.data;
  },

  getChatHistory: async (conversationId) => {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`);
    return response.data;
  },

  startConversation: async (otherUserId, referenceType, referenceId) => {
    const response = await api.post("/chat/conversations/start", {
      otherUserId,
      referenceType,
      referenceId,
    });
    return response.data;
  },
};
