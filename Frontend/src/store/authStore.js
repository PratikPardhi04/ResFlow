import { create } from 'zustand';
import { getMe } from '../lib/api';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('ag_auth_token') || null,
  isLoading: false,

  setToken: (token) => {
    localStorage.setItem('ag_auth_token', token);
    set({ token });
  },

  logout: () => {
    localStorage.removeItem('ag_auth_token');
    set({ user: null, token: null });
  },

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const user = await getMe();
      set({ user, isLoading: false });
    } catch (error) {
      set({ user: null, token: null, isLoading: false });
      localStorage.removeItem('ag_auth_token');
    }
  }
}));
