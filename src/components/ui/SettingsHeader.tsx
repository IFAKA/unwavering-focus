import React from 'react';
import AppleWatchIcon from './AppleWatchIcon';

interface SettingsHeaderProps {
  title: string;
  onNavigateBack: () => void;
}

const SettingsHeader: React.FC<SettingsHeaderProps> = ({ title, onNavigateBack }) => {
  return (
    <div className="flex items-center gap-sm mb-md pb-sm border-b border-bg-tertiary">
      <button 
        className="border-none bg-bg-tertiary text-text-primary w-7 h-7 rounded-full flex items-center justify-center cursor-pointer text-sm transition-all duration-150 hover:bg-accent-primary hover:text-white" 
        onClick={onNavigateBack}
      >
        <AppleWatchIcon name="arrowLeft" size="sm" />
      </button>
      <h3 className="m-0 text-lg font-semibold text-text-primary">{title}</h3>
    </div>
  );
};

export default SettingsHeader; 