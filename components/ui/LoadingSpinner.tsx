import React from 'react';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 24, 
  color = 'border-iconBlue' 
}) => {
  return (
    <div 
      className={`animate-spin rounded-full border-t-2 border-b-2 ${color}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px` 
      }}
    />
  );
};

export default LoadingSpinner;