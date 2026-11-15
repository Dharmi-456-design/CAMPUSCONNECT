import axiosClient from './axiosClient';

/**
 * Get all community posts with optional search, category, and subject filters
 */
export const getPostsApi = async (params = {}) => {
  const response = await axiosClient.get('/community/posts', { params });
  return response.data;
};

/**
 * Get single community post by ID (includes comments)
 */
export const getPostByIdApi = async (id) => {
  const response = await axiosClient.get(`/community/posts/${id}`);
  return response.data;
};

/**
 * Create a new community post
 */
export const createPostApi = async (data) => {
  const response = await axiosClient.post('/community/posts', data);
  return response.data;
};

/**
 * Update an existing community post
 */
export const updatePostApi = async (id, data) => {
  const response = await axiosClient.put(`/community/posts/${id}`, data);
  return response.data;
};

/**
 * Delete a community post
 */
export const deletePostApi = async (id) => {
  const response = await axiosClient.delete(`/community/posts/${id}`);
  return response.data;
};

/**
 * Add a comment to a community post
 */
export const addCommentApi = async (postId, data) => {
  const response = await axiosClient.post(`/community/posts/${postId}/comments`, data);
  return response.data;
};

/**
 * Get comments for a community post
 */
export const getCommentsApi = async (postId) => {
  const response = await axiosClient.get(`/community/posts/${postId}/comments`);
  return response.data;
};
