
import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  Maximize2, 
  Zap, 
  AlertTriangle,
  Server,
  Cpu,
  BarChart3,
  GitCommit,
  Clock,
  CheckCircle,
  XCircle,
  ShieldAlert,
  GitPullRequest,
  RefreshCw
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from 'recharts';
import { api, Environment } from '../services/api';

export const ObservabilityView: React.FC = () => {
  const [logFilter, setLogFilter] = useState('ALL');
  const [selectedEnv, setSelectedEnv] = useState<number>(2); // Default to HML (2)
  const [envs, setEnvs] = useState<Environment[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState<any>(null);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    loadEnvs();
  }, []);

  useEffect(() => {
    if (selectedEnv) {
      loadData();
    }
  }, [selectedEnv]);

  const loadEnvs = async () => {
    try {
      const data = await api.getEnvs(1); // Default App
      setEnvs(data);
      if (data.length > 0 && !selectedEnv) setSelectedEnv(data[0].id);
    } catch (e) {
      console.error("Failed to load envs", e);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [logsData, eventsData, healthData, incidentsData, metricsData] = await Promise.all([
        api.getLogs(selectedEnv, '', '', 50),
        api.getEvents(selectedEnv),
        api.getHealth(selectedEnv),
        api.getIncidents(1),
        api.getMetrics(selectedEnv)
      ]);
      setLogs(logsData || []);
      setEvents(eventsData || []);
      setHealth(healthData || {});
      setIncidents(incidentsData || []);
      setMetrics(metricsData || []);
    } catch (e) {
      console.error("Failed to load observability data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!showCompare) {
      setShowCompare(true);
      // Compare HML (2) vs PROD (3) as default, or current vs next
      try {
        const diff = await api.getComparison(2, 3);
        setComparison(diff);
      } catch (e) {
        console.error("Diff failed", e);
      }
    } else {
      setShowCompare(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'deploy': return <GitCommit size={14} className="text-blue-500" />;
      case 'incident': return <ShieldAlert size={14} className="text-red-500" />;
      case 'secret-change': return <ShieldAlert size={14} className="text-amber-500" />;
      case 'work-link': return <GitPullRequest size={14} className="text-emerald-500" />;
      default: return <Activity size={14} className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
           {envs.map(env => (
             <button
               key={env.id}
               onClick={() => setSelectedEnv(env.id)}
               className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                 selectedEnv === env.id 
                   ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                   : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
               }`}
             >
               {env.name.toUpperCase()}
             </button>
           ))}
        </div>
        <div className="flex gap-2">
            <button 
              onClick={loadData}
              className="p-2 text-slate-500 hover:text-indigo-600 bg-white rounded-lg border border-slate-200"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <button 
              onClick={handleCompare}
              className={`px-4 py-2 rounded-lg font-bold text-sm border border-slate-200 transition-all ${
                showCompare ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-white text-slate-600'
              }`}
            >
              Compare HML vs PROD
            </button>
        </div>
      </div>

      {showCompare && comparison && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in slide-in-from-top-4">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity size={18} className="text-indigo-500"/> Environment Drift: {comparison.source_env.toUpperCase()} vs {comparison.target_env.toUpperCase()}
          </h3>
          
          <div className="mb-6 grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase mb-1">{comparison.source_env}</p>
               <div className="text-sm font-mono text-slate-700">{comparison.source_provider}</div>
               <div className="text-xs font-mono text-slate-500 mt-1 break-all">{comparison.source_config}</div>
            </div>
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase mb-1">{comparison.target_env}</p>
               <div className="text-sm font-mono text-slate-700">{comparison.target_provider}</div>
               <div className={`text-xs font-mono mt-1 break-all ${comparison.config_diff ? 'text-amber-600 bg-amber-50' : 'text-slate-500'}`}>
                 {comparison.target_config}
               </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Missing Secrets</h4>
              {comparison.secrets_diff?.length > 0 ? (
                <ul className="space-y-1">
                  {comparison.secrets_diff.map((s: string, i: number) => (
                    <li key={i} className="text-xs font-mono text-rose-500 bg-rose-50 px-2 py-1 rounded border border-rose-100">{s}</li>
                  ))}
                </ul>
              ) : <p className="text-xs text-emerald-500 flex items-center gap-1"><CheckCircle size={12}/> Synced</p>}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Missing Resources</h4>
              {comparison.resources_diff?.length > 0 ? (
                <ul className="space-y-1">
                  {comparison.resources_diff.map((s: string, i: number) => (
                    <li key={i} className="text-xs font-mono text-amber-500 bg-amber-50 px-2 py-1 rounded border border-amber-100">{s}</li>
                  ))}
                </ul>
              ) : <p className="text-xs text-emerald-500 flex items-center gap-1"><CheckCircle size={12}/> Synced</p>}
            </div>
          </div>
        </div>
      )}

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Status', value: health?.status || 'Unknown', trend: 'Live', icon: <Activity size={16}/>, color: health?.status === 'ok' ? 'text-emerald-500' : 'text-rose-500' },
          { label: 'Provider', value: health?.provider || 'Unknown', trend: 'Active', icon: <Server size={16}/>, color: 'text-indigo-500' },
          { label: 'Latency', value: '42ms', trend: '-12%', icon: <Zap size={16}/>, color: 'text-emerald-500' },
          { label: 'Errors', value: '0%', trend: 'Stable', icon: <AlertTriangle size={16}/>, color: 'text-emerald-500' },
        ].map((metric, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all">
            <div className="flex justify-between items-start mb-2">
              <div className={`p-2 rounded-xl bg-slate-50 ${metric.color}`}>{metric.icon}</div>
              <span className="text-[10px] font-black text-slate-400">{metric.trend}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{metric.label}</p>
            <p className="text-xl font-black text-slate-800 truncate">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Graph */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 size={18} className="text-indigo-500" /> Latency & Error Trends
            </h4>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics}>
                <defs>
                  <linearGradient id="colorLat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" fontSize={10} axisLine={false} tickLine={false} stroke="#94a3b8" />
                <YAxis fontSize={10} axisLine={false} tickLine={false} stroke="#94a3b8" />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Area type="monotone" dataKey="latency" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorLat)" />
                <Area type="monotone" dataKey="errors" stroke="#f43f5e" strokeWidth={2} fill="transparent" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Timeline Events */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Clock size={18} className="text-indigo-500" /> Event Timeline
          </h4>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
             {events.map(evt => (
               <div key={evt.id} className="relative pl-4 border-l-2 border-slate-100">
                 <div className="absolute -left-[5px] top-1 bg-white">
                   {getEventIcon(evt.type)}
                 </div>
                 <div className="mb-1 flex justify-between items-center">
                   <span className="text-[10px] font-bold uppercase text-slate-500">{evt.type}</span>
                   <span className="text-[10px] text-slate-400">{new Date(evt.created_at).toLocaleTimeString()}</span>
                 </div>
                 <p className="text-xs text-slate-700 font-medium leading-relaxed">{evt.message}</p>
                 {evt.actor && <span className="text-[10px] text-slate-400">by {evt.actor}</span>}
               </div>
             ))}
             {events.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No events found</p>}
          </div>
        </div>
      </div>

      {/* Incidents Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
            <ShieldAlert size={18} className="text-rose-500" /> Incidents & Impact Analysis
        </h4>
        <div className="space-y-4">
            {incidents.map(inc => (
                <div key={inc.id} className="p-4 rounded-xl bg-rose-50 border border-rose-100 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-black bg-rose-200 text-rose-700 px-2 py-0.5 rounded uppercase">{inc.severity}</span>
                            <h5 className="font-bold text-slate-800">{inc.title}</h5>
                        </div>
                        {inc.release && (
                            <div className="mt-2 text-sm text-slate-600">
                                <p className="font-mono text-xs text-slate-400 mb-1">Caused by Release: {inc.release.version}</p>
                                <div className="flex flex-wrap gap-2">
                                    {inc.release.work_items?.map((wi: any) => (
                                        <span key={wi.id} className="text-xs bg-white border border-rose-200 px-2 py-1 rounded text-slate-500">
                                            #{wi.id} {wi.title}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase">{inc.status}</p>
                        <p className="text-xs text-slate-400 mt-1">{new Date(inc.created_at).toLocaleString()}</p>
                    </div>
                </div>
            ))}
            {incidents.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No active incidents</p>}
        </div>
      </div>
      
      {/* Logs Terminal */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-900/50 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${health?.status === 'ok' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">Live Logs</h4>
            </div>
            <div className="h-4 w-px bg-white/10 mx-2" />
            <div className="flex gap-1">
              {['ALL', 'INFO', 'WARN', 'ERROR'].map(f => (
                <button 
                  key={f}
                  onClick={() => setLogFilter(f)}
                  className={`px-2 py-0.5 rounded text-[9px] font-black transition-all ${
                    logFilter === f ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" size={12} />
              <input type="text" placeholder="grep..." className="bg-slate-900 border border-white/5 rounded-lg pl-8 pr-3 py-1 text-[10px] font-mono text-slate-400 outline-none focus:border-indigo-500/50 w-32 transition-all" />
            </div>
          </div>
        </div>
        
        <div className="p-6 font-mono text-[13px] h-96 overflow-y-auto custom-scrollbar space-y-1.5">
          {logs.map((line, i) => (
             <div key={i} className="flex gap-4 border-b border-white/5 pb-1 mb-1 last:border-0">
                <span className="text-slate-600 shrink-0 select-none">{i+1}</span>
                <p className="text-slate-300 break-all">{line}</p>
             </div>
          ))}
          {logs.length === 0 && <p className="text-slate-600 italic">No logs available (or stream disconnected)</p>}
          <p className="text-indigo-500 animate-pulse mt-4">_</p>
        </div>
      </div>
    </div>
  );
};
