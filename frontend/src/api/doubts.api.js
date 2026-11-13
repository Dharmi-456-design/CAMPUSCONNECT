import axiosClient from './axiosClient';

export const getDoubtsApi = async (params = {}) => {
  const response = await axiosClient.get('/doubts', { params });
  return response.data;
};

export const getDoubtByIdApi = async (id) => {
  const response = await axiosClient.get(`/doubts/${id}`);
  return response.data;
};

export const createDoubtApi = async (data) => {
  const response = await axiosClient.post('/doubts', data);
  return response.data;
};

export const createAnswerApi = async (doubtId, text) => {
  const response = await axiosClient.post(`/doubts/${doubtId}/answers`, { text });
  return response.data;
};

export const upvoteAnswerApi = async (answerId) => {
  const response = await axiosClient.patch(`/doubts/answers/${answerId}/upvote`);
  return response.data;
};

export const acceptAnswerApi = async (answerId) => {
  const response = await axiosClient.patch(`/doubts/answers/${answerId}/accept`);
  return response.data;
};
