
import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  variant = 'text', 
  width, 
  height, 
  className = '' 
}) => {
  const baseClass = "bg-slate-200 animate-pulse";
  const variantClasses = {
    text: "rounded h-4 mb-2",
    circular: "rounded-full",
    rectangular: "rounded-xl",
  };

  return (
    <div 
      className={`${baseClass} ${variantClasses[variant]} ${className}`} 
      style={{ width: width || '100%', height: height || (variant === 'circular' ? width : undefined) }}
    />
  );
};
