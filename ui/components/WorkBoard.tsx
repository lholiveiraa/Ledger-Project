
import React from 'react';
import { WorkItemStatus, WorkItem } from '../types';
import { 
  Plus, 
  Circle, 
  CheckCircle2, 
  Clock, 
  Search,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import { WorkItemCard } from './WorkItemCard';
import { WorkItemDetails } from './WorkItemDetails';
import { WorkItemTable } from './WorkItemTable';
import { WorkItemFilter, FilterState } from './WorkItemFilter';

const STAGES = [
  { id: WorkItemStatus.TODO, label: 'Backlog', icon: <Circle size={16} /> },
  { id: WorkItemStatus.IN_PROGRESS, label: 'In Progress', icon: <Clock size={16} /> },
  { id: WorkItemStatus.DONE, label: 'Done / QA', icon: <CheckCircle2 size={16} /> },
  { id: WorkItemStatus.RELEASED, label: 'Released', icon: <CheckCircle2 size={16} className="text-indigo-500" /> },
];

interface WorkBoardProps {
  items: WorkItem[];
  onEditItem: (item: WorkItem) => void;
  onNewItemAtStatus: (status: WorkItemStatus) => void;
}

export const WorkBoard: React.FC<WorkBoardProps> = ({ items, onEditItem, onNewItemAtStatus }) => {
  const [viewMode, setViewMode] = React.useState<'BOARD' | 'LIST'>('BOARD');
  const [selectedItem, setSelectedItem] = React.useState<WorkItem | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filters, setFilters] = React.useState<FilterState>({ types: [], priorities: [] });

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filters.types.length === 0 || filters.types.includes(item.type);
    const matchesPriority = filters.priorities.length === 0 || filters.priorities.includes(item.priority);
    
    return matchesSearch && matchesType && matchesPriority;
  });

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, title or tags..." 
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
            />
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('BOARD')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'BOARD' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutGrid size={14} /> Board
            </button>
            <button 
              onClick={() => setViewMode('LIST')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'LIST' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ListIcon size={14} /> List
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <WorkItemFilter activeFilters={filters} onFilterChange={setFilters} />
          <button 
            onClick={() => onNewItemAtStatus(WorkItemStatus.TODO)}
            className="bg-indigo-600 text-white flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
          >
            <Plus size={16} /> New Item
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      {viewMode === 'BOARD' ? (
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
          <div className="flex gap-6 min-w-max h-full">
            {STAGES.map((stage) => (
              <div key={stage.id} className="w-[300px] flex flex-col bg-slate-100/40 rounded-2xl p-4 h-full overflow-hidden border border-slate-100/50">
                <div className="flex items-center justify-between mb-5 px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{stage.icon}</span>
                    <h4 className="font-bold text-slate-700 uppercase tracking-tight text-[11px]">{stage.label}</h4>
                    <span className="bg-white text-slate-400 px-1.5 py-0.5 rounded text-[9px] font-bold border border-slate-200">
                      {filteredItems.filter(i => i.status === stage.id).length}
                    </span>
                  </div>
                  <button onClick={() => onNewItemAtStatus(stage.id)} className="text-slate-400 hover:text-indigo-600">
                    <Plus size={16} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1">
                  {filteredItems.filter(i => i.status === stage.id).map(item => (
                    <WorkItemCard 
                      key={item.id} 
                      item={item} 
                      onClick={setSelectedItem} 
                    />
                  ))}
                  <button 
                    onClick={() => onNewItemAtStatus(stage.id)}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Plus size={14} /> Add Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
           <WorkItemTable 
            items={filteredItems} 
            onItemClick={setSelectedItem} 
           />
        </div>
      )}

      {/* Detail Overlay */}
      {selectedItem && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" 
            onClick={() => setSelectedItem(null)}
          />
          <WorkItemDetails 
            item={filteredItems.find(i => i.id === selectedItem.id) || selectedItem} 
            onClose={() => setSelectedItem(null)} 
            onEdit={(item) => onEditItem(item)}
          />
        </>
      )}
    </div>
  );
};
