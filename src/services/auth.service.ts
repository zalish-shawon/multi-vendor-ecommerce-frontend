/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/lib/axios';

export const AuthService = {
  // --- 1. API CALLS (Keep your existing logic) ---
  
  // Login API
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      AuthService.setToken(response.data.token);
      AuthService.setUser(response.data.user);
    }
    return response.data;
  },

  // Register API
  register: async (data: any) => {
    return await api.post('/auth/register', data);
  },

  // --- 2. HELPER METHODS (These were missing!) ---

  // Save Token
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },

  // Get Token
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  // Save User
  setUser: (user: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  // Get Current User
  getCurrentUser: () => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    return userStr ? JSON.parse(userStr) : null;
  },

  // Update User (Fixes the Profile Update issue too)
  updateCurrentUser: (updates: any) => {
    if (typeof window === 'undefined') return;
    const current = AuthService.getCurrentUser() || {};
    const updatedUser = { ...current, ...updates };
    AuthService.setUser(updatedUser);
    return updatedUser;
  },

  // Logout
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }
};