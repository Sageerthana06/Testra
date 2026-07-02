// src/api/auth.js
import api from './axios';

export const loginUser = (email, password) =>
  api.post('/auth/login', { email, password });

export const refreshToken = () =>
  api.get('/auth/me');
