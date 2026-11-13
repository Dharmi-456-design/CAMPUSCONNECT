import { create } from 'zustand';
import { saveStorageItem, removeStorageItem, getStorageItem } from '../utils/secureStorage';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (user, token) => {
    await saveStorageItem('userToken', token);
    await saveStorageItem('userData', JSON.stringify(user));
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  loadStoredAuth: async () => {
    try {
      const token = await getStorageItem('userToken');
      const userRaw = await getStorageItem('userData');
      if (token && userRaw) {
        const user = JSON.parse(userRaw);
        set({ user, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await removeStorageItem('userToken');
    await removeStorageItem('userData');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  }
}));
