import { create } from 'zustand';
import axiosInstance from '../services/api';
import * as SecureStore from 'expo-secure-store';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  biometricsEnabled: false,

  // Login Action
  login: async (email, password, rememberMe = false) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { token, user } = response.data;

      // Persist token if requested
      if (rememberMe) {
        await SecureStore.setItemAsync('user_token', token);
        await SecureStore.setItemAsync('user_email', email);
      } else {
        await SecureStore.deleteItemAsync('user_token');
      }

      // Set token in Axios header
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false
      });

      // Start GPS tracking if role is marketing
      if (user.role === 'marketing') {
        get().startGpsTracking();
      }

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  // Check persisted session
  checkSession: async () => {
    try {
      const token = await SecureStore.getItemAsync('user_token');
      if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axiosInstance.get('/auth/profile');
        if (response.data.success) {
          const user = response.data.user;
          set({
            token,
            user,
            isAuthenticated: true
          });
          if (user.role === 'marketing') {
            get().startGpsTracking();
          }
        }
      }
    } catch (e) {
      console.log('No session stored');
      await SecureStore.deleteItemAsync('user_token');
    }
  },

  // Toggle biometric status
  setBiometrics: async (enabled) => {
    await SecureStore.setItemAsync('biometrics_enabled', enabled ? 'true' : 'false');
    set({ biometricsEnabled: enabled });
  },

  // GPS Tracking mock (triggers backend updates periodically)
  gpsIntervalId: null,
  startGpsTracking: () => {
    if (get().gpsIntervalId) return;

    console.log('📡 Starting GPS background tracking for Marketing Staff...');
    const interval = setInterval(async () => {
      try {
        // Mock location updates around Colombo (6.9271, 79.8612)
        const lat = 6.9271 + (Math.random() - 0.5) * 0.01;
        const lng = 79.8612 + (Math.random() - 0.5) * 0.01;
        
        await axiosInstance.post('/auth/gps', {
          latitude: lat,
          longitude: lng
        });
        console.log(`📍 GPS Uploaded: Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`);
      } catch (err) {
        console.warn('GPS Upload failed', err.message);
      }
    }, 30000); // every 30 seconds

    set({ gpsIntervalId: interval });
  },

  stopGpsTracking: () => {
    const interval = get().gpsIntervalId;
    if (interval) {
      clearInterval(interval);
      set({ gpsIntervalId: null });
      console.log('🛑 GPS background tracking stopped.');
    }
  },

  // Logout Action
  logout: async () => {
    get().stopGpsTracking();
    await SecureStore.deleteItemAsync('user_token');
    delete axiosInstance.defaults.headers.common['Authorization'];
    set({
      user: null,
      token: null,
      isAuthenticated: false
    });
  }
}));
