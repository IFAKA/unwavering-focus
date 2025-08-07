import React from 'react';
import AppleWatchMetric from '../ui/AppleWatchMetric';

interface MetricsRowProps {
  eyeCareCountdown: string;
  tabCount: number;
  maxTabs: number;
  savedSearchesCount: number;
  eyeCareStatus: 'enabled' | 'disabled';
  tabLimiterStatus: 'enabled' | 'disabled';
  onEyeCareClick?: () => void;
  onTabLimiterClick?: () => void;
  onSavedItemsClick?: () => void;
  onSettingsClick?: () => void;
}

const MetricsRow: React.FC<MetricsRowProps> = ({
  eyeCareCountdown,
  tabCount,
  maxTabs,
  savedSearchesCount,
  eyeCareStatus,
  tabLimiterStatus,
  onEyeCareClick,
  onTabLimiterClick,
  onSavedItemsClick,
  onSettingsClick
}) => {
  return (
    <div className="p-md bg-bg-secondary border-b border-bg-tertiary">
      <div className="grid grid-cols-4 gap-sm">
        <AppleWatchMetric
          icon="eye"
          value={eyeCareCountdown}
          label="Eye Care Timer"
          status={eyeCareStatus}
          onClick={onEyeCareClick}
        />
        
        <AppleWatchMetric
          icon="tabs"
          value={`${tabCount}/${maxTabs}`}
          label="Tab Count"
          status={tabLimiterStatus}
          onClick={onTabLimiterClick}
        />
        
        <AppleWatchMetric
          icon="saved"
          value={savedSearchesCount}
          label="Saved Items"
          onClick={onSavedItemsClick}
        />
        
        <AppleWatchMetric
          icon="settings"
          value="All"
          label="Settings"
          onClick={onSettingsClick}
        />
      </div>
    </div>
  );
};

export default MetricsRow; 