import React from 'react';
import AppleWatchIcon from '../ui/AppleWatchIcon';

interface FeatureToggleButtonsProps {
  featureStatuses: Record<string, 'enabled' | 'disabled'>;
  onFeatureToggle: (feature: string) => void;
}

const FeatureToggleButtons: React.FC<FeatureToggleButtonsProps> = ({
  featureStatuses,
  onFeatureToggle
}) => {
  return (
    <div className="p-md ds-border-top">
      <div className="ds-flex-center gap-sm">
        {/* Eye Care */}
        <button
          onClick={() => onFeatureToggle('eyeCare')}
          className={`ds-button ds-button-small rounded-full transition-all duration-200 ${
            featureStatuses.eyeCare === 'enabled' 
              ? 'bg-accent-primary text-white shadow-sm' 
              : 'bg-bg-tertiary text-text-secondary hover:bg-bg-secondary'
          }`}
          title={`Eye Care: ${featureStatuses.eyeCare} (Click to toggle)`}
        >
          <AppleWatchIcon 
            name="eye" 
            size="sm" 
            color={featureStatuses.eyeCare === 'enabled' ? '#ffffff' : '#8e8e93'} 
          />
        </button>
        
        {/* Tab Limiter */}
        <button
          onClick={() => onFeatureToggle('tabLimiter')}
          className={`ds-button ds-button-small rounded-full transition-all duration-200 ${
            featureStatuses.tabLimiter === 'enabled' 
              ? 'bg-accent-primary text-white shadow-sm' 
              : 'bg-bg-tertiary text-text-secondary hover:bg-bg-secondary'
          }`}
          title={`Tab Limiter: ${featureStatuses.tabLimiter} (Click to toggle)`}
        >
          <AppleWatchIcon 
            name="tabs" 
            size="sm" 
            color={featureStatuses.tabLimiter === 'enabled' ? '#ffffff' : '#8e8e93'} 
          />
        </button>
        
        {/* Smart Search */}
        <button
          onClick={() => onFeatureToggle('smartSearch')}
          className={`ds-button ds-button-small rounded-full transition-all duration-200 ${
            featureStatuses.smartSearch === 'enabled' 
              ? 'bg-accent-primary text-white shadow-sm' 
              : 'bg-bg-tertiary text-text-secondary hover:bg-bg-secondary'
          }`}
          title={`Smart Search: ${featureStatuses.smartSearch || 'disabled'} (Click to toggle)`}
        >
          <AppleWatchIcon 
            name="search" 
            size="sm" 
            color={featureStatuses.smartSearch === 'enabled' ? '#ffffff' : '#8e8e93'} 
          />
        </button>
        
        {/* Distraction Blocker */}
        <button
          onClick={() => onFeatureToggle('blocker')}
          className={`ds-button ds-button-small rounded-full transition-all duration-200 ${
            featureStatuses.blocker === 'enabled' 
              ? 'bg-accent-primary text-white shadow-sm' 
              : 'bg-bg-tertiary text-text-secondary hover:bg-bg-secondary'
          }`}
          title={`Distraction Blocker: ${featureStatuses.blocker || 'disabled'} (Click to toggle)`}
        >
          <AppleWatchIcon 
            name="ban" 
            size="sm" 
            color={featureStatuses.blocker === 'enabled' ? '#ffffff' : '#8e8e93'} 
          />
        </button>
        
        {/* Video Focus */}
        <button
          onClick={() => onFeatureToggle('videoFocus')}
          className={`ds-button ds-button-small rounded-full transition-all duration-200 ${
            featureStatuses.videoFocus === 'enabled' 
              ? 'bg-accent-primary text-white shadow-sm' 
              : 'bg-bg-tertiary text-text-secondary hover:bg-bg-secondary'
          }`}
          title={`Video Focus: ${featureStatuses.videoFocus || 'disabled'} (Click to toggle)`}
        >
          <AppleWatchIcon 
            name="video" 
            size="sm" 
            color={featureStatuses.videoFocus === 'enabled' ? '#ffffff' : '#8e8e93'} 
          />
        </button>
      </div>
    </div>
  );
};

export default FeatureToggleButtons;
