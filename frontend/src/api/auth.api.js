import axiosClient from './axiosClient';

// @desc Login user
export const loginApi = async (credentialsOrEmail, maybePassword) => {
  const payload =
    typeof credentialsOrEmail === 'object'
      ? credentialsOrEmail
      : { email: credentialsOrEmail, password: maybePassword };

  const response = await axiosClient.post('/auth/login', payload);
  return response.data;
};

// @desc Register user
export const registerApi = async (userData) => {
  const response = await axiosClient.post('/auth/register', userData);
  return response.data;
};

// @desc Google OAuth
export const googleLoginApi = async ({ credential, idToken, userInfo }) => {
  const response = await axiosClient.post('/auth/google', { credential, idToken, userInfo });
  return response.data;
};

// @desc Get current profile
export const getMeApi = async () => {
  const response = await axiosClient.get('/auth/me');
  return response.data;
};

// @desc Update profile
export const updateProfileApi = async (data) => {
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
  const config = isFormData
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : {};
  const response = await axiosClient.put('/users/profile', data, config);
  return response.data;
};

// @desc Change password
export const changePasswordApi = async (currentPassword, newPassword) => {
  const response = await axiosClient.put('/users/change-password', {
    currentPassword,
    newPassword
  });
  return response.data;
};
