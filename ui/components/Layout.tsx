
import React from 'react';
import { NAV_ITEMS } from '../constants';
import { ViewType } from '../types';
import { Terminal, Plus } from 'lucide-react';
import { Breadcrumbs } from './common/Breadcrumbs';
import { UserMenu } from './UserMenu';
import { Button } from './common/Button';
import { NewProjectModal } from './NewProjectModal';

interface LayoutProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  onLogout: () => void;
  children: React.ReactNode;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  currentView, 
  setView, 
  onLogout, 
  children,
  isDarkMode,
  onToggleTheme 
}) => {
  const [isSidebarOpen] = React.useState(true);
  const [isNewProjectOpen, setIsNewProjectOpen] = React.useState(false);

  const getBreadcrumbs = () => {
    const activeItem = NAV_ITEMS.find(n => n.id === currentView);
    const label = activeItem?.label || 
                 (currentView === 'PROFILE' ? 'My Profile' : 
                  currentView === 'SETTINGS' ? 'System Settings' : 
                  currentView === 'DOCS' ? 'Documentation' : currentView);
    return ['NexusFlow', label];
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar - Fixed/Static */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 dark:bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-300 flex flex-col z-30 shadow-2xl relative`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <Terminal size={20} />
          </div>
          {isSidebarOpen && (
            <span className="font-black text-white tracking-tighter text-lg animate-in fade-in duration-300">
              Nexus<span className="text-indigo-400">Flow</span>
            </span>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar pt-4">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewType)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                currentView === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className={`shrink-0 ${currentView === item.id ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400 transition-colors'}`}>
                {item.icon}
              </span>
              {isSidebarOpen && (
                <span className="text-sm font-bold tracking-tight animate-in slide-in-from-left-2 duration-200">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">v2.5-flash-native</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0 z-20 transition-colors duration-300">
          <div className="flex items-center gap-6">
            <Breadcrumbs items={getBreadcrumbs()} />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-800/30">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Global Status: Active</span>
            </div>

            <Button size="sm" startIcon={<Plus size={16} />} onClick={() => setIsNewProjectOpen(true)}>
              New Project
            </Button>
            
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
            
            <UserMenu 
              onNavigate={setView} 
              onLogout={onLogout} 
              isDarkMode={isDarkMode} 
              onToggleTheme={onToggleTheme} 
            />
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      <NewProjectModal 
        isOpen={isNewProjectOpen} 
        onClose={() => setIsNewProjectOpen(false)} 
        onSuccess={(app) => {
          // Ideally refresh the app context, but for MVP just close
          // A full reload or context update would be better
          window.location.reload(); 
        }} 
      />
    </div>
  );
};
