import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'next/link': path.resolve(__dirname, './src/components/ui/link-shim.tsx'),
    },
  },
  // ── Proxy API calls to Express backend during dev ──────────────────────
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          motion: ['motion', 'framer-motion'],
          lucide: ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
})
