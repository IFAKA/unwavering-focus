import React from 'react';

interface AppleWatchButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const AppleWatchButton: React.FC<AppleWatchButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  children,
  onClick,
  className = '',
  type = 'button'
}) => {
  const baseClasses = 'border-none rounded-apple font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-sm text-decoration-none';
  
  const variantClasses = {
    primary: 'bg-accent-primary text-white hover:bg-[#0056cc] hover:-translate-y-[1px] active:scale-[0.98]',
    secondary: 'bg-bg-tertiary text-text-primary hover:bg-bg-secondary hover:-translate-y-[1px] active:scale-[0.98]',
    success: 'bg-success-color text-white hover:bg-[#059669] hover:-translate-y-[1px] active:scale-[0.98]',
    danger: 'bg-danger-color text-white hover:bg-[#d70015] hover:-translate-y-[1px] active:scale-[0.98]',
    warning: 'bg-warning-color text-white hover:bg-[#e6850e] hover:-translate-y-[1px] active:scale-[0.98]'
  };

  const sizeClasses = {
    small: 'px-sm py-xs text-xs',
    medium: 'px-lg py-md text-sm',
    large: 'px-xl py-lg text-md'
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed hover:transform-none' : '';
  const loadingClasses = loading ? 'opacity-75 cursor-wait' : '';

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${loadingClasses} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!loading && icon && icon}
      <span>{children}</span>
    </button>
  );
};

export default AppleWatchButton; 