import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: ['catobots.teobu.com', 'localhost', '.teobu.com'],
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://server:3001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: process.env.VITE_API_TARGET || 'http://server:3001',
        ws: true,
        changeOrigin: true,
      },
      '/uploads': {
        target: process.env.VITE_API_TARGET || 'http://server:3001',
        changeOrigin: true,
      }
    }
  },
})
