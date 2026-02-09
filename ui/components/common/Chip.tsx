
import React from 'react';

interface ChipProps {
  label: string;
  color?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  icon?: React.ReactNode;
  variant?: 'filled' | 'outlined';
  size?: 'xs' | 'sm';
}

export const Chip: React.FC<ChipProps> = ({ 
  label, 
  color = 'default', 
  icon, 
  variant = 'filled',
  size = 'sm'
}) => {
  const colors = {
    default: 'bg-slate-100 text-slate-600 border-slate-200',
    primary: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    error: 'bg-rose-50 text-rose-700 border-rose-100',
    info: 'bg-sky-50 text-sky-700 border-sky-100',
  };

  const outlinedColors = {
    default: 'border-slate-200 text-slate-500',
    primary: 'border-indigo-200 text-indigo-600',
    success: 'border-emerald-200 text-emerald-600',
    warning: 'border-amber-200 text-amber-600',
    error: 'border-rose-200 text-rose-600',
    info: 'border-sky-200 text-sky-600',
  };

  const styles = variant === 'filled' ? colors[color] : `bg-white border ${outlinedColors[color]}`;
  const padding = size === 'xs' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-1 text-[10px]';

  return (
    <span className={`inline-flex items-center gap-1 font-bold uppercase tracking-tight rounded-lg ${styles} ${padding}`}>
      {icon && <span className="opacity-70">{icon}</span>}
      {label}
    </span>
  );
};
