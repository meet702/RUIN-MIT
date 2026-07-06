import { api } from "./api";

export const flatmateService = {
  getListings: async (status, genderPreference, page = 0, size = 10) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (genderPreference) params.append("genderPreference", genderPreference);
    params.append("page", page);
    params.append("size", size);
    
    const response = await api.get(`/flatmates?${params.toString()}`);
    return response.data;
  },

  getListingDetails: async (id) => {
    const response = await api.get(`/flatmates/${id}`);
    return response.data;
  },

  createListing: async (listingData) => {
    const response = await api.post("/flatmates", listingData);
    return response.data;
  },

  sendInquiry: async (id, message) => {
    const response = await api.post(`/flatmates/${id}/inquire`, { message });
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/flatmates/${id}/status`, { status });
    return response.data;
  },

  deleteListing: async (id) => {
    const response = await api.delete(`/flatmates/${id}`);
    return response.data;
  }
};
