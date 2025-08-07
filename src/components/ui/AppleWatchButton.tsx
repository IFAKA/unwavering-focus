import React from 'react';

interface AppleWatchButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
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
  const baseClasses = 'ds-button';
  
  const variantClasses = {
    primary: 'ds-button-primary',
    secondary: 'ds-button-secondary',
    success: 'ds-button-success',
    danger: 'ds-button-danger'
  };

  const sizeClasses = {
    small: 'ds-button-small',
    medium: 'ds-button-medium',
    large: 'ds-button-large'
  };

  const disabledClasses = disabled ? 'ds-button-disabled' : '';
  const loadingClasses = loading ? 'ds-button-loading' : '';

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${loadingClasses} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
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