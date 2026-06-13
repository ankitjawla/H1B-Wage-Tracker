import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Split rarely-changing vendor code so app updates don't invalidate
        // the large cached mapbox-gl bundle
        manualChunks: {
          "mapbox-gl": ["mapbox-gl"],
          react: ["react", "react-dom"],
        },
      },
    },
  },
});
