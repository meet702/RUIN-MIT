import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis",
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8089",
        changeOrigin: true,
      },
    },
  },
});
