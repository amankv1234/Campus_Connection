// API base URL configuration: uses VITE_API_URL if defined, otherwise defaults to local dev server
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export default API_URL;
