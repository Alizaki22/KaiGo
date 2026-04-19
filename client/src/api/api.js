// src/api/api.js
// Axios instance pre-configured with base URL and JWT auth header
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔧 Change this to your machine's local IP when testing on a physical device
// For Android emulator use: http://10.0.2.2:5000
// For iOS simulator / Expo Go on same WiFi: http://<YOUR_IP>:5000
const BASE_URL = 'http://10.0.2.2:5000/api'; // Android emulator default

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10 second timeout
});

// Request interceptor — attach JWT token automatically
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('kaigo_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — extract data or format error message
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.msg ||
      error.message ||
      'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default api;
