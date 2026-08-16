import axiosInstance from './axiosInstance';

export const getOwnerDashboard = async () => {
  const response = await axiosInstance.get('/owner/dashboard');
  return response.data;
};

export const createOwnerStore = async (storeData) => {
  const response = await axiosInstance.post('/owner/stores', storeData);
  return response.data;
};

export const postOwnerReply = async (ratingId, reply) => {
  const response = await axiosInstance.put(`/owner/ratings/${ratingId}/reply`, { reply });
  return response.data;
};

export const deleteOwnerReply = async (ratingId) => {
  const response = await axiosInstance.delete(`/owner/ratings/${ratingId}/reply`);
  return response.data;
};
