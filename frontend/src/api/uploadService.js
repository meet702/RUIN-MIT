import { api } from "./api";

export const uploadService = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    
    // api is the axios instance from api.js which automatically attaches the Bearer token
    const response = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    if (!response.data.success) {
        throw new Error(response.data.message);
    }
    
    return response.data.data.url;
  },
};
