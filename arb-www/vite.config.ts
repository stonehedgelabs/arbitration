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
    allowedHosts: ['444037a67f75.ngrok.app'], // Frontend host
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
