/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/lib/axios';

export const AuthService = {
  // Login
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Register
  register: async (data: any) => {
    return await api.post('/auth/register', data);
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Get Current User
  getCurrentUser: () => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    return userStr ? JSON.parse(userStr) : null;
  }
};