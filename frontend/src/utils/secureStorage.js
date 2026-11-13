import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const saveStorageItem = async (key, value) => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

export const getStorageItem = async (key) => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  } catch (error) {
    console.error(`Error getting ${key} from storage:`, error);
    return null;
  }
};

export const removeStorageItem = async (key) => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.error(`Error removing ${key} from storage:`, error);
  }
};
