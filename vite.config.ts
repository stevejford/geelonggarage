import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Determine if we're in production mode
const isProd = process.env.NODE_ENV === 'production';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-components': [
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip'
          ],
          'charts': ['apexcharts', 'react-apexcharts'],
          'icons': ['lucide-react'],
          'maps': ['@vis.gl/react-google-maps'],
          'auth': ['@clerk/clerk-react'],
          'data': ['convex', '@tanstack/react-query']
        }
      }
    }
  },
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
