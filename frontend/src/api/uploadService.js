import { api } from "./api";

export const uploadService = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/upload", formData, {
      headers: {
        "Content-Type": undefined, // removes the inherited application/json default
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data.url;
  }, 
};
