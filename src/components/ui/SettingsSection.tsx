import React from 'react';
import AppleWatchIcon from './AppleWatchIcon';

interface SettingsSectionProps {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  onClick: () => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ id, title, subtitle, icon, onClick }) => {
  return (
    <div 
      id={`settings-${id}`}
      className="group flex items-center gap-md p-md bg-bg-secondary rounded-apple border border-bg-tertiary cursor-pointer transition-all duration-200 hover:bg-bg-tertiary hover:-translate-y-[1px] hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)] active:translate-y-0" 
      onClick={onClick}
    >
      <div className="text-xl w-10 h-10 flex items-center justify-center bg-bg-tertiary rounded-apple flex-shrink-0">
        <AppleWatchIcon name={icon} size="md" />
      </div>
      <div className="flex-1 flex flex-col gap-xs">
        <div className="text-md font-semibold text-text-primary">{title}</div>
        <div className="text-xs text-text-secondary">{subtitle}</div>
      </div>
      <div className="text-lg text-text-secondary font-light transition-all duration-200 group-hover:text-accent-primary group-hover:translate-x-[2px]">
        <AppleWatchIcon name="chevronRight" size="sm" />
      </div>
    </div>
  );
};

export default SettingsSection; 