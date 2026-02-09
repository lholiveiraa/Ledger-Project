import React, { useState, useEffect } from 'react';
import { EnvironmentType } from '../types';
import { api, Release as ApiRelease, WorkItem } from '../services/api';
import { 
  Rocket, 
  GitBranch, 
  FileText,
  ArrowRightLeft
} from 'lucide-react';
import { Button } from './common/Button';
import { Chip } from './common/Chip';

// Adapter type for UI
interface UIRelease extends ApiRelease {
  status: string;
  workItems: WorkItem[];
  environments: Record<string, string | null>;
}

export const ReleasePipeline: React.FC = () => {
  const [releases, setReleases] = useState<UIRelease[]>([]);
  const [selectedRelease, setSelectedRelease] = useState<UIRelease | null>(null);

  useEffect(() => {
    loadReleases();
  }, []);

  const loadReleases = async () => {
    try {
      const [releasesData, deploymentsData, envsData] = await Promise.all([
        api.getReleases(1),
        api.getDeployments(1),
        api.getEnvs(1)
      ]);

      const adapted = releasesData.map(r => {
        const releaseDeployments = deploymentsData.filter(d => d.release_id === r.id && d.status === 'success');
        
        const envStatus: Record<string, string | null> = {
             [EnvironmentType.DEV]: null,
             [EnvironmentType.HML]: null,
             [EnvironmentType.PROD]: null
        };

        releaseDeployments.forEach(d => {
            const env = envsData.find(e => e.id === d.environment_id);
            if (env) {
                // Simple mapping: assume env name contains 'dev', 'hml', 'prod'
                let type: string = "";
                if (env.name.includes('dev')) type = EnvironmentType.DEV;
                else if (env.name.includes('hml')) type = EnvironmentType.HML;
                else if (env.name.includes('prod')) type = EnvironmentType.PROD;
                
                if (type) {
                    envStatus[type] = d.created_at;
                }
            }
        });

        return {
          ...r,
          status: 'ACTIVE',
          workItems: r.work_items || [],
          environments: envStatus
        };
      });
      setReleases(adapted);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Software Distribution Pipeline</h3>
          <p className="text-sm text-slate-500 font-medium">Immutable versions moving through verified environments.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outlined" startIcon={<ArrowRightLeft size={16} />}>Compare Versions</Button>
          <Button variant="contained" startIcon={<Rocket size={16} />}>Create New Release</Button>
        </div>
      </div>

      <div className="space-y-4">
        {releases.map((release) => (
          <div key={release.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm text-indigo-500">
                  <GitBranch size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800 tracking-tight">{release.version}</h4>
                    {release.status === 'DEPLOYED' && <Chip label="Stable" color="success" size="xs" />}
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">ID: {release.id} • Created {new Date(release.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-slate-400 uppercase font-black">Composition</p>
                  <p className="text-sm font-bold text-slate-700">{release.workItems.length} Work Items</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedRelease(release)}>
                  <FileText size={16} className="mr-2" /> Manifest
                </Button>
              </div>
            </div>

            <div className="p-10 relative bg-gradient-to-r from-white via-slate-50/30 to-white">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2" />
              <div className="relative flex justify-between items-center max-w-4xl mx-auto">
                {Object.values(EnvironmentType).map((env, index) => {
                   const deployedAt = release.environments[env];
                   const isDeployed = !!deployedAt;
                   
                   return (
                    <div key={env} className="relative z-10 flex flex-col items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                        isDeployed 
                          ? 'bg-indigo-600 border-indigo-100 text-white shadow-lg shadow-indigo-200 scale-110' 
                          : 'bg-white border-slate-100 text-slate-300'
                      }`}>
                        <span className="font-black text-[10px]">{env}</span>
                      </div>
                      <div className="text-center">
                         {isDeployed ? (
                             <>
                                <p className="text-xs font-bold text-indigo-600">Deployed</p>
                                <p className="text-[10px] text-slate-400">{new Date(deployedAt!).toLocaleDateString()}</p>
                             </>
                         ) : (
                            <p className="text-xs font-bold text-slate-300">Pending</p>
                         )}
                      </div>
                    </div>
                   );
                })}
              </div>
            </div>
          </div>
        ))}
        {releases.length === 0 && (
            <div className="text-center py-12 text-slate-400">
                No releases found. Create one to get started.
            </div>
        )}
      </div>
    </div>
  );
};
