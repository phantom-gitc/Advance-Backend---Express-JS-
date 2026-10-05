import { create } from 'zustand';
import { authApi } from '../api/authApi';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('atelier_user') || 'null'),
  accessToken: localStorage.getItem('atelier_access_token') || null,
  isAuthenticated: !!localStorage.getItem('atelier_access_token'),
  isLoading: true,
  error: null,

  initAuth: async () => {
    const token = localStorage.getItem('atelier_access_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }

    try {
      set({ isLoading: true });
      const res = await authApi.getMe();
      if (res?.data?.user) {
        localStorage.setItem('atelier_user', JSON.stringify(res.data.user));
        set({
          user: res.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      }
    } catch (err) {
      console.warn('Auth validation failed:', err?.response?.data?.message || err.message);
      // Attempt token refresh via axios interceptor or clear on error
      if (!localStorage.getItem('atelier_access_token')) {
        set({ user: null, isAuthenticated: false, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.login(credentials);
      const user = data?.data?.user;
      const accessToken = data?.data?.accessToken;
      const refreshToken = data?.data?.refreshToken;

      if (accessToken) {
        localStorage.setItem('atelier_access_token', accessToken);
      }
      if (refreshToken) {
        localStorage.setItem('atelier_refresh_token', refreshToken);
      }
      if (user) {
        localStorage.setItem('atelier_user', JSON.stringify(user));
      }

      set({
        user,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, user };
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.[0]?.message ||
        'Login failed';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.register(userData);
      const user = data?.data?.user;
      const accessToken = data?.data?.accessToken;

      if (accessToken) {
        localStorage.setItem('atelier_access_token', accessToken);
      }
      if (user) {
        localStorage.setItem('atelier_user', JSON.stringify(user));
      }

      set({
        user,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, user };
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.[0]?.message ||
        'Registration failed';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  logout: () => {
    localStorage.removeItem('atelier_access_token');
    localStorage.removeItem('atelier_refresh_token');
    localStorage.removeItem('atelier_user');
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      error: null,
    });
  },
}));
