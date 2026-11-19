import axios from 'axios';
import { Platform } from 'react-native';
import { getStorageItem } from '../utils/secureStorage';

const PROD_API_URL = 'https://campusconnect-backend.onrender.com/api';

const getBaseUrl = () => {
  // 1. In Web Browser (localhost:8081 or LAN IP on desktop)
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const host = window.location?.hostname || 'localhost';
    // If running web on localhost or 127.0.0.1, always connect to localhost:5000
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    // Otherwise use current hostname with port 5000
    return `http://${host}:5000/api`;
  }

  // 2. In release builds (Android APK), NEVER use localhost
  if (typeof __DEV__ !== 'undefined' && !__DEV__) {
    return process.env.EXPO_PUBLIC_API_URL || PROD_API_URL;
  }

  // 3. In mobile development mode
  return process.env.EXPO_PUBLIC_API_URL || 'http://10.14.10.192:5000/api';
};

const axiosClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000, // 8 seconds timeout (fast failover instead of 15s freeze)
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
    const customMessage = error.response?.data?.message || error.message;
    return Promise.reject(new Error(customMessage));
  }
);

export default axiosClient;
