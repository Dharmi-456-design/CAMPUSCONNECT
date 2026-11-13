import axios from 'axios';
import { getStorageItem } from '../utils/secureStorage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.70:5000/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosClient.interceptors.request.use(
  async (config) => {
    const token = await getStorageItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosClient;
