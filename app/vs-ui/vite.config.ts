import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "reaper.svg",
        "icons8-reaper-192.png",
        "icons8-reaper-144.png",
        "icons8-reaper-96.png",
      ],
      manifest: {
        name: "Reaper Server Control",
        short_name: "ReaperCtrl",
        description: "Controle remoto para Reaper e X18",
        theme_color: "#191E24",
        icons: [
          {
            src: "icons8-reaper-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons8-reaper-144.png",
            sizes: "144x144",
            type: "image/png",
          },
          {
            src: "icons8-reaper-96.png",
            sizes: "96x96",
            type: "image/png",
          },
          {
            src: "icons8-reaper-72.png",
            sizes: "72x72",
            type: "image/png",
          },
          {
            src: "icons8-reaper-48.png",
            sizes: "48x48",
            type: "image/png",
          },
          {
            src: "icons8-reaper-36.png",
            sizes: "36x36",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@reaper/shared": path.resolve(__dirname, "../shared/index.ts"),
    },
  },
});
