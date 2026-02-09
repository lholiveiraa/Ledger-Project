
import React, { useState, useEffect } from 'react';
import { api, Notification } from '../services/api';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Filter, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Clock,
  ArrowRight,
  Settings,
  MoreVertical
} from 'lucide-react';
import { Button } from './common/Button';
import { Tabs } from './common/Tabs';



export const NotificationsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error("Failed to load notifications", e);
    }
  };

  const tabs = [
    { id: 'all', label: 'All Activity' },
    { id: 'unread', label: 'Unread' },
    { id: 'critical', label: 'Critical' },
    { id: 'system', label: 'System' },
  ];

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'critical') return n.type === 'error' || n.type === 'warning';
    if (activeTab === 'system') return n.category === 'system' || n.category === 'security';
    return true;
  });

  const markAllRead = async () => {
    try {
      await api.markRead(undefined, true);
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      console.error("Failed to delete notification", e);
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="text-rose-500" size={18} />;
      case 'success': return <CheckCircle2 className="text-emerald-500" size={18} />;
      case 'warning': return <AlertCircle className="text-amber-500" size={18} />;
      default: return <Info className="text-indigo-500" size={18} />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Bell className="text-indigo-600" /> Notifications Center
          </h2>
          <p className="text-sm text-slate-500 font-medium">Manage alerts, events, and operational updates.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outlined" size="sm" startIcon={<CheckCheck size={16} />} onClick={markAllRead}>
            Mark all read
          </Button>
          <Button variant="ghost" size="sm" startIcon={<Settings size={16} />}>
            Alert Settings
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        <div className="border-b border-slate-100 flex items-center justify-between px-4">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Filter notifications..." 
              className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-transparent focus:border-indigo-200 rounded-xl outline-none transition-all w-48"
            />
          </div>
        </div>

        <div className="flex-1">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {filteredNotifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`group p-6 flex gap-5 transition-all hover:bg-slate-50/50 ${!notif.read ? 'bg-indigo-50/20' : ''}`}
                >
                  <div className="mt-1 shrink-0">
                    <div className={`p-2.5 rounded-2xl bg-white border border-slate-100 shadow-sm ${!notif.read ? 'ring-2 ring-indigo-500/10' : ''}`}>
                      {getIcon(notif.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h4 className={`text-sm font-bold ${!notif.read ? 'text-slate-900' : 'text-slate-600'}`}>
                          {notif.title}
                        </h4>
                        {!notif.read && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          {notif.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors">
                           <MoreVertical size={14} />
                         </button>
                         <button 
                          onClick={() => deleteNotification(notif.id)}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                         >
                           <Trash2 size={14} />
                         </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                       <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                         <Clock size={12} /> {formatTime(notif.time)}
                       </div>
                       <button className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest flex items-center gap-1">
                         View details <ArrowRight size={10} />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] text-center p-8">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                <Bell size={40} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">All caught up!</h3>
              <p className="text-slate-500 text-sm max-w-xs mt-2">
                No new notifications in this category. Take a moment to enjoy the silence.
              </p>
              <Button variant="outlined" className="mt-8" onClick={() => setActiveTab('all')}>
                View all activity
              </Button>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-center">
           <button className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">
             Load older notifications
           </button>
        </div>
      </div>
    </div>
  );
};
