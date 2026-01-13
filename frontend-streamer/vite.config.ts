import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3032,
    proxy: {
      '/api': {
        target: 'http://localhost:8031',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://localhost:8031',
        ws: true
      }
    }
  }
})
