
import React from 'react';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: boolean;
  startIcon?: React.ReactNode;
}

export const TextField: React.FC<TextFieldProps> = ({ 
  label, 
  helperText, 
  error, 
  startIcon, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {startIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            {startIcon}
          </div>
        )}
        <input
          className={`
            w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2
            ${startIcon ? 'pl-10' : ''}
            ${error 
              ? 'border-rose-300 focus:ring-rose-500/20' 
              : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'}
            ${className}
          `}
          {...props}
        />
      </div>
      {helperText && (
        <span className={`text-[10px] px-1 ${error ? 'text-rose-500' : 'text-slate-400'}`}>
          {helperText}
        </span>
      )}
    </div>
  );
};
