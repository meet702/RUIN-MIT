import { api } from "./api";

export const authService = {
  register: async (fullName, email, password) => {
    const response = await api.post("/auth/register", { fullName, email, password });
    return response.data;
  },

  verifyEmail: async (email, otp) => {
    const response = await api.post("/auth/verify-email", { email, otp });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post("/auth/refresh", { refreshToken });
    return response.data;
  },

  logout: async (refreshToken) => {
    const response = await api.post("/auth/logout", { refreshToken });
    return response.data;
  },

  resendOtp: async (email) => {
    const response = await api.post("/auth/resend-otp", { email });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (email, otp, newPassword) => {
    const response = await api.post("/auth/reset-password", { email, otp, newPassword });
    return response.data;
  }
};
