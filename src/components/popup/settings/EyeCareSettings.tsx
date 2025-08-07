import React from 'react';
import { useConfig } from '../../../hooks/useConfig';
import SettingsHeader from '../../ui/SettingsHeader';
import ToggleSwitch from '../../ui/ToggleSwitch';
import RangeSlider from '../../ui/RangeSlider';

interface EyeCareSettingsProps {
  onNavigateBack: () => void;
}

const EyeCareSettings: React.FC<EyeCareSettingsProps> = ({ onNavigateBack }) => {
  const { config, updateConfig } = useConfig();

  const handleToggleEyeCare = (enabled: boolean) => {
    updateConfig('eyeCare.enabled', enabled);
  };

  const handleVolumeChange = (value: number) => {
    updateConfig('eyeCare.soundVolume', value / 100);
  };

  return (
    <div className="flex-1 overflow-y-auto p-md">
      <SettingsHeader
        title="Eye Care"
        onNavigateBack={onNavigateBack}
      />
      
      <div className="flex flex-col gap-md">
        <div className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
          <div className="flex items-center justify-between mb-sm">
            <div>
              <div className="text-md font-semibold text-text-primary">20-20-20 Reminder</div>
              <div className="text-xs text-text-secondary">Take breaks every 20 minutes</div>
            </div>
            <ToggleSwitch
              checked={config?.eyeCare?.enabled || false}
              onChange={handleToggleEyeCare}
            />
          </div>
        </div>

        {config?.eyeCare?.enabled && (
          <div className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
            <div className="mb-sm">
              <div className="text-md font-semibold text-text-primary">Sound Volume</div>
              <div className="text-xs text-text-secondary">Adjust reminder sound volume</div>
            </div>
            <div className="flex items-center gap-md">
              <RangeSlider
                min={0}
                max={100}
                value={Math.round((config?.eyeCare?.soundVolume || 0.5) * 100)}
                onChange={handleVolumeChange}
                className="flex-1"
              />
              <span className="text-lg font-semibold text-accent-primary min-w-[3rem] text-center">
                {Math.round((config?.eyeCare?.soundVolume || 0.5) * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EyeCareSettings; 