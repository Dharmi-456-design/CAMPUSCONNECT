import axiosClient from './axiosClient';

export const getEventsAndNoticesApi = async (params = {}) => {
  const response = await axiosClient.get('/events', { params });
  return response.data;
};

export const createEventNoticeApi = async (data) => {
  const response = await axiosClient.post('/events', data);
  return response.data;
};
