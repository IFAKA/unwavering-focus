import React from 'react';

interface AppleWatchCardProps {
  variant?: 'default' | 'interactive';
  padding?: 'none' | 'small' | 'medium' | 'large';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const AppleWatchCard: React.FC<AppleWatchCardProps> = ({
  variant = 'default',
  padding = 'medium',
  children,
  className = '',
  onClick
}) => {
  const baseClasses = 'rounded-md transition-all duration-normal';
  
  const variantClasses = {
    default: 'ds-card',
    interactive: 'ds-card-interactive'
  };

  const paddingClasses = {
    none: '',
    small: 'p-sm',
    medium: 'p-md',
    large: 'p-lg'
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default AppleWatchCard; 