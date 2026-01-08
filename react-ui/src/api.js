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
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
