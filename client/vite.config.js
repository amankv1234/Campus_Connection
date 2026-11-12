import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  define: {
    // Inject API_URL at build time — set this env var in Vercel (no VITE_ prefix needed)
    '__API_URL__': JSON.stringify(process.env.API_URL || 'http://localhost:5000')
  }
})
