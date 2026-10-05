import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: "es2022",
    // The lazy 3D chunk (three + R3F) is ~920 kB raw / ~245 kB gzip and loads after idle.
    chunkSizeWarningLimit: 1000,
  },
});
