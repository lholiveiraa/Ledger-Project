
import React, { useEffect, useState } from 'react';
import { api, App, WorkItem } from '../services/api';
import { EnvironmentType } from '../types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Brain, ArrowUpRight, Cloud, 
  HardDrive, 
  Cpu, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Activity, 
  Rocket,
  Github
} from 'lucide-react';
import { getOpsInsights } from '../services/geminiService';

export const Dashboard: React.FC = () => {
  const [insight, setInsight] = useState<string>("Analyzing recent cluster activities...");
  const [apps, setApps] = useState<App[]>([]);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const appsData = await api.getApps();
        setApps(appsData);

        let workData: WorkItem[] = [];
        let eventsData: any[] = [];
        let m: any[] = [];

        if (appsData.length > 0) {
           const activeAppId = appsData[0].id;
           // Parallel fetch for dependent data
           const [wd, ed] = await Promise.all([
             api.getWorkItems(activeAppId),
             api.getEvents()
           ]);
           workData = wd;
           eventsData = ed;

           // Fetch metrics for first environment (usually dev or prod)
           if (appsData[0].envs && appsData[0].envs.length > 0) {
             try {
               m = await api.getMetrics(appsData[0].envs[0].id);
               setMetrics(m);
             } catch (e) {
               console.error("Failed to load metrics", e);
             }
           }

           getOpsInsights(`App ${appsData[0].name} has ${workData.length} active work items. System health is stable.`)
            .then(setInsight)
            .catch(() => setInsight("System is stable. No critical incidents detected."));
        } else {
          // Fallback if no app
          eventsData = await api.getEvents();
          setInsight("No apps configured yet. Create your first app via 'New Project'.");
        }

        setWorkItems(workData);
        setRecentEvents(eventsData.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to connect to Control Plane. Is it running?");
        setInsight("Connection to Control Plane failed.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading Control Plane data...</div>;
  }

  if (error) {
    return (
      <div className="p-8 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-800 flex items-center gap-3">
        <AlertTriangle />
        <div>
          <h3 className="font-bold">Connection Error</h3>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2">Check if Control Plane is running on port 8081.</p>
        </div>
      </div>
    );
  }

  const activeApp = apps[0]; // MVP: Show first app

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'done': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'doing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'bug': return <AlertCircle size={14} className="text-rose-500" />;
      case 'feature': return <CheckCircle size={14} className="text-emerald-500" />;
      default: return <Clock size={14} className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: AI Insight */}
      <div className="bg-indigo-900 dark:bg-indigo-950 text-white p-6 rounded-2xl shadow-xl flex items-start gap-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <Brain size={120} />
        </div>
        <div className="bg-indigo-500/30 p-3 rounded-xl">
          <Brain className="text-indigo-200" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Ops Pilot Assistant</h3>
          <p className="text-lg leading-relaxed font-medium">
            "{insight}"
          </p>
        </div>
      </div>

      {/* Environment Health Status */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Cloud size={20} className="text-indigo-500" /> Environment Health
            </h3>
            <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-2">
              App: 
              {activeApp ? (
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  {activeApp.name}
                  {activeApp.git_repo && (
                    <a 
                      href={`https://${activeApp.git_repo}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-slate-400 hover:text-indigo-500 transition-colors"
                      title={activeApp.git_repo}
                    >
                      <Github size={14} />
                    </a>
                  )}
                </span>
              ) : 'None'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeApp?.envs?.map((env) => (
              <div key={env.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    env.name === 'prod' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {env.name.toUpperCase()}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-green-500 shadow-sm" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold">Provider</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate" title={env.provider}>
                    {env.provider}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Status: Active</span>
                  <ArrowUpRight size={14} className="text-indigo-500" />
                </div>
              </div>
            )) || <div className="text-center text-slate-400 text-sm py-4 col-span-3">No environments configured</div>}
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Work Items Kanban Summary */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Cloud size={20} className="text-indigo-500" /> Active Work Items
            </h3>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {workItems.length} items
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['todo', 'doing', 'done'].map(status => (
              <div key={status} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-3">{status}</h4>
                <div className="space-y-3">
                  {workItems.filter(i => i.status === status).map(item => (
                    <div key={item.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 line-clamp-2">{item.title}</span>
                        {getTypeIcon(item.type)}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                         <span className="text-[10px] text-slate-400">#{item.id}</span>
                         {item.releases && item.releases.length > 0 && (
                           <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                             {item.releases[0].version}
                           </span>
                         )}
                      </div>
                    </div>
                  ))}
                  {workItems.filter(i => i.status === status).length === 0 && (
                    <p className="text-xs text-slate-400 italic">No items</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
           <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <HardDrive size={20} className="text-indigo-500" /> Infrastructure
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400"><Cpu size={16}/></div>
                  <span className="text-sm font-medium dark:text-slate-300">Compute Usage</span>
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">42%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-[42%]" />
              </div>
              
              <div className="pt-4 flex justify-between items-center text-sm border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Clusters</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">AWS (4), GCP (1)</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400">Global Region</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 font-mono">us-east-1</span>
              </div>
            </div>
        </div>
      </div>

      {/* Timeline & Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events Timeline */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
            <Clock size={20} className="text-indigo-500" /> Recent Events
          </h3>
          <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
             {recentEvents.length === 0 ? (
               <div className="text-center text-slate-400 py-8">No recent events found.</div>
             ) : (
               recentEvents.map(event => {
                 // Adapter for event type to color/icon
                 let typeColor = 'bg-indigo-500';
                 let typeIcon = <Activity size={12} className="text-white" />;
                 
                 if (event.type === 'incident' || event.type === 'error') {
                    typeColor = 'bg-rose-500';
                    typeIcon = <AlertTriangle size={12} className="text-white" />;
                 } else if (event.type === 'deploy' || event.type === 'success') {
                    typeColor = 'bg-emerald-500';
                    typeIcon = <Rocket size={12} className="text-white" />;
                 } else if (event.type === 'warning') {
                    typeColor = 'bg-amber-500';
                    typeIcon = <AlertTriangle size={12} className="text-white" />;
                 }

                 return (
                   <div key={event.id} className="relative pl-8">
                     <div className={`absolute left-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${typeColor} top-1 z-10`} />
                     <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                       <div className="flex justify-between items-start">
                         <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{event.message}</p>
                         <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                           {new Date(event.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </span>
                       </div>
                       <div className="flex items-center gap-2 mt-2">
                         <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                           {event.type}
                         </span>
                         {event.actor && (
                           <>
                             <span className="text-slate-300">•</span>
                             <span className="text-[10px] text-slate-500">by {event.actor}</span>
                           </>
                         )}
                       </div>
                     </div>
                   </div>
                 );
               })
             )}
          </div>
        </div>

        {/* Traffic Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Global Success Rate (%)</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-xs dark:text-slate-400">
                <div className="w-2 h-2 rounded-full bg-indigo-500" /> Success
              </div>
              <div className="flex items-center gap-2 text-xs dark:text-slate-400">
                <div className="w-2 h-2 rounded-full bg-rose-500" /> Latency
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.length > 0 ? metrics : []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis dataKey="name" fontSize={12} stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis fontSize={12} stroke="#94a3b8" axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    backgroundColor: 'var(--tw-bg-opacity, #fff)',
                    color: '#334155'
                  }}
                  itemStyle={{ color: '#6366f1' }}
                />
                <Line type="monotone" dataKey="success" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} />
                <Line type="monotone" dataKey="latency" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
