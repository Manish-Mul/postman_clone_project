import api from './api';

const API_BASE_URL = "http://localhost:3000"; 

// Collections 
export const getCollections = async () => {
  const res = await api.get('/collections');
  return res.data;
};

export const createCollection = async (name) => {
  const res = await api.post('/collections', { name });
  return res.data;
};

// Workspaces
export const getWorkspaces = async () => {
  const res = await api.get('/workspaces');
  return res.data;
};

// Requests
export const getRequests = async (collectionId) => {
  const res = await api.get(`/requests/${collectionId}`);
  return res.data;
};

// Folders
export const getFolders = async () => {
  const res = await api.get('/folders/');
  return res.data;
};

