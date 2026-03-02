import axios from 'axios';

// Configure default base URL for backend APIs
// For LAN access, set VITE_API_URL=http://YOUR_SERVER_IP:3000 in .env file
// Example: VITE_API_URL=http://10.10.7.148:3000
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',  // Use relative path for proxy in dev, or absolute URL in production
});

export default instance;
