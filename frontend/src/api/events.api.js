import axiosClient from './axiosClient';

/**
 * Get all events with optional filters (search, category, perk, pagination)
 */
export const getEventsApi = async (params = {}) => {
  const response = await axiosClient.get('/events', { params });
  return response.data;
};

/**
 * Get single event details by ID
 */
export const getEventByIdApi = async (id) => {
  const response = await axiosClient.get(`/events/${id}`);
  return response.data;
};

/**
 * Create a new event (Admin or Faculty only)
 */
export const createEventApi = async (data) => {
  const response = await axiosClient.post('/events', data);
  return response.data;
};

/**
 * Update an existing event (Admin or Faculty only)
 */
export const updateEventApi = async (id, data) => {
  const response = await axiosClient.put(`/events/${id}`, data);
  return response.data;
};

/**
 * Delete an event (Admin or Faculty only)
 */
export const deleteEventApi = async (id) => {
  const response = await axiosClient.delete(`/events/${id}`);
  return response.data;
};

/**
 * Register current student for an event
 */
export const registerForEventApi = async (id) => {
  const response = await axiosClient.post(`/events/${id}/register`);
  return response.data;
};

/**
 * Cancel registration for an event
 */
export const cancelEventRegistrationApi = async (id) => {
  const response = await axiosClient.delete(`/events/${id}/register`);
  return response.data;
};

/**
 * Get all events registered by the current student (My Events)
 */
export const getMyRegistrationsApi = async () => {
  const response = await axiosClient.get('/events/my-registrations');
  return response.data;
};

// Backwards compatibility alias
export const getEventsAndNoticesApi = getEventsApi;
export const createEventNoticeApi = createEventApi;
