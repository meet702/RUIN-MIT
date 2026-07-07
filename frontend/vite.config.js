import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
  plugins: [react()],
  define: {
    global: "globalThis",
  },
  server: {
    proxy: {
      "/api": {
        target: env.VITE_DEV_API_URL || "http://localhost:8089",
        changeOrigin: true,
      },
    },
  },
  };
});
