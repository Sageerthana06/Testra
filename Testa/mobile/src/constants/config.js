// src/constants/config.js
export const API_BASE_URL = 'http://192.168.1.100:5000/api'; // Change to your backend IP

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  BRANCH_MANAGER: 'branch_manager',
  MARKETING: 'marketing',
};

export const ROLE_LABELS = {
  super_admin: '👑 Super Admin',
  admin: '👨‍💼 Operational Admin',
  branch_manager: '🏢 Branch Manager',
  marketing: '📣 Marketing Staff',
};

export const THEME_COLORS = {
  red: {
    primary: '#DC2626',
    primaryLight: '#FCA5A5',
    primaryDark: '#991B1B',
    gradient: ['#991B1B', '#DC2626', '#FCA5A5'],
    name: 'Red',
  },
  yellow: {
    primary: '#EAB308',
    primaryLight: '#FEF08A',
    primaryDark: '#A16207',
    gradient: ['#A16207', '#EAB308', '#FEF08A'],
    name: 'Yellow',
  },
  lightgreen: {
    primary: '#34D399',
    primaryLight: '#A7F3D0',
    primaryDark: '#047857',
    gradient: ['#047857', '#34D399', '#A7F3D0'],
    name: 'Light Green',
  },
};

export const ROLE_THEMES = {
  super_admin: 'red',
  admin: 'yellow',
  branch_manager: 'lightgreen',
  marketing: 'lightgreen',
};
