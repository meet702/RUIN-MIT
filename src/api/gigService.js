import { api } from "./api";

export const gigService = {
  getOpenGigs: async (page = 0, size = 10) => {
    const response = await api.get(`/gigs?page=${page}&size=${size}`);
    return response.data;
  },

  getGigDetails: async (id) => {
    const response = await api.get(`/gigs/${id}`);
    return response.data;
  },

  createGig: async (gigData) => {
    const response = await api.post("/gigs", gigData);
    return response.data;
  },

  updateGig: async (id, gigData) => {
    const response = await api.put(`/gigs/${id}`, gigData);
    return response.data;
  },

  applyToGig: async (id, message) => {
    const response = await api.post(`/gigs/${id}/apply`, { message });
    return response.data;
  },

  acceptApplicant: async (gigId, applicationId) => {
    const response = await api.post(`/gigs/${gigId}/applications/${applicationId}/accept`);
    return response.data;
  },

  unacceptApplicant: async (gigId, applicationId) => {
    const response = await api.post(`/gigs/${gigId}/applications/${applicationId}/unaccept`);
    return response.data;
  },

  updateGigStatus: async (id, status) => {
    const response = await api.patch(`/gigs/${id}/status`, { status });
    return response.data;
  }
};
