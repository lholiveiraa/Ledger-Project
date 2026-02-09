
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  items: string[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4">
      <Home size={14} />
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight size={12} className="opacity-50" />
          <span className={`font-medium ${idx === items.length - 1 ? 'text-indigo-600 font-bold' : ''}`}>
            {item}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
};
