import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist/client',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remover console.log en producción
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['bootstrap', 'react', 'react-dom'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['bootstrap', 'react', 'react-dom'],
  },
});
