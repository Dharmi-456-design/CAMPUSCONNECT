import axiosClient from './axiosClient';

export const getTeamPostsApi = async (params = {}) => {
  const response = await axiosClient.get('/team-posts', { params });
  return response.data;
};

export const getTeamPostByIdApi = async (id) => {
  const response = await axiosClient.get(`/team-posts/${id}`);
  return response.data;
};

export const createTeamPostApi = async (postData) => {
  const response = await axiosClient.post('/team-posts', postData);
  return response.data;
};

export const createTeamRequestApi = async (postId, message) => {
  const response = await axiosClient.post(`/team-posts/${postId}/requests`, { message });
  return response.data;
};

export const respondToTeamRequestApi = async (requestId, status) => {
  const response = await axiosClient.patch(`/team-posts/requests/${requestId}`, { status });
  return response.data;
};
