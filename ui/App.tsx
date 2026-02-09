
import React, { useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { WorkBoard } from './components/WorkBoard';
import { ReleasePipeline } from './components/ReleasePipeline';
import { EnvironmentsView } from './components/EnvironmentsView';
import { IAMView } from './components/IAMView';
import { LoginView } from './components/LoginView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { DocsView } from './components/DocsView';
import { ObservabilityView } from './components/ObservabilityView';
import { SecretsView } from './components/SecretsView';
import { EventsView } from './components/EventsView';
import { NotificationsView } from './components/NotificationsView';
import { ViewType, WorkItem, WorkItemStatus } from './types';
import { api } from './services/api';
import { WorkItemModal } from './components/WorkItemModal';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('nexus-theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkItem | null>(null);
  const [modalInitialStatus, setModalInitialStatus] = useState<WorkItemStatus>(WorkItemStatus.TODO);

  useEffect(() => {
    loadWorkItems();
  }, [isAuthenticated]);

  const loadWorkItems = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await api.getWorkItems(1);
      setWorkItems(data);
    } catch (e) {
      console.error("Failed to load work items", e);
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nexus-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nexus-theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleOpenNewItemModal = (status: WorkItemStatus = WorkItemStatus.TODO) => {
    setEditingItem(null);
    setModalInitialStatus(status);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: WorkItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSaveWorkItem = async (itemData: Partial<WorkItem>) => {
    if (itemData.id) {
      // TODO: Implement update API
      setWorkItems(prev => prev.map(item => item.id === itemData.id ? (itemData as WorkItem) : item));
    } else {
      try {
        const newItem = await api.createWorkItem(itemData);
        // If API returns the item with ID, use it. Otherwise fall back to optimistic update or reload.
        // Assuming API returns the created item
        setWorkItems(prev => [newItem, ...prev]);
      } catch (e) {
        console.error("Failed to create work item", e);
      }
    }
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD': return <Dashboard />;
      case 'WORK': return <WorkBoard items={workItems} onEditItem={handleEditItem} onNewItemAtStatus={handleOpenNewItemModal} />;
      case 'RELEASES': return <ReleasePipeline />;
      case 'ENVIRONMENTS': return <EnvironmentsView />;
      case 'IAM': return <IAMView />;
      case 'PROFILE': return <ProfileView />;
      case 'SETTINGS': return <SettingsView />;
      case 'DOCS': return <DocsView />;
      case 'OBSERVABILITY': return <ObservabilityView />;
      case 'SECRETS': return <SecretsView />;
      case 'EVENTS': return <EventsView />;
      case 'NOTIFICATIONS': return <NotificationsView />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      setView={setCurrentView} 
      onLogout={handleLogout}
      isDarkMode={isDarkMode}
      onToggleTheme={toggleTheme}
    >
      {renderView()}
      
      <WorkItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveWorkItem}
        initialStatus={modalInitialStatus}
        editItem={editingItem}
      />
    </Layout>
  );
};

export default App;
