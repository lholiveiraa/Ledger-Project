
import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type SnackbarType = 'success' | 'error' | 'info' | 'warning';

interface SnackbarProps {
  message: string;
  type?: SnackbarType;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export const Snackbar: React.FC<SnackbarProps> = ({ 
  message, 
  type = 'info', 
  isOpen, 
  onClose, 
  duration = 5000 
}) => {
  React.useEffect(() => {
    if (isOpen && duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const styles = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-rose-600 text-white',
    info: 'bg-indigo-600 text-white',
    warning: 'bg-amber-500 text-white',
  };

  const icons = {
    success: <CheckCircle size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
    warning: <AlertCircle size={18} />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200] animate-in slide-in-from-right-10 fade-in duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl ${styles[type]}`}>
        {icons[type]}
        <span className="text-sm font-bold tracking-tight">{message}</span>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors ml-2">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
