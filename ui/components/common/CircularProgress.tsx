
import React from 'react';

interface CircularProgressProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white';
}

export const CircularProgress: React.FC<CircularProgressProps> = ({ 
  size = 'md', 
  color = 'primary' 
}) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const colors = {
    primary: 'border-indigo-600 border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  return (
    <div className={`rounded-full animate-spin ${sizes[size]} ${colors[color]}`} />
  );
};
