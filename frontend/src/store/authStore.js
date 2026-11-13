import { create } from 'zustand';
import { saveStorageItem, removeStorageItem, getStorageItem } from '../utils/secureStorage';
import { getMeApi } from '../api/auth.api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  authError: null,

  setAuth: async (user, token) => {
    try {
      await saveStorageItem('userToken', token);
      await saveStorageItem('userData', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false, authError: null });
    } catch (err) {
      console.error('Error saving auth to storage:', err);
      set({ user, token, isAuthenticated: true, isLoading: false, authError: null });
    }
  },

  updateUser: async (updatedFields) => {
    const currentUser = get().user || {};
    const updatedUser = { ...currentUser, ...updatedFields };
    try {
      await saveStorageItem('userData', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } catch (err) {
      set({ user: updatedUser });
    }
  },

  loadStoredAuth: async () => {
    try {
      const token = await getStorageItem('userToken');
      const userRaw = await getStorageItem('userData');

      if (token && userRaw) {
        const user = JSON.parse(userRaw);
        set({ user, token, isAuthenticated: true, isLoading: false });

        // Refresh profile in background if network allows
        try {
          const res = await getMeApi();
          if (res?.data?.user) {
            await saveStorageItem('userData', JSON.stringify(res.data.user));
            set({ user: res.data.user });
          }
        } catch (refreshErr) {
          // Keep cached user data if offline
        }
      } else {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } catch (err) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await removeStorageItem('userToken');
      await removeStorageItem('userData');
    } catch (err) {
      console.error('Error clearing auth storage:', err);
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false, authError: null });
  }
}));
