// API base URL configuration
// __API_URL__ is injected at build time by vite.config.js from the env var API_URL
// Set API_URL in Vercel/Render environment — no VITE_ prefix needed
export const API_URL = __API_URL__;
export default API_URL;
