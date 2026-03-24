export const BASE_URL = import.meta.env.VITE_API_URL || 'https://majorproject-deployment-2hsxl.ondigitalocean.app/api';

import axios from 'axios';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Include cookies for session-based auth
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Fix: Only apply for non-cart APIs and if we haven't already retried
    if (
      error.response?.status === 401 &&
      !originalRequest.url.includes('/cart/') &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh');
        
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        // Try to get a new access token
        const res = await axios.post(`${BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = res.data.access;
        localStorage.setItem('access', newAccessToken);

        // Update the header and retry the original request
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        // If refresh fails, clear everything and redirect to login
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;