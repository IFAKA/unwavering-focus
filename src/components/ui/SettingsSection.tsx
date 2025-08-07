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
      className="ds-card ds-card-interactive ds-flex-start gap-md" 
      onClick={onClick}
    >
      <div className="text-xl w-10 h-10 ds-flex-center bg-bg-tertiary rounded-apple flex-shrink-0">
        <AppleWatchIcon name={icon} size="md" />
      </div>
      <div className="flex-1 flex flex-col gap-xs">
        <div className="text-md font-semibold ds-text-primary">{title}</div>
        <div className="text-xs ds-text-secondary">{subtitle}</div>
      </div>
      <div className="text-lg ds-text-secondary font-light transition-all duration-normal group-hover:text-accent-primary group-hover:translate-x-[2px]">
        <AppleWatchIcon name="chevronRight" size="sm" />
      </div>
    </div>
  );
};

export default SettingsSection; 