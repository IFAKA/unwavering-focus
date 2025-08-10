import React from 'react';
import AppleWatchMetric from '../ui/AppleWatchMetric';

interface MetricsRowProps {
  eyeCareCountdown: string;
  tabCount: number;
  maxTabs: number;
  eyeCareStatus: 'enabled' | 'disabled';
  tabLimiterStatus: 'enabled' | 'disabled';
  onEyeCareClick?: () => void;
  onTabLimiterClick?: () => void;
  onFocusModeClick?: () => void;
  onSettingsClick?: () => void;
}

const MetricsRow: React.FC<MetricsRowProps> = ({
  eyeCareCountdown,
  tabCount,
  maxTabs,
  eyeCareStatus,
  tabLimiterStatus,
  onEyeCareClick,
  onTabLimiterClick,
  onFocusModeClick,
  onSettingsClick
}) => {
  return (
    <div className="p-md ds-border-bottom">
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
          icon="focus"
          value="Focus"
          label="Focus Mode"
          onClick={onFocusModeClick}
        />
        
        <AppleWatchMetric
          icon="settings"
          value="Settings"
          label="Settings"
          onClick={onSettingsClick}
        />
      </div>
    </div>
  );
};

export default MetricsRow; 