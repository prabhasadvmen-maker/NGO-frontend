import axios from 'axios';

// Get API base URL from environment variable
// For production: use Render/production backend URL
// For development: use relative path (proxied by Vite)
const isDev = import.meta.env.DEV;
const API_BASE_URL = isDev ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:5000');

// Configure default axios baseURL so relative API requests automatically route to backend
axios.defaults.baseURL = API_BASE_URL;

if (isDev) {
  console.log('✅ Development mode: Using Vite proxy for API calls');
} else if (!import.meta.env.VITE_API_URL && typeof window !== 'undefined') {
  console.warn('⚠️ VITE_API_URL not set, using localhost:5000 fallback');
}

export default API_BASE_URL;
