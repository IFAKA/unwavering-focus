import React from 'react';
import AppleWatchIcon from './AppleWatchIcon';

interface AppleWatchStatusBarProps {
  type: 'searching' | 'completed' | 'error' | 'warning';
  message: string;
  subtitle?: string;
  onClose?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
}

const AppleWatchStatusBar: React.FC<AppleWatchStatusBarProps> = ({
  type,
  message,
  subtitle,
  onClose,
  autoHide = true,
  autoHideDelay = 2000
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, onClose]);

  const typeClasses = {
    searching: 'bg-accent-primary text-bg-primary',
    completed: 'bg-success-color text-bg-primary',
    error: 'bg-danger-color text-bg-primary',
    warning: 'bg-warning-color text-bg-primary'
  };

  const icons = {
    searching: 'search',
    completed: 'check',
    error: 'error',
    warning: 'warning'
  };

  if (!isVisible) return null;

  return (
    <div className={`absolute top-0 left-0 right-0 z-[1000] border-b border-bg-tertiary animate-[slideDown_0.3s_ease-out] ${typeClasses[type]}`}>
      <div className="flex items-center gap-md p-md">
        <div className="text-base font-bold">
          <AppleWatchIcon name={icons[type]} size="md" />
        </div>
        <div className="text-lg font-semibold flex-1">{message}</div>
        {subtitle && (
          <div className="text-sm opacity-90 max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
            &ldquo;{subtitle.length > 20 ? subtitle.substring(0, 20) + '...' : subtitle}&rdquo;
          </div>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="text-current opacity-70 hover:opacity-100 transition-opacity"
          >
            <AppleWatchIcon name="close" size="sm" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AppleWatchStatusBar; 