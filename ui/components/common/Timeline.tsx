
import React from 'react';

interface TimelineItem {
  title: string;
  time: string;
  description: string;
  status?: 'success' | 'error' | 'info';
}

interface TimelineProps {
  items: TimelineItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ items }) => {
  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-100 before:to-transparent">
      {items.map((item, idx) => (
        <div key={idx} className="relative flex items-start gap-6 group">
          <div className={`mt-1.5 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shrink-0 z-10 transition-transform group-hover:scale-110 ${
            item.status === 'success' ? 'bg-emerald-500 shadow-lg shadow-emerald-100' :
            item.status === 'error' ? 'bg-rose-500 shadow-lg shadow-rose-100' :
            'bg-slate-300 shadow-lg shadow-slate-100'
          }`} />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h5 className="text-sm font-bold text-slate-800">{item.title}</h5>
              <time className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{item.time}</time>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
