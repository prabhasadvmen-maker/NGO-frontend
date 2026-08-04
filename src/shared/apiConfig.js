import axios from 'axios';

// Get API base URL from environment variable
// For production: use Render/production backend URL
// For development: fallback to http://localhost:5000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Configure default axios baseURL so relative API requests automatically route to backend
axios.defaults.baseURL = API_BASE_URL;

if (!import.meta.env.VITE_API_URL && typeof window !== 'undefined') {
  console.warn('⚠️ VITE_API_URL not set, using localhost:5000 fallback');
}

export default API_BASE_URL;
