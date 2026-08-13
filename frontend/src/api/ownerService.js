import axiosInstance from './axiosInstance';

export const getOwnerDashboard = async () => {
  const response = await axiosInstance.get('/owner/dashboard');
  return response.data;
};
