import React from 'react';
import { useConfig } from '../../../hooks/useConfig';
import SettingsHeader from '../../ui/SettingsHeader';
import ToggleSwitch from '../../ui/ToggleSwitch';
import RangeSlider from '../../ui/RangeSlider';

interface TabLimiterSettingsProps {
  onNavigateBack: () => void;
}

const TabLimiterSettings: React.FC<TabLimiterSettingsProps> = ({ onNavigateBack }) => {
  const { config, updateConfig } = useConfig();

  const handleToggleTabLimiter = (enabled: boolean) => {
    updateConfig('tabLimiter.enabled', enabled);
  };

  const handleMaxTabsChange = (value: number) => {
    updateConfig('tabLimiter.maxTabs', value);
  };

  return (
    <div className="flex-1 overflow-y-auto p-md">
      <SettingsHeader
        title="Tab Limiter"
        onNavigateBack={onNavigateBack}
      />
      
      <div className="flex flex-col gap-md">
        <div className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
          <div className="flex items-center justify-between mb-sm">
            <div>
              <div className="text-md font-semibold text-text-primary">Enable Tab Limiter</div>
              <div className="text-xs text-text-secondary">Limit the number of open tabs</div>
            </div>
            <ToggleSwitch
              checked={config?.tabLimiter?.enabled || false}
              onChange={handleToggleTabLimiter}
            />
          </div>
        </div>

        {config?.tabLimiter?.enabled && (
          <div className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
            <div className="mb-sm">
              <div className="text-md font-semibold text-text-primary">Maximum Tabs</div>
              <div className="text-xs text-text-secondary">Limit the number of open tabs</div>
            </div>
            <div className="flex items-center gap-md">
              <RangeSlider
                min={1}
                max={10}
                value={config?.tabLimiter?.maxTabs || 3}
                onChange={handleMaxTabsChange}
                className="flex-1"
              />
              <span className="text-lg font-semibold text-accent-primary min-w-[2rem] text-center">
                {config?.tabLimiter?.maxTabs || 3}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabLimiterSettings; 