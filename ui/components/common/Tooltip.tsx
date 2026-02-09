
import React from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-[300] whitespace-nowrap bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl animate-in fade-in zoom-in duration-100 ${positions[position]}`}>
          {text}
          <div className={`absolute w-2 h-2 bg-slate-900 rotate-45 ${
            position === 'top' ? 'top-full -mt-1 left-1/2 -translate-x-1/2' :
            position === 'bottom' ? 'bottom-full -mb-1 left-1/2 -translate-x-1/2' :
            ''
          }`} />
        </div>
      )}
    </div>
  );
};
