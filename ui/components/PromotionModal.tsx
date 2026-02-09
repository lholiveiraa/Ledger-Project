
import React from 'react';
import { Release, EnvironmentType } from '../types';
import { Dialog } from './common/Dialog';
import { Button } from './common/Button';
import { 
  ShieldCheck, 
  AlertTriangle, 
  ChevronRight, 
  Search,
  Zap,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Select } from './common/Select';

interface PromotionModalProps {
  data: { release: Release, target: EnvironmentType } | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({ data, onClose, onConfirm }) => {
  const [governanceCheck, setGovernanceCheck] = React.useState(false);

  if (!data) return null;

  const { release, target } = data;

  const approvers = [
    { label: 'Alice Cooper (Principal SRE)', value: 'alice', description: 'Auto-approved via bypass' },
    { label: 'Security Bot (Automated)', value: 'bot', description: 'Scan passed 07:45 AM' },
  ];

  return (
    <Dialog 
      isOpen={!!data} 
      onClose={onClose} 
      title={`Promote ${release.version} to ${target}`}
      footer={
        <>
          <Button variant="outlined" fullWidth onClick={onClose}>Cancel</Button>
          <Button 
            fullWidth 
            disabled={!governanceCheck}
            startIcon={<Zap size={16} />} 
            onClick={onConfirm}
          >
            Execute Promotion
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Promotion Summary */}
        <div className="flex items-center justify-center gap-8 py-4 bg-slate-50 rounded-2xl border border-slate-100">
           <div className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase">Current Source</p>
              <p className="text-sm font-bold text-slate-700">HML</p>
           </div>
           <ChevronRight size={24} className="text-slate-300" />
           <div className="text-center">
              <p className="text-[9px] font-black text-indigo-400 uppercase">Target Destination</p>
              <p className="text-sm font-bold text-indigo-600">{target}</p>
           </div>
        </div>

        {/* Governance Checklist */}
        <div className="space-y-4">
          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Governance & Compliance</h5>
          
          <div className="space-y-2">
            {[
              { label: 'Automated Security Scans (SCA)', status: 'PASS' },
              { label: 'Integration Tests Execution', status: 'PASS' },
              { label: 'Infrastructure Drift Check', status: 'STABLE' },
            ].map((gate, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-slate-50 rounded-xl bg-slate-50/50">
                <span className="text-xs font-medium text-slate-600">{gate.label}</span>
                <span className="text-[9px] font-black text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={12} /> {gate.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Select 
            label="Override Approver (Optional)"
            placeholder="Select authority..."
            options={approvers}
            value=""
            onChange={() => {}}
            searchable={true}
          />
        </div>

        {/* Warning for PROD */}
        {target === EnvironmentType.PROD && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-3 animate-pulse">
            <AlertTriangle className="text-rose-500 shrink-0" size={20} />
            <div>
              <p className="text-xs font-bold text-rose-700">Critical: Production Promotion</p>
              <p className="text-[10px] text-rose-600 leading-relaxed">Executing this will trigger a blue-green deployment on the PROD cluster. Traffic will be split 90/10 for the first 5 minutes.</p>
            </div>
          </div>
        )}

        <label className="flex items-start gap-3 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl cursor-pointer group hover:bg-indigo-50 transition-colors">
          <input 
            type="checkbox" 
            className="mt-1 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
            checked={governanceCheck}
            onChange={(e) => setGovernanceCheck(e.target.checked)}
          />
          <div className="flex-1">
            <p className="text-xs font-bold text-indigo-900">Confirm Compliance</p>
            <p className="text-[10px] text-indigo-700 mt-1">I certify that all work items in this release have been tested and comply with organization policies.</p>
          </div>
        </label>
      </div>
    </Dialog>
  );
};
