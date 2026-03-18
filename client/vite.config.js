import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

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
            return
          }

          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'react-vendor'
          }

          if (id.includes('@supabase')) {
            return 'supabase'
          }

          if (id.includes('recharts') || id.includes('d3-')) {
            return 'charts'
          }

          if (id.includes('framer-motion') || id.includes('motion-dom')) {
            return 'motion'
          }

          if (id.includes('date-fns')) {
            return 'date-fns'
          }

          if (id.includes('lucide-react')) {
            return 'icons'
          }

          return undefined
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
    host: true
  },
  preview: {
    port: 3000,
    host: true
  },
  define: {
    __APP_ENV__: JSON.stringify(mode)
  }
}))
