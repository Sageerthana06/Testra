// src/utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TOKEN: '@testraa_token',
  USER: '@testraa_user',
  THEME: '@testraa_theme',
  OFFLINE_QUEUE: '@testraa_offline_queue',
};

export const storage = {
  async setToken(token) {
    await AsyncStorage.setItem(KEYS.TOKEN, token);
  },
  async getToken() {
    return AsyncStorage.getItem(KEYS.TOKEN);
  },
  async setUser(user) {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  },
  async getUser() {
    const raw = await AsyncStorage.getItem(KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  },
  async setTheme(theme) {
    await AsyncStorage.setItem(KEYS.THEME, theme);
  },
  async getTheme() {
    return AsyncStorage.getItem(KEYS.THEME);
  },
  async clearSession() {
    await AsyncStorage.multiRemove([KEYS.TOKEN, KEYS.USER]);
  },
  async getOfflineQueue() {
    const raw = await AsyncStorage.getItem(KEYS.OFFLINE_QUEUE);
    return raw ? JSON.parse(raw) : [];
  },
  async setOfflineQueue(queue) {
    await AsyncStorage.setItem(KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  },
};
