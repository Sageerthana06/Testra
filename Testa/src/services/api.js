import axios from 'axios';
import { Platform } from 'react-native';

// On Android Emulator, localhost maps to 10.0.2.2. On iOS simulator, it's 10.0.2.2 or localhost.
// We configure a default path pointing to our Express server running on port 5000.
const BASE_URL = Platform.select({
  ios: 'http://localhost:5001/api',
  android: 'http://10.0.2.2:5001/api',
  default: 'http://localhost:5001/api',
});

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to format errors cleanly
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('🌐 API Call Error:', error.config?.url, error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
