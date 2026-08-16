import axiosInstance from './axiosInstance';

export const getStores = async (params = {}) => {
  const response = await axiosInstance.get('/stores', { params });
  return response.data;
};

export const submitRating = async (storeId, rating, review = null) => {
  const response = await axiosInstance.post(`/stores/${storeId}/rating`, { rating, review });
  return response.data;
};

export const updateRating = async (storeId, rating, review = null) => {
  const response = await axiosInstance.put(`/stores/${storeId}/rating`, { rating, review });
  return response.data;
};

export const getMyRatings = async () => {
  const response = await axiosInstance.get('/stores/my-ratings');
  return response.data;
};

export const addFavorite = async (storeId) => {
  const response = await axiosInstance.post(`/stores/${storeId}/favorite`);
  return response.data;
};

export const removeFavorite = async (storeId) => {
  const response = await axiosInstance.delete(`/stores/${storeId}/favorite`);
  return response.data;
};

export const getUserFavorites = async () => {
  const response = await axiosInstance.get('/stores/favorites');
  return response.data;
};

export const getUserFavoriteStoreIds = async () => {
  const response = await axiosInstance.get('/stores/favorite-ids');
  return response.data;
};

export const reportReview = async (ratingId, reason, description = null) => {
  const response = await axiosInstance.post(`/reviews/${ratingId}/report`, { reason, description });
  return response.data;
};
