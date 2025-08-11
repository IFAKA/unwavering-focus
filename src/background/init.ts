import StorageService from '../services/storage';
import { DEFAULT_CONFIG } from '../types';

const storage = StorageService.getInstance();

// Initialize storage with default values
export async function initializeStorage(): Promise<void> {
  try {
    const existingData = await storage.getAll();

    // Always ensure we have the complete data structure
    const completeData = {
      savedSearches: existingData.savedSearches || [],
      distractingDomains: existingData.distractingDomains || [],
      config: existingData.config || defaultConfig,
      tabCount: existingData.tabCount || 0,
    };

    // If no config exists, initialize with defaults
    if (!existingData.config) {
      await storage.setMultiple(completeData);
    } else {
      // Ensure default values are set even if config exists
      const updatedConfig = {
        ...defaultConfig,
        ...existingData.config,
        // Force these specific defaults
        distractionBlocker: {
          enabled: true,
          domains: existingData.config.distractionBlocker?.domains || [],
        },
        eyeCare: {
          enabled: true,
          soundVolume: existingData.config.eyeCare?.soundVolume || 0.5,
        },
        tabLimiter: {
          enabled: true,
          maxTabs: 3,
          excludedDomains:
            existingData.config.tabLimiter?.excludedDomains || [],
        },
      };
      completeData.config = updatedConfig;
      await storage.set('config', updatedConfig);
    }

    // Always update tab count on initialization
    await updateTabCount();
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}

// Use centralized default configuration
const defaultConfig = DEFAULT_CONFIG;

async function updateTabCount(): Promise<void> {
  try {
    const tabs = await chrome.tabs.query({});
    const validTabs = tabs.filter(
      tab =>
        tab.url &&
        !tab.url.startsWith('chrome://') &&
        !tab.url.startsWith('chrome-extension://')
    );

    await storage.set('tabCount', validTabs.length);
  } catch (error) {
    console.error('Error updating tab count:', error);
  }
}

export function registerLifecycleHandlers(): void {
  chrome.runtime.onInstalled.addListener(async () => {
    await initializeStorage();
    await updateTabCount();
  });
  chrome.runtime.onStartup.addListener(async () => {
    await initializeStorage();
    await updateTabCount();
  });
}
