// vite.config.js

import { defineConfig } from 'vite';

export default defineConfig({
  root: './frontend',
  build: {
    outDir: '../dist',
    sourcemap: true,
  },
  server: {
    proxy: {
      '/schema': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/schema/, '')
      }
    }
  }
});
