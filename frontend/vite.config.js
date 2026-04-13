import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendTarget = process.env.VITE_BACKEND_URL || 'http://localhost:8080';

export default defineConfig({
  plugins: [react()],
  publicDir: 'Public',
  server: {
    port: 5173,
    proxy: {
      '/api': backendTarget,
      '/oauth2': backendTarget,
      '/login': backendTarget
    }
  }
});
