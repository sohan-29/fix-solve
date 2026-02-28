import axios from 'axios';

// configure default base URL for backend APIs
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

export default instance;
