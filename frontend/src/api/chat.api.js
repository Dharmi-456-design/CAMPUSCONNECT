import axiosClient from './axiosClient';

export const getConversationsApi = async () => {
  const response = await axiosClient.get('/chat/conversations');
  return response.data;
};

export const createOrGetConversationApi = async (recipientId) => {
  const response = await axiosClient.post('/chat/conversations', { recipientId });
  return response.data;
};

export const getMessagesApi = async (conversationId, params = {}) => {
  const response = await axiosClient.get(`/chat/conversations/${conversationId}/messages`, { params });
  return response.data;
};
