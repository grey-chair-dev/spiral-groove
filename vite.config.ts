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
            manualChunks(id) {
              if (id.includes('node_modules')) {
                if (id.includes('react-dom') || id.includes('/react/') || id.includes('react-router')) {
                  return 'react-vendor'
                }
                if (id.includes('lucide-react')) {
                  return 'ui-vendor'
                }
                // Only created when ReceiptPage dynamically imports these
                if (id.includes('html2canvas') || id.includes('jspdf')) {
                  return 'pdf-vendor'
                }
              }
            },
          },
          // Avoid preloading PDF chunk on every HTML page load
        },
        modulePreload: {
          resolveDependencies: (_filename, deps) =>
            deps.filter((dep) => !dep.includes('pdf-vendor')),
        },
        chunkSizeWarningLimit: 600,
      },
    };
});
