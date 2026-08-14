import axiosInstance from './axiosInstance';

/**
 * Fetches public platform aggregate statistics for the landing page.
 */
export const getPublicStats = async () => {
  const response = await axiosInstance.get('/public/stats');
  return response.data.data;
};
