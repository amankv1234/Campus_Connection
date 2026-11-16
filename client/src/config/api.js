// API base URL configuration
// __API_URL__ is injected at build time by vite.config.js from the env var API_URL
// Set API_URL in Vercel/Render environment — no VITE_ prefix needed
// Trailing slash is stripped to avoid double-slash in URLs like API_URL + "/api/..."
export const API_URL = ((typeof __API_URL__ !== 'undefined' ? __API_URL__ : '') || import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
export const GOOGLE_CLIENT_ID = (typeof __GOOGLE_CLIENT_ID__ !== 'undefined' && __GOOGLE_CLIENT_ID__) ? __GOOGLE_CLIENT_ID__ : (import.meta.env.VITE_GOOGLE_CLIENT_ID || '438651872918-qh2oi29g0m5i2o5fr09vm1do547ff6qh.apps.googleusercontent.com');
export default API_URL;
