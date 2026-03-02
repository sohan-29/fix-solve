import axios from 'axios';

// Configure default base URL for backend APIs
// The backend is running on port 3000 on the same machine/server

// Check if we are accessing via localhost or a network IP
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const getApiBaseUrl = () => {
  // If running in development AND accessing via localhost, use proxy (relative URL)
  if (import.meta.env.DEV && isLocalhost) {
    return '';
  }
  // For network access in development, use proxy (relative URL works with Vite proxy)
  if (import.meta.env.DEV) {
    return '';  // Use Vite proxy for all dev access including network
  }
  // For production
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Default: use direct connection to backend on port 3000
  return window.location.protocol + '//' + window.location.hostname + ':3000';
};

const instance = axios.create({
  baseURL: getApiBaseUrl(),
});

export default instance;
