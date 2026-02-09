
import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
}

export const Calendar: React.FC<CalendarProps> = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Data atual de visualização do calendário (mês/ano)
  const initialDate = value ? new Date(value) : new Date();
  const [viewDate, setViewDate] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const selectDate = (day: number) => {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(selected.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const renderDays = () => {
    const totalDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const startDay = firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
    const result = [];

    // Células vazias para o início da semana
    for (let i = 0; i < startDay; i++) {
      result.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }

    // Dias do mês
    for (let d = 1; d <= totalDays; d++) {
      const dateString = new Date(viewDate.getFullYear(), viewDate.getMonth(), d).toISOString().split('T')[0];
      const isSelected = value === dateString;
      const isToday = new Date().toISOString().split('T')[0] === dateString;

      result.push(
        <button
          key={d}
          type="button"
          onClick={() => selectDate(d)}
          className={`h-8 w-8 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center ${
            isSelected ? 'bg-indigo-600 text-white shadow-md' : 
            isToday ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' :
            'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {d}
        </button>
      );
    }
    return result;
  };

  return (
    <div className="flex flex-col gap-1.5 w-full relative" ref={containerRef}>
      {label && (
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-left focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
      >
        <CalendarIcon size={16} className="text-slate-400" />
        {value ? new Date(value).toLocaleDateString() : "Select Deployment Target"}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-[150] bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 w-72 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-slate-800">
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </h4>
            <div className="flex gap-1">
              <button type="button" onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
                <ChevronLeft size={16} />
              </button>
              <button type="button" onClick={handleNextMonth} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {days.map(d => (
              <div key={d} className="h-8 w-8 flex items-center justify-center text-[10px] font-bold text-slate-300 uppercase">
                {d}
              </div>
            ))}
            {renderDays()}
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
            <button 
              type="button" 
              onClick={() => { onChange(new Date().toISOString().split('T')[0]); setIsOpen(false); }}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase"
            >
              Go to Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
