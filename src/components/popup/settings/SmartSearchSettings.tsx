import React from 'react';
import { useConfig } from '../../../hooks/useConfig';
import SettingsHeader from '../../ui/SettingsHeader';
import ToggleSwitch from '../../ui/ToggleSwitch';

interface SmartSearchSettingsProps {
  onNavigateBack: () => void;
}

const SmartSearchSettings: React.FC<SmartSearchSettingsProps> = ({ onNavigateBack }) => {
  const { config, updateConfig } = useConfig();

  const handleToggleSaveThoughts = (enabled: boolean) => {
    updateConfig('smartSearch.enabled', enabled);
  };

  const handleToggleSearchAll = (enabled: boolean) => {
    updateConfig('smartSearch.searchAllEnabled', enabled);
  };

  return (
    <div className="flex-1 overflow-y-auto p-md">
      <SettingsHeader
        title="Smart Search"
        onNavigateBack={onNavigateBack}
      />
      
      <div className="flex flex-col gap-md">
        <div className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
          <div className="flex items-center justify-between mb-sm">
            <div>
              <div className="text-md font-semibold text-text-primary">Save Thoughts</div>
              <div className="text-xs text-text-secondary">Automatically save your search queries</div>
            </div>
            <ToggleSwitch
              checked={config?.smartSearch?.enabled || false}
              onChange={handleToggleSaveThoughts}
            />
          </div>
        </div>

        <div className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
          <div className="flex items-center justify-between mb-sm">
            <div>
              <div className="text-md font-semibold text-text-primary">Search All Feature</div>
              <div className="text-xs text-text-secondary">Enable bulk search functionality</div>
            </div>
            <ToggleSwitch
              checked={config?.smartSearch?.searchAllEnabled || false}
              onChange={handleToggleSearchAll}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartSearchSettings; 