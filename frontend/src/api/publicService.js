import axiosInstance from './axiosInstance';

/**
 * Fetches public platform aggregate statistics for the landing page.
 */
export const getPublicStats = async () => {
  try {
    const response = await axiosInstance.get('/public/stats');
    return response.data?.data || null;
  } catch (err) {
    console.error('getPublicStats error:', err);
    return null;
  }
};

/**
 * Fetches public store list with search and pagination support.
 */
export const getPublicStores = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/public/stores', { params });
    return response.data || { status: 'success', data: { stores: [], pagination: {} } };
  } catch (err) {
    console.error('getPublicStores error:', err);
    return { status: 'error', data: { stores: [], pagination: {} } };
  }
};

/**
 * Fetches public store details by store ID.
 */
export const getPublicStoreById = async (storeId) => {
  try {
    const response = await axiosInstance.get(`/public/stores/${storeId}`);
    return response.data || { status: 'error', data: { store: null } };
  } catch (err) {
    console.error('getPublicStoreById error:', err);
    return { status: 'error', data: { store: null } };
  }
};

/**
 * Fetches top rated stores for featured showcase and discovery.
 */
export const getTopRatedStores = async (limit = 6) => {
  try {
    const response = await axiosInstance.get('/public/stores/top-rated', { params: { limit } });
    return response.data || { status: 'success', data: { stores: [] } };
  } catch (err) {
    console.error('getTopRatedStores error:', err);
    return { status: 'error', data: { stores: [] } };
  }
};
