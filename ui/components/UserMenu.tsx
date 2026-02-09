
import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Shield, 
  LifeBuoy,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';
import { ViewType } from '../types';

interface UserMenuProps {
  onNavigate: (view: ViewType) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ 
  onNavigate, 
  onLogout, 
  isDarkMode, 
  onToggleTheme 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, text: 'Release v1.4.2 ready for HML', time: '2 mins ago', type: 'info' },
    { id: 2, text: 'Critical incident WI-104 assigned to you', time: '1 hour ago', type: 'error' },
    { id: 3, text: 'GCP Cluster scale-up completed', time: '3 hours ago', type: 'success' },
  ];

  const handleAction = (view: ViewType) => {
    onNavigate(view);
    setIsOpen(false);
    setShowNotifications(false);
  };

  return (
    <div className="flex items-center gap-4">
      {/* Theme Toggle */}
      <button
        onClick={onToggleTheme}
        className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
        title={isDarkMode ? 'Mudar para Light Mode' : 'Mudar para Dark Mode'}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Notifications Toggle */}
      <div className="relative" ref={notificationRef}>
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className={`p-2 rounded-xl transition-all relative ${
            showNotifications ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />
        </button>

        {showNotifications && (
          <div className="absolute top-full right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Operational Alerts</h4>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold cursor-pointer hover:underline">Clear all</span>
            </div>
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {notifications.map((n) => (
                <div key={n.id} className="p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                  <div className="flex gap-3">
                    <div className={`mt-0.5 ${
                      n.type === 'error' ? 'text-rose-500' : 
                      n.type === 'success' ? 'text-emerald-500' : 'text-indigo-500'
                    }`}>
                      {n.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{n.text}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-bold uppercase">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 text-center bg-slate-50/50 dark:bg-slate-800/50">
              <button 
                onClick={() => handleAction('NOTIFICATIONS')}
                className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-full"
              >
                View All Events
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Profile Menu */}
      <div className="relative" ref={menuRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-3 pl-2 pr-1 py-1 rounded-2xl transition-all border ${
            isOpen ? 'bg-indigo-50 dark:bg-slate-800 border-indigo-200 dark:border-slate-700 ring-4 ring-indigo-500/5' : 'bg-white dark:bg-slate-900 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Alice Cooper</p>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Principal Engineer</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-all overflow-hidden relative">
            <User size={20} />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
          </div>
          <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-3 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Organization</p>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Shield size={14} className="text-indigo-500" />
                <span className="text-xs font-bold">NexusFlow Enterprise</span>
              </div>
            </div>

            <div className="p-2">
              <button onClick={() => handleAction('PROFILE')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors text-left">
                <User size={16} className="text-slate-400" /> My Profile
              </button>
              <button onClick={() => handleAction('SETTINGS')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors text-left">
                <Settings size={16} className="text-slate-400" /> System Settings
              </button>
              <button onClick={() => handleAction('DOCS')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors text-left">
                <LifeBuoy size={16} className="text-slate-400" /> Documentation & Help
              </button>
            </div>

            <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
              <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/30 text-xs font-bold text-rose-600 dark:text-rose-400 transition-colors text-left">
                <LogOut size={16} /> Sair do Sistema
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
