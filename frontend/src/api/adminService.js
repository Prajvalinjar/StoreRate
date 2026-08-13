import axiosInstance from './axiosInstance';

export const getDashboardMetrics = async () => {
  const response = await axiosInstance.get('/admin/dashboard');
  return response.data;
};

export const getUsers = async (params = {}) => {
  const response = await axiosInstance.get('/admin/users', { params });
  return response.data;
};

export const getUserById = async (id) => {
  const response = await axiosInstance.get(`/admin/users/${id}`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await axiosInstance.post('/admin/users', userData);
  return response.data;
};

export const getStores = async (params = {}) => {
  const response = await axiosInstance.get('/admin/stores', { params });
  return response.data;
};

export const getStoreById = async (id) => {
  const response = await axiosInstance.get(`/admin/stores/${id}`);
  return response.data;
};

export const createStore = async (storeData) => {
  const response = await axiosInstance.post('/admin/stores', storeData);
  return response.data;
};
