
import React from 'react';
import { WorkItemType } from '../types';
import { Filter, X, Check } from 'lucide-react';

interface WorkItemFilterProps {
  onFilterChange: (filters: FilterState) => void;
  activeFilters: FilterState;
}

export interface FilterState {
  types: WorkItemType[];
  priorities: ('LOW' | 'MEDIUM' | 'HIGH')[];
}

export const WorkItemFilter: React.FC<WorkItemFilterProps> = ({ onFilterChange, activeFilters }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleType = (type: WorkItemType) => {
    const newTypes = activeFilters.types.includes(type)
      ? activeFilters.types.filter(t => t !== type)
      : [...activeFilters.types, type];
    onFilterChange({ ...activeFilters, types: newTypes });
  };

  const togglePriority = (priority: 'LOW' | 'MEDIUM' | 'HIGH') => {
    const newPriorities = activeFilters.priorities.includes(priority)
      ? activeFilters.priorities.filter(p => p !== priority)
      : [...activeFilters.priorities, priority];
    onFilterChange({ ...activeFilters, priorities: newPriorities });
  };

  const hasActiveFilters = activeFilters.types.length > 0 || activeFilters.priorities.length > 0;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all border shadow-sm ${
          hasActiveFilters || isOpen
            ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
        }`}
      >
        <Filter size={14} />
        Filter {hasActiveFilters && `(${activeFilters.types.length + activeFilters.priorities.length})`}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-5 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-800 text-sm">Filter Operations</h4>
              <button 
                onClick={() => onFilterChange({ types: [], priorities: [] })}
                className="text-[10px] text-slate-400 hover:text-indigo-600 font-bold uppercase"
              >
                Reset All
              </button>
            </div>

            <div className="space-y-4">
              <section>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Item Types</p>
                <div className="space-y-1">
                  {[WorkItemType.FEATURE, WorkItemType.BUG, WorkItemType.INCIDENT].map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleType(t)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
                    >
                      <span>{t}</span>
                      {activeFilters.types.includes(t) && <Check size={14} className="text-indigo-600" />}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Priority</p>
                <div className="space-y-1">
                  {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                    <button
                      key={p}
                      onClick={() => togglePriority(p as any)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
                    >
                      <span>{p}</span>
                      {activeFilters.priorities.includes(p as any) && <Check size={14} className="text-indigo-600" />}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
