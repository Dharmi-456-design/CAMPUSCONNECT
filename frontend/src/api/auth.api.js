import axiosClient from './axiosClient';

export const loginApi = async (email, password) => {
  const response = await axiosClient.post('/auth/login', { email, password });
  return response.data;
};

export const registerApi = async (userData) => {
  const response = await axiosClient.post('/auth/register', userData);
  return response.data;
};

export const googleLoginApi = async ({ credential, idToken, userInfo }) => {
  const response = await axiosClient.post('/auth/google', { credential, idToken, userInfo });
  return response.data;
};

export const getMeApi = async () => {
  const response = await axiosClient.get('/users/me');
  return response.data;
};

export const updateProfileApi = async (formData) => {
  const response = await axiosClient.put('/users/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};
