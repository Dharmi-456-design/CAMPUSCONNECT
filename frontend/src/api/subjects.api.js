import axiosClient from './axiosClient';

/**
 * Get all subjects for the authenticated user with search and pagination
 */
export const getSubjectsApi = async (params = {}) => {
  const response = await axiosClient.get('/subjects', { params });
  return response.data;
};

/**
 * Get single subject by ID with linked notes count
 */
export const getSubjectByIdApi = async (id) => {
  const response = await axiosClient.get(`/subjects/${id}`);
  return response.data;
};

/**
 * Create a new subject
 */
export const createSubjectApi = async (data) => {
  const response = await axiosClient.post('/subjects', data);
  return response.data;
};

/**
 * Update an existing subject
 */
export const updateSubjectApi = async (id, data) => {
  const response = await axiosClient.put(`/subjects/${id}`, data);
  return response.data;
};

/**
 * Delete a subject by ID
 */
export const deleteSubjectApi = async (id) => {
  const response = await axiosClient.delete(`/subjects/${id}`);
  return response.data;
};
