
import React from 'react';
import { WorkItem, WorkItemType, WorkItemStatus } from '../types';
import { Send, Save, Tag as TagIcon, X, Search, Terminal, User } from 'lucide-react';
import { Dialog } from './common/Dialog';
import { Button } from './common/Button';
import { TextField } from './common/TextField';
import { Select } from './common/Select';
import { Calendar } from './common/Calendar';
import { Switch } from './common/Switch';

interface WorkItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<WorkItem>) => void;
  initialStatus?: WorkItemStatus;
  editItem?: WorkItem | null;
}

export const WorkItemModal: React.FC<WorkItemModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialStatus = WorkItemStatus.TODO,
  editItem = null
}) => {
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    type: WorkItemType.FEATURE,
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    tags: [] as string[],
    targetDate: new Date().toISOString().split('T')[0],
    isUrgent: false,
    assignee: 'Alice Cooper',
    github_issue: ''
  });
  const [tagInput, setTagInput] = React.useState('');

  const users = [
    { label: 'Alice Cooper', value: 'Alice Cooper', description: 'Principal SRE' },
    { label: 'Bob Martin', value: 'Bob Martin', description: 'Frontend Lead' },
    { label: 'Charlie Cloud', value: 'Charlie Cloud', description: 'Platform Engineer' },
    { label: 'Diana DevOps', value: 'Diana DevOps', description: 'Security Analyst' },
  ];

  const workTypes = [
    { label: 'Feature Delivery', value: WorkItemType.FEATURE, description: 'New capability or enhancement' },
    { label: 'Bug Mitigation', value: WorkItemType.BUG, description: 'Fixing identified issues' },
    { label: 'Live Incident', value: WorkItemType.INCIDENT, description: 'Critical production failure' },
  ];

  React.useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setFormData({
          title: editItem.title,
          description: editItem.description,
          type: editItem.type,
          priority: editItem.priority,
          tags: editItem.tags,
          targetDate: new Date(editItem.createdAt).toISOString().split('T')[0],
          isUrgent: editItem.priority === 'HIGH',
          assignee: editItem.assignee,
          github_issue: editItem.github_issue || ''
        });
      } else {
        setFormData({
          title: '',
          description: '',
          type: WorkItemType.FEATURE,
          priority: 'MEDIUM',
          tags: [],
          targetDate: new Date().toISOString().split('T')[0],
          isUrgent: false,
          assignee: 'Alice Cooper',
          github_issue: ''
        });
      }
    }
  }, [isOpen, editItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(editItem || {}),
      ...formData,
      priority: formData.isUrgent ? 'HIGH' : formData.priority,
      status: editItem ? editItem.status : initialStatus,
      createdAt: editItem ? editItem.createdAt : new Date().toISOString(),
    });
    onClose();
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  return (
    <div className="z-[100]">
      <Dialog 
        isOpen={isOpen} 
        onClose={onClose} 
        title={editItem ? `Manifest: ${editItem.id}` : 'Create Work Manifest'}
        maxWidth="lg"
        footer={
          <>
            <Button variant="outlined" fullWidth onClick={onClose}>Cancel</Button>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={handleSubmit}
              startIcon={editItem ? <Save size={16}/> : <Terminal size={16}/>}
            >
              {editItem ? 'Commit Changes' : 'Execute Creation'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <TextField 
            label="Job Identifier / Title"
            placeholder="e.g., Secure Environment Variable Injection"
            value={formData.title}
            onChange={(e) => setFormData(p => ({ ...p, title: (e.target as HTMLInputElement).value }))}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Work Lineage"
              value={formData.type}
              onChange={(val) => setFormData(p => ({ ...p, type: val as any }))}
              options={workTypes}
              searchable={false}
            />
            <Select 
              label="Principal Engineer"
              placeholder="Assign to..."
              options={users}
              value={formData.assignee}
              onChange={(val) => setFormData(p => ({ ...p, assignee: val }))}
              searchable={true}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Calendar 
              label="Target Deployment Date"
              value={formData.targetDate}
              onChange={(date) => setFormData(p => ({ ...p, targetDate: date }))}
            />
            <div className="flex items-center pt-6 px-1">
               <Switch 
                  label="Bypass Approval Flow (Urgent)" 
                  checked={formData.isUrgent} 
                  onChange={(checked) => setFormData(p => ({ ...p, isUrgent: checked }))}
               />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Scope & Technical Details</label>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none h-32 resize-none transition-all text-slate-700"
              placeholder="Document the technical requirements and expected outcome..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <TextField 
            label="GitHub Issue URL (Optional)"
            placeholder="e.g. https://github.com/org/repo/issues/123"
            value={formData.github_issue}
            onChange={(e) => setFormData(p => ({ ...p, github_issue: (e.target as HTMLInputElement).value }))}
          />

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Operational Tags</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-slate-700"
                  placeholder="Find or create tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
              </div>
              <Button type="button" variant="outlined" size="sm" onClick={addTag}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3 min-h-[32px]">
              {formData.tags.map((tag) => (
                <span key={tag} className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-2 border border-indigo-100 animate-in fade-in zoom-in duration-150">
                  #{tag} 
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))}>
                    <X size={12} className="text-indigo-400 hover:text-rose-500" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
