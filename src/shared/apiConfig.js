// Get API base URL from environment variable or use localhost as fallback
// Note: Backend already includes /api in routes, so we only need the base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_BASE_URL;
