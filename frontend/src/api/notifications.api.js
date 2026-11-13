import axiosClient from './axiosClient';

export const getNotificationsApi = async () => {
  const response = await axiosClient.get('/notifications');
  return response.data;
};

export const markAsReadApi = async (id) => {
  const response = await axiosClient.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllAsReadApi = async () => {
  const response = await axiosClient.patch('/notifications/read-all');
  return response.data;
};
