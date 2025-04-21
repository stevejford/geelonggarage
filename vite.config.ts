import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Determine if we're in production mode
const isProd = process.env.NODE_ENV === 'production';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "components": path.resolve(__dirname, "src/components"),
    },
  },
  preview: {
    host: true,
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    strictPort: true,
    // Allow all hosts including Render domain
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    // In production, allow all hosts; otherwise, only allow specific hosts
    allowedHosts: isProd ? true : ["geelonggarage.onrender.com", ".onrender.com", "localhost", ".localhost"],
  },
  server: {
    host: true,
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    strictPort: true,
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    // In production, allow all hosts; otherwise, only allow specific hosts
    allowedHosts: isProd ? true : ["geelonggarage.onrender.com", ".onrender.com", "localhost", ".localhost"],
  },
});
