import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Relative base path for GitHub Pages compatibility
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 1500
  },
  server: {
    port: 3000,
    open: true
  }
});
