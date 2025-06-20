import axios from 'axios';

// Use import.meta.env for Vite environment variables
const baseURL = import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:8090/api';

const api = axios.create({
  baseURL: baseURL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Rest of your interceptor code remains the same...
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    config.metadata = { startTime: new Date() };
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    if (response.config.metadata?.startTime) {
      const endTime = new Date();
      const duration = endTime - response.config.metadata.startTime;
      console.log(`Request to ${response.config.url} took ${duration}ms`);
    }
    return response.data;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          window.dispatchEvent(new Event('unauthorized'));
          break;
        case 403:
          console.warn('Forbidden:', error.response.data);
          break;
        case 404:
          console.warn('Not Found:', error.config.url);
          break;
        case 500:
          console.error('Server Error:', error.response.data);
          break;
        default:
          console.error('Unhandled HTTP error:', error.response.status);
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error.response?.data || error.message || 'Unknown error');
  }
);

export default api;