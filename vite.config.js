import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom'],

          // MUI core components
          'vendor-mui': [
            '@mui/material',
            '@emotion/react',
            '@emotion/styled',
          ],

          // MUI date/time pickers (the biggest culprit)
          'vendor-mui-pickers': [
            '@mui/x-date-pickers',
          ],

          // Date utilities
          'vendor-date': ['date-fns'],

          // Axios + toast notifications
          'vendor-utils': ['axios', 'react-hot-toast'],
        },
      },
    },
  },
})
