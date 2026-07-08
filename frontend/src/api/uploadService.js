import { api } from "./api";

export const uploadService = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    // Don't set Content-Type manually — let axios/browser handle the boundary
    const response = await api.post("/upload", formData);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data.url;
  },
};
