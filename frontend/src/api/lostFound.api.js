import axiosClient from './axiosClient';

/**
 * Get lost and found items with search, filter, and pagination
 */
export const getLostFoundItemsApi = async (params = {}) => {
  const response = await axiosClient.get('/lost-found', { params });
  return response.data;
};

/**
 * Get single lost and found item by ID
 */
export const getLostFoundItemByIdApi = async (id) => {
  const response = await axiosClient.get(`/lost-found/${id}`);
  return response.data;
};

/**
 * Create a new lost or found item
 */
export const createLostFoundItemApi = async (data) => {
  const response = await axiosClient.post('/lost-found', data);
  return response.data;
};

/**
 * Update an existing lost and found item
 */
export const updateLostFoundItemApi = async (id, data) => {
  const response = await axiosClient.put(`/lost-found/${id}`, data);
  return response.data;
};

/**
 * Delete a lost and found item
 */
export const deleteLostFoundItemApi = async (id) => {
  const response = await axiosClient.delete(`/lost-found/${id}`);
  return response.data;
};
