import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StorageAdapter } from '@budget-tracker/shared/storage';

/**
 * React Native용 Storage Adapter
 * AsyncStorage를 사용하여 플랫폼 독립적인 StorageAdapter 인터페이스 구현
 */
export const mobileStorage: StorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    return await AsyncStorage.getItem(key);
  },

  setItem: async (key: string, value: string): Promise<void> => {
    await AsyncStorage.setItem(key, value);
  },

  removeItem: async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(key);
  },

  clear: async (): Promise<void> => {
    await AsyncStorage.clear();
  },

  getAllKeys: async (): Promise<readonly string[]> => {
    return await AsyncStorage.getAllKeys();
  },
};
