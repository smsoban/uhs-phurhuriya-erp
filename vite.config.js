import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Frontend client port 3000 par chalega
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001', // Backend server port 5001
        changeOrigin: true,
        secure: false,
      },
    },
  },
})