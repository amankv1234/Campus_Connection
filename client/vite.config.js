import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const googleClientId = env.VITE_GOOGLE_CLIENT_ID || env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '438651872918-qh2oi29g0m5i2o5fr09vm1do547ff6qh.apps.googleusercontent.com';
  const apiUrl = env.API_URL || env.VITE_API_URL || process.env.API_URL || 'http://localhost:5000';

  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    define: {
      '__API_URL__': JSON.stringify(apiUrl),
      '__GOOGLE_CLIENT_ID__': JSON.stringify(googleClientId)
    }
  };
})
