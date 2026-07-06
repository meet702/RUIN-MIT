import { api } from "./api";

export const lostFoundService = {
  getPosts: async (type, status, page = 0, size = 10) => {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (status) params.append("status", status);
    params.append("page", page);
    params.append("size", size);

    const response = await api.get(`/lost-found?${params.toString()}`);
    return response.data;
  },

  getPostById: async (id) => {
    const response = await api.get(`/lost-found/${id}`);
    return response.data;
  },

  createPost: async (postData) => {
    const response = await api.post("/lost-found", postData);
    return response.data;
  },

  updatePost: async (id, postData) => {
    const response = await api.put(`/lost-found/${id}`, postData);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/lost-found/${id}/status`, { status });
    return response.data;
  },

  deletePost: async (id) => {
    const response = await api.delete(`/lost-found/${id}`);
    return response.data;
  }
};
