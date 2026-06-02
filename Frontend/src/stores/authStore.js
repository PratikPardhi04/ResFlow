import { create } from 'zustand';
import { authAPI } from '../lib/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Hydrate from localStorage on app load
  hydrate: async () => {
    const token = localStorage.getItem('resflow_token');
    const userStr = localStorage.getItem('resflow_user');

    if (!token || !userStr) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const user = JSON.parse(userStr);
      set({ token, user, isAuthenticated: true, isLoading: false });

      // Validate token by calling /me
      const res = await authAPI.getMe();
      set({ user: res.data.user });
    } catch (_err) {
      // Token expired or invalid
      localStorage.removeItem('resflow_token');
      localStorage.removeItem('resflow_user');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authAPI.login({ email, password });
      const { user, token } = res.data;

      localStorage.setItem('resflow_token', token);
      localStorage.setItem('resflow_user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false, error: null });
      return true;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return false;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authAPI.register({ name, email, password });
      const { user, token } = res.data;

      localStorage.setItem('resflow_token', token);
      localStorage.setItem('resflow_user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false, error: null });
      return true;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('resflow_token');
    localStorage.removeItem('resflow_user');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
