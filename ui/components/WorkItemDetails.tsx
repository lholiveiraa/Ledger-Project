
import React from 'react';
import { WorkItem, WorkItemType, WorkItemStatus } from '../types';
import { X, Calendar as CalendarIcon, User, Tag, Rocket, Brain, ExternalLink, Activity, ArrowRight, History, Code, Info } from 'lucide-react';
import { getOpsInsights } from '../services/geminiService';
import { Tabs } from './common/Tabs';
import { Timeline } from './common/Timeline';
import { CodeEditor } from './common/CodeEditor';
import { Chip } from './common/Chip';
import { Button } from './common/Button';

interface WorkItemDetailsProps {
  item: WorkItem | null;
  onClose: () => void;
  onEdit: (item: WorkItem) => void;
}

export const WorkItemDetails: React.FC<WorkItemDetailsProps> = ({ item, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = React.useState('general');
  const [insight, setInsight] = React.useState<string>("");
  const [loadingInsight, setLoadingInsight] = React.useState(false);

  React.useEffect(() => {
    if (item) {
      setInsight("");
      setLoadingInsight(false);
      setActiveTab('general');
    }
  }, [item]);

  const generateInsight = async () => {
    if (!item) return;
    setLoadingInsight(true);
    const text = await getOpsInsights(`Analyze this ${item.type}: ${item.title}. Description: ${item.description}. Status: ${item.status}. Priority: ${item.priority}.`);
    setInsight(text);
    setLoadingInsight(false);
  };

  if (!item) return null;

  const tabs = [
    { id: 'general', label: 'General', icon: <Info size={14} /> },
    { id: 'technical', label: 'Technical Spec', icon: <Code size={14} /> },
    { id: 'history', label: 'Audit Trail', icon: <History size={14} /> },
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-[500px] bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200 transform transition-all duration-300">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono font-bold text-slate-400">{item.id}</span>
          <Chip label={item.status} size="xs" color={item.status === WorkItemStatus.RELEASED ? 'success' : 'primary'} />
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
          <X size={20} />
        </button>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {activeTab === 'general' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">{item.title}</h2>
              <p className="text-slate-600 leading-relaxed text-sm">{item.description}</p>
            </section>

            <section className="grid grid-cols-2 gap-6 mb-10">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Primary Assignee</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-[10px] font-bold">
                    {item.assignee[0]}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{item.assignee}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Operational Target</p>
                <div className="flex items-center gap-2">
                  <CalendarIcon size={14} className="text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-4">AI Delivery Insight</p>
              {loadingInsight ? (
                <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100 flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  <p className="text-xs text-indigo-600 font-bold italic tracking-tight">Synthesizing cluster context...</p>
                </div>
              ) : insight ? (
                <div className="bg-indigo-900 text-indigo-100 rounded-2xl p-6 border border-indigo-800 shadow-xl relative overflow-hidden">
                  <Brain className="absolute -bottom-4 -right-4 text-indigo-800 opacity-20" size={80} />
                  <p className="text-sm leading-relaxed italic relative z-10 font-medium">"{insight}"</p>
                </div>
              ) : (
                <Button variant="outlined" fullWidth onClick={generateInsight} startIcon={<Brain size={14}/>}>
                  Generate Operational Analysis
                </Button>
              )}
            </section>
          </div>
        )}

        {activeTab === 'technical' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3">Service Manifest / Config</p>
              <CodeEditor code={`apiVersion: nexusflow.io/v1\nkind: WorkItem\nmetadata:\n  name: ${item.id}\n  tags:\n${item.tags.map(t => `    - ${t}`).join('\n')}\nspec:\n  priority: ${item.priority}\n  type: ${item.type}\n  owner: ${item.assignee}`} />
            </div>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
               <div className="flex items-center gap-2 text-amber-700 font-bold text-xs mb-2 uppercase tracking-tight">
                  <Activity size={14} /> Telemetry Hook Attached
               </div>
               <p className="text-[11px] text-amber-600 font-medium">Auto-monitoring enabled for this component once released to PROD.</p>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <Timeline items={[
              { title: 'Item Created', time: '10:00 AM', description: `Work item initialized by ${item.assignee}.`, status: 'info' },
              { title: 'Validation Passed', time: '11:15 AM', description: 'Automatic security scan completed successfully.', status: 'success' },
              { title: 'In Progress', time: '02:30 PM', description: 'Assigned to dev-cluster-42 for implementation.', status: 'info' },
              { title: 'Code Quality Alert', time: 'Yesterday', description: 'Minor linting issues detected and resolved automatically.', status: 'success' },
            ]} />
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-100 bg-white flex gap-3">
        <Button variant="contained" fullWidth className="py-3">Promote to Ready</Button>
        <Button variant="outlined" onClick={() => onEdit(item)} className="px-6 py-3">Edit</Button>
      </div>
    </div>
  );
};
