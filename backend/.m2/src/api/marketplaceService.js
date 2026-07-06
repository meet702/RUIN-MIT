import { api } from "./api";

export const marketplaceService = {
  getListings: async (category, condition, status, page = 0, size = 10) => {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (condition) params.append("condition", condition);
    if (status) params.append("status", status);
    params.append("page", page);
    params.append("size", size);

    const response = await api.get(`/marketplace?${params.toString()}`);
    return response.data;
  },

  getListingDetails: async (id) => {
    const response = await api.get(`/marketplace/${id}`);
    return response.data;
  },

  createListing: async (listingData) => {
    const response = await api.post("/marketplace", listingData);
    return response.data;
  },

  sendInquiry: async (id, message) => {
    const response = await api.post(`/marketplace/${id}/inquire`, { message });
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/marketplace/${id}/status`, { status });
    return response.data;
  },

  deleteListing: async (id) => {
    const response = await api.delete(`/marketplace/${id}`);
    return response.data;
  }
};
