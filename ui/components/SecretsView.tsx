import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Eye, 
  EyeOff, 
  Trash2, 
  Copy, 
  Check, 
  History, 
  Clock,
  Plus
} from 'lucide-react';
import { Button } from './common/Button';
import { Chip } from './common/Chip';
import { api, Environment } from '../services/api';

const SecretRow: React.FC<{ secret: any }> = ({ secret }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(secret.value || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 rounded-2xl text-indigo-500 border border-indigo-100 shadow-sm">
            <Key size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-slate-700">{secret.name}</p>
              <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black uppercase">v{secret.version}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">{secret.description}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-5">
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-3 ${
            isVisible ? 'bg-white border-indigo-200 text-slate-700' : 'bg-slate-50 border-transparent text-slate-300 select-none'
          }`}>
            {isVisible ? (secret.value || '••••••••••••••••') : '****************'}
            <button 
              onClick={() => setIsVisible(!isVisible)}
              className="text-slate-400 hover:text-indigo-600 transition-colors"
            >
              {isVisible ? <EyeOff size={14}/> : <Eye size={14}/>}
            </button>
          </div>
          <button 
            onClick={handleCopy}
            className={`p-2 rounded-xl border transition-all ${
              copied ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-600'
            }`}
          >
            {copied ? <Check size={14}/> : <Copy size={14}/>}
          </button>
        </div>
      </td>
      <td className="px-6 py-5">
        <div className="flex gap-1.5">
          {secret.environments.map((env: string) => (
            <Chip key={env} label={env} size="xs" color={env.includes('prod') ? 'success' : 'primary'} variant="outlined" />
          ))}
        </div>
      </td>
      <td className="px-6 py-5">
         <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase">
           <Clock size={12} /> {secret.lastUpdated}
         </div>
      </td>
      <td className="px-6 py-5 text-right space-x-1">
        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
          <History size={18}/>
        </button>
        <button className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
          <Trash2 size={18}/>
        </button>
      </td>
    </tr>
  );
};

export const SecretsView: React.FC = () => {
  const [secrets, setSecrets] = useState<any[]>([]);
  const [envs, setEnvs] = useState<Environment[]>([]);
  const [selectedEnv, setSelectedEnv] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEnvs();
  }, []);

  useEffect(() => {
    if (selectedEnv) {
        loadSecrets(selectedEnv);
    }
  }, [selectedEnv]);

  const loadEnvs = async () => {
    try {
        const data = await api.getEnvs(1);
        setEnvs(data);
        if (data.length > 0) setSelectedEnv(data[0].id);
    } catch (e) {
        console.error(e);
    }
  };

  const loadSecrets = async (envId: number) => {
    setLoading(true);
    try {
        const data = await api.getSecrets(envId);
        const envName = envs.find(e => e.id === envId)?.name || '';
        const adapted = data.map(s => ({
            ...s,
            name: s.key,
            description: s.is_reference ? 'Reference to Cloud Secret' : 'Encrypted Value',
            environments: [envName],
            lastUpdated: new Date(s.created_at).toLocaleDateString()
        }));
        setSecrets(adapted);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Secrets Vault</h3>
          <p className="text-sm text-slate-500 font-medium">Manage sensitive configuration for your environments.</p>
        </div>
        <div className="flex gap-3">
             <select 
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-indigo-500/10 outline-none"
                value={selectedEnv || ''}
                onChange={(e) => setSelectedEnv(Number(e.target.value))}
            >
                {envs.map(env => (
                    <option key={env.id} value={env.id}>{env.name}</option>
                ))}
            </select>
            <Button variant="contained" startIcon={<Plus size={16} />}>Add Secret</Button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Secret Key</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Value</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Environment</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Updated</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                  <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading secrets...</td>
                  </tr>
              ) : secrets.length > 0 ? (
                  secrets.map((secret) => (
                    <SecretRow key={secret.id} secret={secret} />
                  ))
              ) : (
                  <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No secrets found in this environment.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
