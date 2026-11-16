import axios from 'axios';
import { Platform } from 'react-native';
import { getStorageItem } from '../utils/secureStorage';

const PROD_API_URL = 'https://campusconnect-backend.onrender.com/api';

const getBaseUrl = () => {
  // In release builds (Android APK / production web), NEVER use localhost
  if (typeof __DEV__ !== 'undefined' && !__DEV__) {
    return process.env.EXPO_PUBLIC_API_URL || PROD_API_URL;
  }

  if (process.env.EXPO_PUBLIC_API_URL && !process.env.EXPO_PUBLIC_API_URL.includes('localhost')) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const host = window.location?.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
  }

  return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
};

const axiosClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
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

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Return structured error message from API if available
    const customMessage = error.response?.data?.message || error.message;
    return Promise.reject(new Error(customMessage));
  }
);

export default axiosClient;
