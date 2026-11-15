import axiosClient from './axiosClient';

/**
 * Get private notes for current student with search, filter, and pagination
 */
export const getNotesApi = async (params = {}) => {
  const response = await axiosClient.get('/notes', { params });
  return response.data;
};

/**
 * Get single note by ID
 */
export const getNoteByIdApi = async (id) => {
  const response = await axiosClient.get(`/notes/${id}`);
  return response.data;
};

/**
 * Create a new note
 */
export const createNoteApi = async (data) => {
  const response = await axiosClient.post('/notes', data);
  return response.data;
};

/**
 * Update an existing note
 */
export const updateNoteApi = async (id, data) => {
  const response = await axiosClient.put(`/notes/${id}`, data);
  return response.data;
};

/**
 * Delete a note
 */
export const deleteNoteApi = async (id) => {
  const response = await axiosClient.delete(`/notes/${id}`);
  return response.data;
};

/**
 * Quick JSON upload for backwards compatibility
 */
export const uploadNoteApi = async (data) => {
  const response = await axiosClient.post('/notes/quick-upload', data);
  return response.data;
};

export const toggleBookmarkApi = async (id) => {
  const response = await axiosClient.post(`/notes/${id}/bookmark`);
  return response.data;
};

export const rateNoteApi = async (id, score) => {
  const response = await axiosClient.post(`/notes/${id}/rate`, { score });
  return response.data;
};
