import React from 'react';
import '../styles.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  message = 'Loading...' 
}) => {
  const sizeClasses = {
    small: 'w-5 h-5 text-xs mt-sm',
    medium: 'w-8 h-8 text-sm mt-md',
    large: 'w-12 h-12 text-base mt-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-xl text-text-primary font-apple ${sizeClasses[size]}`}>
      <div className={`relative flex items-center justify-center ${size === 'small' ? 'w-5 h-5' : size === 'medium' ? 'w-8 h-8' : 'w-12 h-12'}`}>
        <div className={`w-full h-full border-2 border-bg-tertiary border-t-accent-primary rounded-full animate-spin ${size === 'small' ? 'w-5 h-5' : size === 'medium' ? 'w-8 h-8' : 'w-12 h-12'}`}></div>
      </div>
      {message && (
        <div className="text-text-secondary font-medium text-center">{message}</div>
      )}
    </div>
  );
};

export default LoadingSpinner; 