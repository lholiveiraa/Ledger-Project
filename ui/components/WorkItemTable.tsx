
import React from 'react';
import { WorkItem, WorkItemType, WorkItemStatus } from '../types';
import { Bug, AlertCircle, Sparkles, User, ArrowRight } from 'lucide-react';

interface WorkItemTableProps {
  items: WorkItem[];
  onItemClick: (item: WorkItem) => void;
}

export const WorkItemTable: React.FC<WorkItemTableProps> = ({ items, onItemClick }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID & Type</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Work Title</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assignee</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Target</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr 
              key={item.id} 
              onClick={() => onItemClick(item)}
              className="hover:bg-slate-50 cursor-pointer transition-colors group"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                   <div className={`p-1.5 rounded-lg ${
                      item.type === WorkItemType.BUG ? 'bg-rose-50 text-rose-500' :
                      item.type === WorkItemType.INCIDENT ? 'bg-amber-50 text-amber-500' :
                      'bg-indigo-50 text-indigo-500'
                   }`}>
                      {item.type === WorkItemType.BUG ? <Bug size={14}/> : 
                       item.type === WorkItemType.INCIDENT ? <AlertCircle size={14}/> : 
                       <Sparkles size={14}/>}
                   </div>
                   <span className="text-xs font-mono font-bold text-slate-400">{item.id}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors line-clamp-1">{item.title}</p>
                <div className="flex gap-2 mt-1">
                  {item.tags.map(tag => (
                    <span key={tag} className="text-[9px] text-slate-400">#{tag}</span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  item.status === WorkItemStatus.RELEASED ? 'bg-emerald-100 text-emerald-700' :
                  item.status === WorkItemStatus.DONE ? 'bg-slate-200 text-slate-600' :
                  'bg-indigo-100 text-indigo-700'
                }`}>
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-slate-300" />
                  <span className="text-xs font-medium text-slate-600">{item.assignee}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                {item.linkedReleaseId ? (
                  <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full">{item.linkedReleaseId}</span>
                ) : (
                  <ArrowRight size={14} className="inline text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
