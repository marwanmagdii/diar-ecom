import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: false, // Disabled to prevent Node 24 + Vercel CLI WebSocket crashes
    proxy: {
      '/api': {
        target: 'http://localhost:3005',
        changeOrigin: true
      }
    },
    watch: {
      ignored: ['**/dist/**']
    }
  }
})
