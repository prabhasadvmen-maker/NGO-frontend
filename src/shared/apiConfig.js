// Get API base URL from environment variable
// For production: use Render backend URL
// For development: use localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

if (!import.meta.env.VITE_API_URL && typeof window !== 'undefined') {
  console.warn('⚠️ VITE_API_URL not set, using localhost fallback');
}

export default API_BASE_URL;
