import React from 'react';

interface AppleWatchCardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'small' | 'medium' | 'large';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

const AppleWatchCard: React.FC<AppleWatchCardProps> = ({
  variant = 'default',
  padding = 'medium',
  children,
  className = '',
  onClick,
  interactive = false
}) => {
  const baseClasses = 'rounded-apple transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-bg-secondary border border-bg-tertiary',
    elevated: 'bg-bg-secondary border border-bg-tertiary shadow-[0_2px_8px_rgba(0,0,0,0.3)]',
    outlined: 'bg-transparent border border-bg-tertiary',
    glass: 'bg-glass-bg border border-glass-border backdrop-blur-sm'
  };

  const paddingClasses = {
    none: '',
    small: 'p-sm',
    medium: 'p-md',
    large: 'p-lg'
  };

  const interactiveClasses = interactive ? 'cursor-pointer hover:bg-bg-tertiary hover:-translate-y-[1px] hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)] active:translate-y-0' : '';

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${interactiveClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default AppleWatchCard; 