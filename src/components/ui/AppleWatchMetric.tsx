import React from 'react';
import AppleWatchIcon from './AppleWatchIcon';

interface AppleWatchMetricProps {
  icon: string;
  value: string | number;
  label?: string;
  status?: 'enabled' | 'disabled' | 'warning';
  onClick?: () => void;
  className?: string;
}

const AppleWatchMetric: React.FC<AppleWatchMetricProps> = ({
  icon,
  value,
  label,
  status = 'enabled',
  onClick,
  className = ''
}) => {
  const baseClasses = 'flex flex-col items-center text-center p-sm bg-bg-tertiary rounded-apple justify-center min-h-[50px] transition-all duration-150 relative';
  const interactiveClasses = onClick ? 'cursor-pointer hover:bg-bg-secondary hover:scale-[1.02] hover:shadow-[0_1px_4px_rgba(0,0,0,0.2)] active:scale-[0.98]' : '';
  const statusClasses = status === 'disabled' ? 'opacity-40' : '';

  return (
    <div
      className={`${baseClasses} ${interactiveClasses} ${statusClasses} ${className}`}
      onClick={onClick}
      title={label}
    >
      <div className="text-sm mb-xs opacity-90">
        <AppleWatchIcon name={icon} size="sm" />
      </div>
      <div className="text-sm font-semibold text-text-primary mb-xs">{value}</div>
      {status === 'disabled' && (
        <div className="absolute top-[1px] right-[1px] bg-danger-color text-white text-[7px] font-semibold px-[3px] py-[1px] rounded-[3px] uppercase tracking-[0.3px]">
          OFF
        </div>
      )}
      {status === 'warning' && (
        <div className="absolute top-[1px] right-[1px] bg-warning-color text-white text-[7px] font-semibold px-[3px] py-[1px] rounded-[3px] uppercase tracking-[0.3px]">
          !
        </div>
      )}
    </div>
  );
};

export default AppleWatchMetric; 