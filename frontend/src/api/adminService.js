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

export const getPendingStores = async () => {
  const response = await axiosInstance.get('/admin/stores/pending');
  return response.data;
};

export const approveStore = async (storeId) => {
  const response = await axiosInstance.put(`/admin/stores/${storeId}/approve`);
  return response.data;
};

export const rejectStore = async (storeId, reason) => {
  const response = await axiosInstance.put(`/admin/stores/${storeId}/reject`, { reason });
  return response.data;
};

export const verifyStore = async (storeId) => {
  const response = await axiosInstance.put(`/admin/stores/${storeId}/verify`);
  return response.data;
};

export const unverifyStore = async (storeId) => {
  const response = await axiosInstance.put(`/admin/stores/${storeId}/unverify`);
  return response.data;
};

export const getReviewReports = async () => {
  const response = await axiosInstance.get('/admin/review-reports');
  return response.data;
};

export const dismissReviewReport = async (reportId) => {
  const response = await axiosInstance.put(`/admin/review-reports/${reportId}/dismiss`);
  return response.data;
};

export const hideReportedReview = async (reportId) => {
  const response = await axiosInstance.put(`/admin/review-reports/${reportId}/hide`);
  return response.data;
};

export const restoreReportedReview = async (reportId) => {
  const response = await axiosInstance.put(`/admin/review-reports/${reportId}/restore`);
  return response.data;
};
