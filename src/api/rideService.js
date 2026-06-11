import { api } from "./api";

export const rideService = {
  getRides: async (status, vehicleType, page = 0, size = 10) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (vehicleType) params.append("vehicleType", vehicleType);
    params.append("page", page);
    params.append("size", size);

    const response = await api.get(`/rides?${params.toString()}`);
    return response.data;
  },

  getRideDetails: async (id) => {
    const response = await api.get(`/rides/${id}`);
    return response.data;
  },

  createRide: async (rideData) => {
    const response = await api.post("/rides", rideData);
    return response.data;
  },

  updateRide: async (id, rideData) => {
    const response = await api.put(`/rides/${id}`, rideData);
    return response.data;
  },

  bookRide: async (id) => {
    const response = await api.post(`/rides/${id}/book`);
    return response.data;
  },

  cancelBooking: async (id) => {
    const response = await api.delete(`/rides/${id}/book`);
    return response.data;
  },

  updateRideStatus: async (id, status) => {
    const response = await api.patch(`/rides/${id}/status`, { status });
    return response.data;
  }
};
