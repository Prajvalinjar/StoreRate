import axiosInstance from './axiosInstance';

/**
 * Fetches public platform aggregate statistics for the landing page.
 */
export const getPublicStats = async () => {
  const response = await axiosInstance.get('/public/stats');
  return response.data.data;
};

/**
 * Fetches public store list with search and pagination support.
 */
export const getPublicStores = async (params = {}) => {
  const response = await axiosInstance.get('/public/stores', { params });
  return response.data;
};

/**
 * Fetches public store details by store ID.
 */
export const getPublicStoreById = async (storeId) => {
  const response = await axiosInstance.get(`/public/stores/${storeId}`);
  return response.data;
};
