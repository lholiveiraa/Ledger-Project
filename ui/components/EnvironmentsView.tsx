
import React, { useState, useEffect } from 'react';
import { EnvironmentType } from '../types';
import { api, Environment, Secret, Resource, App } from '../services/api';
import { 
  Cloud, 
  ShieldCheck, 
  Globe, 
  ExternalLink,
  History,
  RefreshCw,
  Plus,
  Play,
  Server,
  CloudLightning,
  Lock,
  Database,
  Eye,
  EyeOff,
  Github,
  Monitor
} from 'lucide-react';
import { Chip } from './common/Chip';
import { Button } from './common/Button';
import { Stepper } from './common/Stepper';
import { Accordion } from './common/Accordion';
import { Timeline } from './common/Timeline';
import { CodeEditor } from './common/CodeEditor';
import { Tooltip } from './common/Tooltip';
import { CircularProgress } from './common/CircularProgress';
import { Dialog } from './common/Dialog';
import { TextField } from './common/TextField';
import { Select } from './common/Select';

export const EnvironmentsView: React.FC = () => {
  const [app, setApp] = useState<App | null>(null);
  const [envs, setEnvs] = useState<Environment[]>([]);
  const [activeEnv, setActiveEnv] = useState<Environment | null>(null);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [isAddCloudOpen, setIsAddCloudOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'secrets' | 'resources'>('overview');
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [showSecretValue, setShowSecretValue] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeEnv) {
      if (activeTab === 'secrets') loadSecrets(activeEnv.id);
      if (activeTab === 'resources') loadResources(activeEnv.id);
    }
  }, [activeEnv, activeTab]);

  const loadData = async () => {
    try {
      const apps = await api.getApps();
      if (apps.length > 0) {
        const currentApp = apps[0];
        setApp(currentApp);
        // Ensure we display all environments defined in the app
        const appEnvs = currentApp.envs || [];
        setEnvs(appEnvs);
        
        // If we have an active env, keep it, otherwise select the first one
        if (!activeEnv && appEnvs.length > 0) {
          setActiveEnv(appEnvs[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadSecrets = async (id: number) => {
    try {
      const data = await api.getSecrets(id);
      setSecrets(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadResources = async (id: number) => {
    try {
      const data = await api.getResources(id);
      setResources(data);
    } catch (e) {
      console.error(e);
    }
  };

  const [newCloudData, setNewCloudData] = useState({
    provider: 'AWS',
    region: 'us-east-1',
    name: ''
  });

  const cloudProviders = [
    { label: 'Amazon Web Services', value: 'AWS', description: 'Elastic Compute Cloud (EC2)' },
    { label: 'Google Cloud Platform', value: 'GCP', description: 'Google Kubernetes Engine (GKE)' },
    { label: 'Microsoft Azure', value: 'Azure', description: 'Azure Kubernetes Service (AKS)' },
    { label: 'DigitalOcean', value: 'DO', description: 'Droplets and Managed K8s' },
    { label: 'Oracle Cloud', value: 'OCI', description: 'Oracle Container Engine' },
  ];

  const regions = [
    { label: 'US East (N. Virginia)', value: 'us-east-1' },
    { label: 'Europe (Frankfurt)', value: 'eu-central-1' },
    { label: 'South America (São Paulo)', value: 'sa-east-1' },
    { label: 'Asia Pacific (Tokyo)', value: 'ap-northeast-1' },
  ];

  const steps = [
    { label: 'Artifact Built', description: 'Docker image generated' },
    { label: 'Security Scan', description: '0 vulnerabilities found' },
    { label: 'QA Approved', description: 'Manual validation complete' },
    { label: 'Promoted', description: 'Live in Production' }
  ];

  const handleSync = () => {
    setIsSyncing(true);
    loadData().then(() => setIsSyncing(false));
  };

  const getEnvDetails = (env: Environment) => {
    const details = {
      health: 98,
      region: 'us-east-1',
      cloud: 'AWS'
    };
    
    if (env.provider?.toLowerCase().includes('google') || env.provider === 'GCP') {
      details.cloud = 'GCP';
      details.region = 'us-central1';
    } else if (env.provider?.toLowerCase().includes('azure')) {
      details.cloud = 'Azure';
      details.region = 'eastus';
    } else if (env.provider === 'local') {
      details.cloud = 'Local Machine';
      details.region = 'localhost';
      details.health = 100;
    }
    
    return details;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-3 rounded-xl text-white shadow-lg shadow-indigo-100">
            <Globe size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Infrastructure Control Plane</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Monitoring <span className="text-indigo-600 dark:text-indigo-400 font-bold">{envs.length} active environments</span>.</p>
          </div>
        </div>
        
        {app && (
          <div className="flex items-center gap-6 px-6 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active App</p>
              <p className="font-bold text-slate-700 dark:text-slate-200">{app.name}</p>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-3">
              <Github size={18} className="text-slate-400" />
              <div>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Source Repo</p>
                 <a href={`https://${app.git_repo}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 hover:underline truncate max-w-[150px] block">
                   {app.git_repo || 'Not configured'}
                 </a>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outlined" onClick={handleSync} startIcon={isSyncing ? <CircularProgress size="sm" /> : <RefreshCw size={14} />}>
            {isSyncing ? 'Syncing...' : 'Sync Context'}
          </Button>
          <Button startIcon={<Plus size={14} />} onClick={() => setIsAddCloudOpen(true)}>Connect Cloud</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Selection */}
        <div className="lg:col-span-1 space-y-3">
          {envs.map((env) => {
            const details = getEnvDetails(env);
            const isActive = activeEnv?.id === env.id;
            return (
              <button
                key={env.id}
                onClick={() => setActiveEnv(env)}
                className={`w-full p-4 rounded-2xl border transition-all text-left flex flex-col gap-3 group ${
                  isActive
                  ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/5' 
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Chip label={env.name} color={env.name === 'prod' ? 'success' : 'primary'} size="xs" />
                  <Tooltip text="Healthy status from agent" position="right">
                    <div className={`w-2 h-2 rounded-full ${details.health > 95 ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                  </Tooltip>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{details.cloud} • {details.region}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Release: v1.4.0</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100/50 dark:border-slate-800/50">
                  <span className="text-[10px] font-mono font-bold text-slate-400">Cluster: nexus-{env.name.toLowerCase()}</span>
                  <ExternalLink size={12} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>
              </button>
            );
          })}
          
          <button 
            onClick={() => setIsAddCloudOpen(true)}
            className="w-full p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/20 dark:hover:bg-indigo-900/20 transition-all"
          >
            <CloudLightning size={24} />
            <span className="text-xs font-bold uppercase tracking-widest">Connect New Provider</span>
          </button>
        </div>

        {/* Main Details Area */}
        <div className="lg:col-span-3 space-y-6">
          {activeEnv ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <Cloud size={20} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">{activeEnv.provider} Instance Details</h4>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Availability</p>
                    <p className="text-xl font-black text-emerald-600">98%</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 border-b border-slate-100 dark:border-slate-800 mb-8">
                <button 
                  onClick={() => setActiveTab('overview')} 
                  className={`pb-3 text-sm font-bold transition-colors ${activeTab === 'overview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => setActiveTab('secrets')} 
                  className={`pb-3 text-sm font-bold transition-colors ${activeTab === 'secrets' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Secrets & Config
                </button>
                <button 
                  onClick={() => setActiveTab('resources')} 
                  className={`pb-3 text-sm font-bold transition-colors ${activeTab === 'resources' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Resources (DB/Cache)
                </button>
              </div>

              {activeTab === 'overview' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Stepper steps={steps} activeStep={activeEnv.name === 'prod' ? 4 : activeEnv.name === 'hml' ? 3 : 1} />
    
                  <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Accordion title="Infrastructure Config (YAML)" defaultOpen>
                        <CodeEditor code={`# ${activeEnv.name} Environment Blueprint\ncluster:\n  provider: ${activeEnv.provider}\n  region: ${getEnvDetails(activeEnv).region}\n  nodes: 5\n  autoscale: true\n  min: 2\n  max: 10\nsecurity:\n  vpn: enabled\n  waf: cloudflare`} />
                      </Accordion>
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
                        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-[10px] uppercase tracking-wider mb-2">
                          <Server size={14} /> Provisioning Metadata
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400">Instance Type:</span>
                          <span className="text-slate-800 dark:text-slate-200 font-bold">t3.large / n2-standard-4</span>
                          <span className="text-slate-500 dark:text-slate-400">Storage Class:</span>
                          <span className="text-slate-800 dark:text-slate-200 font-bold">ssd-premium-v2</span>
                        </div>
                      </div>
                    </div>
    
                    <div className="space-y-4">
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-100 dark:border-slate-800 h-full">
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <History size={12} /> Audit Log: {activeEnv.name}
                        </h5>
                        <Timeline items={[
                          { title: 'Cluster Scaled', time: '10 mins ago', description: 'Scale-up triggered by auto-scaling group. +2 nodes added.', status: 'info' },
                          { title: 'Config Injected', time: '2 hours ago', description: 'Secrets from "Vault-PROD" successfully injected into pods.', status: 'success' },
                          { title: 'Probe Failure', time: 'Yesterday', description: 'Readiness probe failed for node us-east-1a. Self-healed.', status: 'error' },
                        ]} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'secrets' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                   <div className="flex justify-between items-center">
                       <div>
                           <h3 className="font-bold text-slate-700 dark:text-slate-200">Environment Secrets</h3>
                           <p className="text-xs text-slate-400 mt-1">Managed via {activeEnv.provider} Secret Manager</p>
                       </div>
                       <Button size="sm" startIcon={<Plus size={14}/>} onClick={() => {}}>Add Secret</Button>
                   </div>
                   
                   {secrets.length === 0 ? (
                       <div className="text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                           <Lock className="mx-auto text-slate-300 mb-2" size={24}/>
                           <p className="text-slate-500 text-sm">No secrets configured for this environment.</p>
                       </div>
                   ) : (
                       <div className="grid gap-3">
                           {secrets.map(s => (
                               <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 group hover:border-indigo-200 transition-colors">
                                   <div className="flex items-center gap-4">
                                       <div className="bg-white dark:bg-slate-700 p-2 rounded-lg text-slate-400 group-hover:text-indigo-500 transition-colors">
                                           <Lock size={16} />
                                       </div>
                                       <div>
                                           <p className="font-mono font-bold text-sm text-slate-700 dark:text-slate-200">{s.key}</p>
                                           <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                                               {s.is_reference ? 'External Reference' : 'Encrypted Value'} • v{s.version}
                                           </p>
                                       </div>
                                   </div>
                                   <div className="flex items-center gap-3">
                                       {s.is_reference && <Chip label="Cloud Managed" size="xs" color="info" />}
                                       <div className="text-right mr-4">
                                           <p className="text-[10px] text-slate-400">Updated by</p>
                                           <p className="text-xs font-bold text-slate-600 dark:text-slate-300">admin</p>
                                       </div>
                                   </div>
                               </div>
                           ))}
                       </div>
                   )}
                </div>
              )}

              {activeTab === 'resources' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex justify-between items-center">
                       <div>
                           <h3 className="font-bold text-slate-700 dark:text-slate-200">Attached Resources</h3>
                           <p className="text-xs text-slate-400 mt-1">Databases, Caches, and Storage buckets</p>
                       </div>
                       <Button size="sm" startIcon={<Plus size={14}/>}>Provision Resource</Button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {resources.map(r => (
                           <div key={r.id} className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
                               <div className="flex justify-between items-start">
                                   <div className="flex items-center gap-3">
                                       <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2.5 rounded-lg text-indigo-600 dark:text-indigo-400">
                                           <Database size={18} />
                                       </div>
                                       <div>
                                           <h4 className="font-bold text-slate-800 dark:text-slate-100">{r.name}</h4>
                                           <p className="text-xs text-slate-500">{r.provider}</p>
                                       </div>
                                   </div>
                                   <Chip 
                                       label={r.status} 
                                       color={r.status === 'ready' ? 'success' : r.status === 'provisioning' ? 'warning' : 'error'} 
                                       size="xs" 
                                   />
                               </div>
                               <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Connection Config</p>
                                   <code className="text-xs font-mono text-slate-600 dark:text-slate-300 break-all">
                                       {r.config}
                                   </code>
                               </div>
                           </div>
                       ))}
                       
                       <button className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-indigo-500 hover:border-indigo-300 hover:bg-indigo-50/10 transition-all min-h-[160px]">
                           <Plus size={24} />
                           <span className="text-xs font-bold uppercase tracking-widest">Add Resource</span>
                       </button>
                   </div>
                </div>
              )}

            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-64 text-slate-400">
               <Cloud size={48} className="mb-4 opacity-20" />
               <p>Select an environment to view details</p>
             </div>
          )}
        </div>
      </div>

      {/* Add Cloud Dialog */}
      <Dialog 
        isOpen={isAddCloudOpen} 
        onClose={() => setIsAddCloudOpen(false)} 
        title="Connect New Cloud Provider"
        footer={
          <>
            <Button variant="outlined" fullWidth onClick={() => setIsAddCloudOpen(false)}>Cancel</Button>
            <Button fullWidth startIcon={<Play size={16} />} onClick={() => setIsAddCloudOpen(false)}>Establish Connection</Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select 
              label="Cloud Provider"
              options={cloudProviders}
              value={newCloudData.provider}
              onChange={(v) => setNewCloudData({...newCloudData, provider: v})}
              searchable={false}
            />
            <Select 
              label="Cloud Region"
              options={regions}
              value={newCloudData.region}
              onChange={(v) => setNewCloudData({...newCloudData, region: v})}
              searchable={true} // Select2 Style
            />
          </div>
          
          <TextField 
            label="Cluster Nickname / Alias" 
            placeholder="e.g., prod-brazil-01" 
            value={newCloudData.name}
            onChange={(e) => setNewCloudData({...newCloudData, name: (e.target as HTMLInputElement).value})}
          />

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
             <div className="flex items-center gap-2 mb-2 text-indigo-600 font-bold text-xs">
                <ShieldCheck size={16} /> Identity & Access Management
             </div>
             <p className="text-[10px] text-slate-500 leading-relaxed mb-4">
               NexusFlow requires a service account with <code className="bg-slate-200 px-1 rounded">ClusterAdmin</code> permissions. We will automatically provision a NexusAgent on the target cluster.
             </p>
             <TextField 
               label="Service Account Key (JSON/YAML)" 
               placeholder="Paste your provider credentials here..."
               className="font-mono text-[10px]"
             />
          </div>
        </div>
      </Dialog>
    </div>
  );
};
