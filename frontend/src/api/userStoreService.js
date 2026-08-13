import axiosInstance from './axiosInstance';

export const getStores = async (params = {}) => {
  const response = await axiosInstance.get('/stores', { params });
  return response.data;
};

export const submitRating = async (storeId, rating) => {
  const response = await axiosInstance.post(`/stores/${storeId}/rating`, { rating });
  return response.data;
};

export const updateRating = async (storeId, rating) => {
  const response = await axiosInstance.put(`/stores/${storeId}/rating`, { rating });
  return response.data;
};

export const getMyRatings = async () => {
  const response = await axiosInstance.get('/stores/my-ratings');
  return response.data;
};
