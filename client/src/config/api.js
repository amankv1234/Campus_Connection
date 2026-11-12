// API base URL configuration
// __API_URL__ is injected at build time by vite.config.js from the env var API_URL
// Set API_URL in Vercel/Render environment — no VITE_ prefix needed
// Trailing slash is stripped to avoid double-slash in URLs like API_URL + "/api/..."
export const API_URL = (__API_URL__).replace(/\/+$/, '');
export default API_URL;
