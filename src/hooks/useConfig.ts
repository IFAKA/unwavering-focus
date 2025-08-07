import { useState, useEffect, useCallback } from 'react';
import { ExtensionConfig } from '../types';
import { configService } from '../services/ConfigService';

export const useConfig = () => {
  const [config, setConfig] = useState<ExtensionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const configData = await configService.getConfig();
      setConfig(configData);
    } catch (err) {
      setError('Failed to load configuration');
      console.error('Error loading config:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = useCallback(async (path: string, value: any) => {
    try {
      await configService.updateConfig(path, value);
      await loadConfig(); // Reload config after update
    } catch (err) {
      setError('Failed to update configuration');
      console.error('Error updating config:', err);
    }
  }, [loadConfig]);

  const getFeatureStatus = useCallback(async (feature: string) => {
    try {
      return await configService.getFeatureStatus(feature);
    } catch (err) {
      console.error('Error getting feature status:', err);
      return 'disabled' as const;
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    loading,
    error,
    loadConfig,
    updateConfig,
    getFeatureStatus
  };
}; 