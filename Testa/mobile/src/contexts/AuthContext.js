// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { loginUser } from '../api/auth';
import { ROLE_THEMES } from '../constants/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  // Restore session on app start
  useEffect(() => {
    (async () => {
      try {
        const savedToken = await storage.getToken();
        const savedUser = await storage.getUser();
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);
        }
      } catch (e) {
        console.warn('Session restore failed:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await loginUser(email.trim().toLowerCase(), password);
      if (res.data.success) {
        const { token: jwt, user: u } = res.data;
        await storage.setToken(jwt);
        await storage.setUser(u);
        // Set default theme for role
        await storage.setTheme(ROLE_THEMES[u.role] || 'lightgreen');
        setToken(jwt);
        setUser(u);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      // Fallback: offline demo login
      return offlineFallbackLogin(email.trim().toLowerCase(), password);
    }
  };

  const offlineFallbackLogin = async (email, password) => {
    const mockUsers = [
      { id: 'u_superadmin', name: 'Super Admin Owner', email: 'superadmin@erp.com', password: 'admin123', role: 'super_admin' },
      { id: 'u_admin', name: 'Admin Manager', email: 'admin@erp.com', password: 'admin123', role: 'admin' },
      { id: 'u_manager', name: 'Colombo Branch Manager', email: 'manager@erp.com', password: 'admin123', role: 'branch_manager' },
      { id: 'u_marketing', name: 'Marketing Officer', email: 'marketing@erp.com', password: 'admin123', role: 'marketing' },
    ];
    const found = mockUsers.find((u) => u.email === email && u.password === password);
    if (found) {
      const { password: _p, ...safeUser } = found;
      const fakeToken = 'offline_token_' + Date.now();
      await storage.setToken(fakeToken);
      await storage.setUser(safeUser);
      await storage.setTheme(ROLE_THEMES[safeUser.role] || 'lightgreen');
      setToken(fakeToken);
      setUser(safeUser);
      return { success: true, offline: true };
    }
    return { success: false, message: 'Invalid email or password.' };
  };

  const logout = async () => {
    await storage.clearSession();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
