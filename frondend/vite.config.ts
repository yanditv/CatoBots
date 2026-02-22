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
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
})
