import axios from 'axios';

// Axios instance with JWT support
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : 'https://majorproject-deployment-2hsxl.ondigitalocean.app',
  withCredentials: true, // send cookies if needed
});

// Automatically add Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (data: { username: string; password: string }) => api.post('/api/login/', data),
  googleLogin: (data: { code: string; provider: string }) => api.post('/auth/google/', data),
};

export default api;
