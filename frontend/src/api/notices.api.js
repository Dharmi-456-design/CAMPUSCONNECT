import axiosClient from './axiosClient';

/**
 * Get all college notices with search, category filtering, and pagination
 */
export const getNoticesApi = async (params = {}) => {
  const response = await axiosClient.get('/notices', { params });
  return response.data;
};

/**
 * Get single notice details by ID
 */
export const getNoticeByIdApi = async (id) => {
  const response = await axiosClient.get(`/notices/${id}`);
  return response.data;
};

/**
 * Create a new notice (Admin or Faculty only)
 */
export const createNoticeApi = async (data) => {
  const response = await axiosClient.post('/notices', data);
  return response.data;
};

/**
 * Update a notice (Admin or Faculty only)
 */
export const updateNoticeApi = async (id, data) => {
  const response = await axiosClient.put(`/notices/${id}`, data);
  return response.data;
};

/**
 * Delete a notice (Admin or Faculty only)
 */
export const deleteNoticeApi = async (id) => {
  const response = await axiosClient.delete(`/notices/${id}`);
  return response.data;
};
