import { ExtensionConfig, DEFAULT_CONFIG } from '../types';

export interface IConfigService {
  getConfig(): Promise<ExtensionConfig>;
  updateConfig(path: string, value: any): Promise<void>;
  saveConfig(config: ExtensionConfig): Promise<void>;
  getFeatureStatus(feature: string): Promise<'enabled' | 'disabled'>;
}

export class ConfigService implements IConfigService {
  async getConfig(): Promise<ExtensionConfig> {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_STORAGE_DATA' });
      return response.config || DEFAULT_CONFIG;
    } catch (error) {
      console.error('Error getting config:', error);
      return DEFAULT_CONFIG;
    }
  }

  async updateConfig(path: string, value: any): Promise<void> {
    try {
      const config = await this.getConfig();
      const newConfig = { ...config } as any;
      const pathParts = path.split('.');
      let current = newConfig;
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) {
          current[pathParts[i]] = {};
        }
        current = current[pathParts[i]];
      }
      
      current[pathParts[pathParts.length - 1]] = value;
      
      await this.saveConfig(newConfig);
    } catch (error) {
      console.error('Error updating config:', error);
      throw new Error('Failed to update config');
    }
  }

  async saveConfig(config: ExtensionConfig): Promise<void> {
    try {
      await chrome.runtime.sendMessage({
        type: 'UPDATE_CONFIG',
        config: config
      });
    } catch (error) {
      console.error('Error saving config:', error);
      throw new Error('Failed to save config');
    }
  }

  async getFeatureStatus(feature: string): Promise<'enabled' | 'disabled'> {
    try {
      const config = await this.getConfig();
      
      switch (feature) {
        case 'eyeCare':
          return config.eyeCare?.enabled ? 'enabled' : 'disabled';
        case 'tabLimiter':
          return config.tabLimiter?.enabled ? 'enabled' : 'disabled';
        case 'smartSearch':
          return config.smartSearch?.enabled ? 'enabled' : 'disabled';
        case 'habits':
          return config.focusPage?.habits?.length > 0 ? 'enabled' : 'disabled';
        case 'pillars':
          return config.focusPage?.pillars?.length > 0 ? 'enabled' : 'disabled';
        case 'blocker':
          return config.distractionBlocker?.enabled ? 'enabled' : 'disabled';
        case 'videoFocus':
          return config.videoFocus?.enabled ? 'enabled' : 'disabled';
        case 'contentFocus':
          return config.videoFocus?.enabled ? 'enabled' : 'disabled';
        default:
          return 'disabled';
      }
    } catch (error) {
      console.error('Error getting feature status:', error);
      return 'disabled';
    }
  }
}

export const configService = new ConfigService(); 