
import React from 'react';
import { WorkItem, WorkItemType } from '../types';
import { Bug, AlertCircle, Sparkles, User, Clock, Github } from 'lucide-react';
import { Chip } from './common/Chip';

interface WorkItemCardProps {
  item: WorkItem;
  onClick: (item: WorkItem) => void;
}

export const WorkItemCard: React.FC<WorkItemCardProps> = ({ item, onClick }) => {
  const getIcon = () => {
    switch (item.type) {
      case WorkItemType.BUG: return <Bug size={12} />;
      case WorkItemType.INCIDENT: return <AlertCircle size={12} />;
      default: return <Sparkles size={12} />;
    }
  };

  const getColor = () => {
    switch (item.type) {
      case WorkItemType.BUG: return 'error';
      case WorkItemType.INCIDENT: return 'warning';
      default: return 'primary';
    }
  };

  return (
    <div 
      onClick={() => onClick(item)}
      className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden active:scale-[0.98]"
    >
      <div className="flex justify-between items-start mb-3">
        <Chip label={item.type} size="xs" color={getColor() as any} icon={getIcon()} />
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
          item.priority === 'HIGH' ? 'text-rose-600 bg-rose-50' : 'text-slate-400 bg-slate-50'
        }`}>
          {item.priority}
        </span>
      </div>

      <h5 className="text-sm font-semibold text-slate-800 leading-snug mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
        {item.title}
      </h5>

      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center border border-white">
            <User size={10} className="text-slate-400" />
          </div>
          <span className="text-[10px] font-medium text-slate-500">{item.assignee}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
           {item.github_issue && (
              <a 
                href={item.github_issue} 
                target="_blank" 
                rel="noreferrer" 
                onClick={(e) => e.stopPropagation()}
                className="hover:text-slate-600 transition-colors"
              >
                <Github size={12} />
              </a>
           )}
           <div className="flex items-center gap-1">
              <Clock size={10} />
              <span className="text-[9px] font-bold">4h</span>
           </div>
        </div>
      </div>
    </div>
  );
};
