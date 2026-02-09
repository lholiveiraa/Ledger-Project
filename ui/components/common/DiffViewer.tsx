
import React from 'react';

interface DiffLine {
  content: string;
  type: 'added' | 'removed' | 'unchanged';
}

interface DiffViewerProps {
  lines: DiffLine[];
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ lines }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden font-mono text-xs">
      {lines.map((line, idx) => (
        <div 
          key={idx} 
          className={`flex py-0.5 px-4 ${
            line.type === 'added' ? 'bg-emerald-50 text-emerald-700' :
            line.type === 'removed' ? 'bg-rose-50 text-rose-700' :
            'text-slate-500'
          }`}
        >
          <span className="w-6 shrink-0 opacity-50 select-none">
            {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
          </span>
          <span className="whitespace-pre-wrap">{line.content}</span>
        </div>
      ))}
    </div>
  );
};
