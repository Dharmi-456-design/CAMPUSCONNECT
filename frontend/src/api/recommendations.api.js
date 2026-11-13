import axiosClient from './axiosClient';

export const getRecommendationsApi = async () => {
  const response = await axiosClient.get('/recommendations');
  return response.data;
};
