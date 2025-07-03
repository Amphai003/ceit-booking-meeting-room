import axios from 'axios';

// 1. Environment Configuration
const baseURL = import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:8090/api';

// 2. Token Management Utilities
const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

const setToken = (token, persistent = false) => {
  if (persistent) {
    localStorage.setItem('token', token);
    sessionStorage.removeItem('token');
  } else {
    sessionStorage.setItem('token', token);
    localStorage.removeItem('token');
  }
};

const clearTokens = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
};

// 3. Axios Instance Configuration
const api = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 4. Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Add timing metadata
    config.metadata = { startTime: Date.now() };
    
    // Add authentication token if available
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Only add ngrok header for ngrok domains
    if (config.baseURL && config.baseURL.includes('ngrok-free.app')) {
      config.headers['ngrok-skip-browser-warning'] = 'true';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 5. Response Interceptor
api.interceptors.response.use(
  (response) => {
    // Log request duration
    if (response.config.metadata?.startTime) {
      const duration = Date.now() - response.config.metadata.startTime;
      console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`);
    }
    
    return response.data;
  },
  (error) => {
    // Enhanced error handling
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const url = error.config?.url || 'unknown endpoint';
      const method = error.config?.method?.toUpperCase() || 'REQUEST';
      
      console.error(`[API] ${status} Error - ${method} ${url}:`, data?.message || data);

      switch (status) {
        case 401:
          // Clear tokens and trigger auth flow
          console.warn('[API] Authentication failed - clearing tokens');
          clearTokens();
          
          // Dispatch custom event for app-wide handling
          window.dispatchEvent(new CustomEvent('auth-required', { 
            detail: { 
              message: data?.message || 'Authentication required',
              originalUrl: url 
            }
          }));
          break;
          
        case 403:
          // Handle forbidden errors
          window.dispatchEvent(new CustomEvent('api-error', { 
            detail: { 
              type: 'FORBIDDEN',
              message: data?.message || 'Access denied'
            }
          }));
          break;
          
        case 404:
          // Handle not found errors
          console.warn(`[API] 404: ${method} ${url} not found`);
          break;
          
        case 422:
          // Handle validation errors
          console.warn(`[API] Validation error:`, data);
          break;
          
        case 500:
          // Notify user about server errors
          window.dispatchEvent(new CustomEvent('api-error', {
            detail: {
              type: 'SERVER_ERROR',
              message: data?.message || 'Internal server error'
            }
          }));
          break;
      }
      
      return Promise.reject({
        status,
        message: data?.message || `HTTP Error ${status}`,
        data: data,
        url: url
      });
      
    } else if (error.request) {
      // Request was made but no response received
      console.error('[API] No response received:', error.request);
      return Promise.reject({
        status: null,
        message: 'Network error - no response from server',
        isNetworkError: true
      });
      
    } else {
      // Request setup error
      console.error('[API] Request setup error:', error.message);
      return Promise.reject({
        status: null,
        message: error.message || 'Request configuration error'
      });
    }
  }
);

// 6. Authentication Methods
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Store token if login successful
      if (response.token) {
        setToken(response.token, credentials.rememberMe);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('[API] Logout request failed:', error);
    } finally {
      clearTokens();
    }
  },
  
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh');
      if (response.token) {
        setToken(response.token);
      }
      return response;
    } catch (error) {
      clearTokens();
      throw error;
    }
  },
  
  getProfile: () => api.get('/auth/profile')
};

// 7. API Methods
export const roomsAPI = {
  fetchRooms: () => api.get('/rooms'),
  createRoom: (data) => api.post('/rooms', data),
  getRoom: (id) => api.get(`/rooms/${id}`),
  updateRoom: (id, data) => api.put(`/rooms/${id}`, data),
  deleteRoom: (id) => api.delete(`/rooms/${id}`)
};

// 8. Utility Functions
export const apiUtils = {
  setToken,
  getToken,
  clearTokens,
  
  // Check if user is authenticated
  isAuthenticated: () => !!getToken(),
  
  // Retry failed requests
  retryRequest: async (originalRequest, maxRetries = 3) => {
    let attempts = 0;
    
    while (attempts < maxRetries) {
      try {
        return await api(originalRequest);
      } catch (error) {
        attempts++;
        if (attempts >= maxRetries) throw error;
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
  }
};

// 9. Export configured axios instance
export default api;