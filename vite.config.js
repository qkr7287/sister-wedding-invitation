import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: './',
  server: {
    host: true,
    port: 5173
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        photo: resolve(__dirname, 'photo.html')
      },
      output: {
        manualChunks: {
          three: ['three']
        }
      }
    }
  }
});
