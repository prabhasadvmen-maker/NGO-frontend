import axios from 'axios';

// Get API base URL from environment variable
// For production: use VITE_API_URL from .env.production (HTTPS)
// For development: use relative path (proxied by Vite)
const isDev = import.meta.env.DEV;
const API_BASE_URL = isDev ? '' : (import.meta.env.VITE_API_URL || 'https://savitramfoundation.com/api');

// Configure default axios baseURL so relative API requests automatically route to backend
axios.defaults.baseURL = API_BASE_URL;

if (isDev) {
  console.log('✅ Development mode: Using Vite proxy for API calls');
} else if (!import.meta.env.VITE_API_URL && typeof window !== 'undefined') {
  console.warn('⚠️ VITE_API_URL not set, using production backend fallback: https://savitramfoundation.com/api');
}

export default API_BASE_URL;
