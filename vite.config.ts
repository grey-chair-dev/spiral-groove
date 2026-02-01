import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      css: {
        postcss: './postcss.config.js',
      },
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://127.0.0.1:3001',
            changeOrigin: true,
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              // Split vendor libraries into separate chunks
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
              'ui-vendor': ['lucide-react'],
              // Split heavy libraries that are only used in specific pages
              'chart-vendor': ['recharts'],
              'pdf-vendor': ['html2canvas', 'jspdf'],
            },
          },
        },
        chunkSizeWarningLimit: 600,
      },
    };
});
