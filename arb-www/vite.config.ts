import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    port: 3000,
    middlewareMode: false,
    host: true,
    allowedHosts: ['eaa2da739953.ngrok.app'],
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
