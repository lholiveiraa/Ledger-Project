
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  description?: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  className?: string;
  searchable?: boolean;
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  placeholder = "Select an option", 
  options, 
  value, 
  onChange, 
  error,
  className = '',
  searchable = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  const filteredOptions = searchable 
    ? options.filter(opt => 
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
        opt.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  return (
    <div className={`flex flex-col gap-1.5 w-full relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between w-full bg-white border rounded-xl px-4 py-2.5 text-sm text-left transition-all
          ${isOpen ? 'ring-2 ring-indigo-500/20 border-indigo-500 shadow-sm' : 'border-slate-200 hover:border-slate-300'}
          ${error ? 'border-rose-500 ring-rose-500/10' : ''}
        `}
      >
        <span className={`${selectedOption ? 'text-slate-700 font-semibold' : 'text-slate-400'} truncate mr-2`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-[200] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {searchable && (
            <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
              <Search size={14} className="text-slate-400 ml-2" />
              <input 
                autoFocus
                type="text"
                className="w-full bg-transparent border-none text-xs py-2 focus:ring-0 placeholder:text-slate-300 text-slate-600 font-medium"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="p-1 hover:bg-slate-200 rounded-md text-slate-400 mr-1"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            <div className="py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`
                      w-full flex flex-col px-4 py-2.5 text-left transition-colors
                      ${value === opt.value ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}
                    `}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-[13px] leading-relaxed ${value === opt.value ? 'text-indigo-600 font-bold' : 'text-slate-600 font-medium'}`}>
                        {opt.label}
                      </span>
                      {value === opt.value && <Check size={14} className="text-indigo-600" />}
                    </div>
                    {opt.description && (
                      <span className="text-[10px] text-slate-400 font-normal leading-tight mt-0.5">{opt.description}</span>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-[11px] text-slate-400 italic">
                  No matches found
                </div>
              )}
            </div>
          </div>
          
          {selectedOption && (
            <div className="p-1.5 border-t border-slate-50 bg-slate-50/30 flex justify-end">
               <button 
                type="button" 
                onClick={() => handleSelect('')}
                className="text-[9px] font-black text-rose-400 hover:text-rose-600 px-2 py-1 uppercase tracking-wider"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
