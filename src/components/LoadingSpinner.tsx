import React from 'react';
import './LoadingSpinner.scss';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  message = 'Loading...' 
}) => {
  return (
    <div className={`loading-spinner ${size}`}>
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
      {message && (
        <div className="loading-message">{message}</div>
      )}
    </div>
  );
};

export default LoadingSpinner; 