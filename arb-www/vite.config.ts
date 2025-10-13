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
    allowedHosts: ['aa030e00a972.ngrok.app', 'dev.arbi.gg'], // Frontend host
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
