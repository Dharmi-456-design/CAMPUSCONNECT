import axiosClient from './axiosClient';

export const getNotesApi = async (params = {}) => {
  const response = await axiosClient.get('/notes', { params });
  return response.data;
};

export const getNoteByIdApi = async (id) => {
  const response = await axiosClient.get(`/notes/${id}`);
  return response.data;
};

// Upload note as JSON (fileUrl provided as a URL string, not multipart)
export const uploadNoteApi = async (data) => {
  const response = await axiosClient.post('/notes/quick-upload', data);
  return response.data;
};

export const createNoteApi = uploadNoteApi;

export const toggleBookmarkApi = async (id) => {
  const response = await axiosClient.post(`/notes/${id}/bookmark`);
  return response.data;
};

export const rateNoteApi = async (id, score) => {
  const response = await axiosClient.post(`/notes/${id}/rate`, { score });
  return response.data;
};
