import axiosClient from './axiosClient';

export const getListingsApi = async (params = {}) => {
  const response = await axiosClient.get('/marketplace', { params });
  return response.data;
};

export const getListingByIdApi = async (id) => {
  const response = await axiosClient.get(`/marketplace/${id}`);
  return response.data;
};

export const createListingApi = async (data) => {
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
  const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
  const response = await axiosClient.post('/marketplace', data, config);
  return response.data;
};

export const updateListingStatusApi = async (id, status) => {
  const response = await axiosClient.patch(`/marketplace/${id}/status`, { status });
  return response.data;
};

export const toggleFavoriteListingApi = async (id) => {
  const response = await axiosClient.post(`/marketplace/${id}/favorite`);
  return response.data;
};
