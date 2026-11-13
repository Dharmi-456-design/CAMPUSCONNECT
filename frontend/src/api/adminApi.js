import axiosClient from './axiosClient';

export const getAdminAnalyticsApi = async () => {
  const response = await axiosClient.get('/admin/analytics');
  return response.data;
};

export const getAdminReportsApi = async (params = {}) => {
  const response = await axiosClient.get('/admin/reports', { params });
  return response.data;
};

export const updateReportStatusApi = async (reportId, status) => {
  const response = await axiosClient.patch(`/admin/reports/${reportId}`, { status });
  return response.data;
};
