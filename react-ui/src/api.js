import axios from 'axios';

const isTauri = window.location.host === 'tauri.localhost';

const baseURL = isTauri
  ? 'http://127.0.0.1:3000'
  : 'http://localhost:3000';

const api = axios.create({
  baseURL,
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    // ✅ Only add user token if:
    // 1. Token exists
    // 2. No Authorization header is already set (from auth config)
    // 3. Request is to your backend (or has skipUserAuth flag)

    const isBackendRequest = !config.url ||
      config.url.startsWith('/') ||
      config.url.includes('localhost:3000') ||
      config.url.includes('127.0.0.1:3000');

    if (token && !config.headers['Authorization'] && isBackendRequest) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;