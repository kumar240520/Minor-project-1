import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'netlify' ? '/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: mode === 'development',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (/[\\/]node_modules[\\/](react|react-dom|react-router-dom|scheduler)[\\/]/.test(id)) {
            return 'react-vendor';
          }

          if (/[\\/]node_modules[\\/](framer-motion|motion|motion-dom)[\\/]/.test(id)) {
            return 'motion';
          }

          if (id.includes('@supabase')) {
            return 'supabase';
          }

          if (id.includes('recharts') || id.includes('d3-')) {
            return 'charts';
          }

          if (id.includes('date-fns')) {
            return 'date-fns';
          }

          if (id.includes('lucide-react') || id.includes('@hugeicons')) {
            return 'icons';
          }

          return undefined;
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  preview: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  define: {
    __APP_ENV__: JSON.stringify(mode)
  }
}))
