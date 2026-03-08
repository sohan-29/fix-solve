import axios from 'axios';

// Configure default base URL for backend APIs
// Backend is running on port 3000

const instance = axios.create({
  // Use proxy through Vite - this ensures requests go through the dev server proxy
  baseURL: '/api',
  timeout: 30000,
});

// Add request interceptor for debugging
instance.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
instance.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.config?.url, error.message);
    return Promise.reject(error);
  }
);

export default instance;
