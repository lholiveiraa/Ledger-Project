import React, { useState, useMemo, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter
} from 'lucide-react';
import { SystemEvent } from '../types';
import { api } from '../services/api';

export const EventsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'ERROR' | 'SUCCESS' | 'WARNING'>('ALL');
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
        const data = await api.getEvents();
        const adapted = data.map((e: any) => {
            let type: 'SUCCESS' | 'INFO' | 'ERROR' | 'WARNING' = 'INFO';
            if (e.type === 'incident') type = 'ERROR';
            if (e.type === 'rollback') type = 'WARNING';
            if (e.type === 'deploy') {
                if (e.message.includes('FAILED')) type = 'ERROR';
                else type = 'SUCCESS';
            }
            
            let metadata = {};
            try {
                metadata = JSON.parse(e.metadata || '{}');
            } catch {}

            return {
                id: e.id.toString(),
                timestamp: e.created_at,
                message: e.message,
                type: type,
                actor: e.actor || 'system',
                resourceId: e.release_id ? `Release #${e.release_id}` : undefined,
                metadata: metadata
            } as SystemEvent;
        });
        setEvents(adapted);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      const matchesSearch = ev.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            ev.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (ev.resourceId?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesType = typeFilter === 'ALL' || ev.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [searchTerm, typeFilter, events]);

  // Group by date logic
  const groupedEvents = useMemo(() => {
    const groups: Record<string, SystemEvent[]> = {};
    filteredEvents.forEach(ev => {
      const date = new Date(ev.timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
      const today = new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
      const key = date === today ? 'Today' : date;
      if (!groups[key]) groups[key] = [];
      groups[key].push(ev);
    });
    return groups;
  }, [filteredEvents]);

  const stats = {
    errors: events.filter(e => e.type === 'ERROR').length,
    warnings: events.filter(e => e.type === 'WARNING').length,
    success: events.filter(e => e.type === 'SUCCESS').length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Summary Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <History className="text-indigo-600" /> Audit Control Plane
          </h3>
          <p className="text-sm text-slate-500 font-medium">Immutable trace of all infrastructure and delivery operations.</p>
        </div>
        
        <div className="flex gap-3 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
           <div className="px-4 py-2 text-center">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Errors</p>
             <p className="text-sm font-bold text-rose-600">{stats.errors}</p>
           </div>
           <div className="w-px bg-slate-100 my-2" />
           <div className="px-4 py-2 text-center">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Warnings</p>
             <p className="text-sm font-bold text-amber-500">{stats.warnings}</p>
           </div>
           <div className="w-px bg-slate-100 my-2" />
           <div className="px-4 py-2 text-center">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Success</p>
             <p className="text-sm font-bold text-emerald-500">{stats.success}</p>
           </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Search by actor, message, resource ID or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['ALL', 'SUCCESS', 'WARNING', 'ERROR'].map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type as any)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  typeFilter === type 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <Button variant="outlined" startIcon={<Filter size={16} />}>Filter</Button>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-8">
        {loading ? (
             <div className="text-center py-12 text-slate-400">Loading events...</div>
        ) : Object.keys(groupedEvents).length > 0 ? (
            Object.entries(groupedEvents).map(([date, group]) => (
            <div key={date}>
                <div className="sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10 py-3 mb-4 border-b border-slate-200">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{date}</h4>
                </div>
                <div className="space-y-3">
                {group.map(event => (
                    <div key={event.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-start gap-4 group">
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                        event.type === 'ERROR' ? 'bg-rose-500' :
                        event.type === 'WARNING' ? 'bg-amber-500' :
                        event.type === 'SUCCESS' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                        <p className="font-bold text-slate-800 text-sm">{event.message}</p>
                        <span className="text-[10px] font-mono text-slate-400">{new Date(event.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium bg-slate-50 px-2 py-1 rounded-lg">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            {event.actor}
                        </div>
                        {event.resourceId && (
                            <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded-lg">
                            {event.resourceId}
                            </div>
                        )}
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            ))
        ) : (
            <div className="text-center py-12 text-slate-400">No events found matching your criteria.</div>
        )}
      </div>
    </div>
  );
};
