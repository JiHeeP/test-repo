import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
      '@modules': '/src/modules',
      '@core': '/src/modules/core',
      '@data': '/src/modules/data',
      '@games': '/src/modules/games',
      '@pages': '/src/pages',
    },
  },
})
