import axiosInstance from './axiosInstance';

export const getOwnerDashboard = async () => {
  const response = await axiosInstance.get('/owner/dashboard');
  return response.data;
};

export const createOwnerStore = async (storeData) => {
  const response = await axiosInstance.post('/owner/stores', storeData);
  return response.data;
};
