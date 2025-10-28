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
    allowedHosts: ['acb8420703c2.ngrok.app', 'dev.arbi.gg'],
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
