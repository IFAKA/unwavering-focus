import React from 'react';
import AppleWatchIcon from './AppleWatchIcon';

interface SettingsHeaderProps {
  title: string;
  onNavigateBack: () => void;
}

const SettingsHeader: React.FC<SettingsHeaderProps> = ({ title, onNavigateBack }) => {
  return (
    <div className="ds-flex-start gap-sm mb-md pb-sm ds-border-bottom">
      <button 
        className="ds-button ds-button-secondary rounded-full" 
        onClick={onNavigateBack}
      >
        <AppleWatchIcon name="arrowLeft" size="sm" />
      </button>
      <h3 className="m-0 text-lg font-semibold ds-text-primary">{title}</h3>
    </div>
  );
};

export default SettingsHeader; 