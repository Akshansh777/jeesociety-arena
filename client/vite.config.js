import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Forces Vite to only use the single, correct instance of React
    dedupe: ['react', 'react-dom'], 
  },
  optimizeDeps: {
    // Prevents Vite from mangling the lucide-react hooks during pre-bundling
    exclude: ['lucide-react'],
  }
})