import { StorageData, StorageKey } from '../types';

class StorageService {
  private static instance: StorageService;

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async get<K extends StorageKey>(key: K): Promise<StorageData[K] | undefined> {
    try {
      const result = await chrome.storage.local.get(key);
      return result[key];
    } catch (error) {
      console.error(`Error getting storage key ${key}:`, error);
      return undefined;
    }
  }

  async set<K extends StorageKey>(key: K, value: StorageData[K]): Promise<void> {
    try {
      await chrome.storage.local.set({ [key]: value });
    } catch (error) {
      console.error(`Error setting storage key ${key}:`, error);
      throw error;
    }
  }

  async getMultiple<K extends StorageKey[]>(keys: K): Promise<Partial<StorageData>> {
    try {
      return await chrome.storage.local.get(keys);
    } catch (error) {
      console.error('Error getting multiple storage keys:', error);
      return {};
    }
  }

  async setMultiple(data: Partial<StorageData>): Promise<void> {
    try {
      await chrome.storage.local.set(data);
    } catch (error) {
      console.error('Error setting multiple storage keys:', error);
      throw error;
    }
  }

  async remove<K extends StorageKey>(key: K): Promise<void> {
    try {
      await chrome.storage.local.remove(key);
    } catch (error) {
      console.error(`Error removing storage key ${key}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await chrome.storage.local.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  async getAll(): Promise<StorageData> {
    try {
      return await chrome.storage.local.get() as StorageData;
    } catch (error) {
      console.error('Error getting all storage data:', error);
      return {} as StorageData;
    }
  }
}

export default StorageService; 