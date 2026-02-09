
import React from 'react';
import { Dialog } from './common/Dialog';
import { FileText, GitCommit, Package, CheckCircle2 } from 'lucide-react';
import { Chip } from './common/Chip';
import { CodeEditor } from './common/CodeEditor';
import { Release as ApiRelease, WorkItem } from '../services/api';

// Extended interface to match what ReleasePipeline passes
interface UIRelease extends ApiRelease {
    status?: string;
    workItems?: WorkItem[];
    commit_sha?: string;
}

interface ReleaseDetailsModalProps {
  release: UIRelease | null;
  onClose: () => void;
}

export const ReleaseDetailsModal: React.FC<ReleaseDetailsModalProps> = ({ release, onClose }) => {
  if (!release) return null;

  // Use passed work items or empty array
  const releaseItems = release.workItems || [];

  return (
    <Dialog 
      isOpen={!!release} 
      onClose={onClose} 
      title={`Release Manifest: ${release.version}`}
      maxWidth="lg"
    >
      <div className="space-y-8">
        {/* Artifact Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-widest mb-2">
              <Package size={14} /> Artifact Metadata
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Docker Image:</span>
                <span className="text-slate-700 font-mono font-bold">nexus-api:{release.version}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Registry:</span>
                <span className="text-slate-700 font-bold">gcr.io/nexus-prod</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-widest mb-2">
              <GitCommit size={14} /> SCM Context
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Branch:</span>
                <span className="text-slate-700 font-bold">main</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Commit SHA:</span>
                <span className="text-slate-700 font-mono font-bold">{release.commit_sha || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Work Items List */}
        <div>
          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <FileText size={14} /> Included Deliveries
          </h5>
          <div className="space-y-2">
            {releaseItems.length > 0 ? (
                releaseItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <div>
                        <p className="text-xs font-bold text-slate-700">{item.title}</p>
                        <p className="text-[9px] font-mono text-slate-400">#{item.id}</p>
                    </div>
                    </div>
                    <Chip label={item.type} size="xs" color="info" />
                </div>
                ))
            ) : (
                <div className="text-center py-4 text-slate-400 text-xs">No work items linked to this release.</div>
            )}
          </div>
        </div>

        {/* Technical Configuration */}
        <div>
          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Deployment Configuration (Helm Values)</h5>
          <CodeEditor code={`image:\n  repository: gcr.io/nexus-prod/api\n  tag: ${release.version}\n  pullPolicy: IfNotPresent\nresources:\n  limits:\n    cpu: 500m\n    memory: 512Mi\n  requests:\n    cpu: 200m\n    memory: 256Mi`} />
        </div>
      </div>
    </Dialog>
  );
};
