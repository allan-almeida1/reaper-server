import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@reaper/shared": path.resolve(__dirname, "../shared/index.ts"),
    },
  },
  build: {
    target: "es2015",
    cssTarget: "chrome61",
  },
});
