
import React from 'react';
import { Tabs } from './common/Tabs';
import { Settings, Globe, Shield, Bell, Zap, Database, Terminal, Webhook } from 'lucide-react';
import { Switch } from './common/Switch';
import { TextField } from './common/TextField';
import { Button } from './common/Button';

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: <Settings size={14} /> },
    { id: 'infrastructure', label: 'Cluster Defaults', icon: <Globe size={14} /> },
    { id: 'security', label: 'Security Polices', icon: <Shield size={14} /> },
    { id: 'notifications', label: 'Integrations', icon: <Bell size={14} /> },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      
      <div className="p-8">
        {activeTab === 'general' && (
          <div className="max-w-2xl space-y-8 animate-in slide-in-from-left-4 duration-300">
            <section className="space-y-4">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Platform Identity</h4>
              <TextField label="Organization Name" value="NexusFlow Enterprise" />
              <TextField label="Support Contact Email" value="support@nexusflow.io" />
            </section>

            <section className="space-y-4 pt-6 border-t border-slate-100">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Performance & Data</h4>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Advanced AI Insights</p>
                    <p className="text-xs text-slate-500">Enable Gemini-powered operational analysis on all work items.</p>
                  </div>
                  <Switch checked={true} onChange={() => {}} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Auto-Scaling Preview</p>
                    <p className="text-xs text-slate-500">Show predictive scaling suggestions in the dashboard.</p>
                  </div>
                  <Switch checked={false} onChange={() => {}} />
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'infrastructure' && (
          <div className="max-w-2xl space-y-8 animate-in slide-in-from-left-4 duration-300">
            <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-2xl flex gap-4">
               <Database className="text-indigo-600 shrink-0" size={24} />
               <div>
                 <p className="text-sm font-bold text-indigo-900">Default Resource Limits</p>
                 <p className="text-xs text-indigo-700 mt-1">These settings will be applied to all new environments unless specified otherwise.</p>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <TextField label="Default CPU Limit (m)" value="500" startIcon={<Zap size={16}/>} />
              <TextField label="Default Memory Limit (Mi)" value="512" startIcon={<Database size={16}/>} />
            </div>
            
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">Strict Network Isolation</p>
                <p className="text-xs text-slate-500">Automatically create VPC Peering for new cloud connectors.</p>
              </div>
              <Switch checked={true} onChange={() => {}} />
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[
                 { name: 'Slack', status: 'Connected', icon: <Zap size={20}/> },
                 { name: 'Microsoft Teams', status: 'Disconnected', icon: <Webhook size={20}/> },
                 { name: 'Email SMTP', status: 'Connected', icon: <Bell size={20}/> },
                 { name: 'Custom Webhook', status: 'Connected', icon: <Terminal size={20}/> },
               ].map(service => (
                 <div key={service.name} className="p-5 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-indigo-200 transition-colors bg-slate-50/50">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-xl border border-slate-100 text-indigo-500">{service.icon}</div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{service.name}</p>
                        <p className={`text-[10px] font-black uppercase ${service.status === 'Connected' ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {service.status}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Configure</Button>
                 </div>
               ))}
             </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end gap-3">
          <Button variant="outlined">Discard Changes</Button>
          <Button>Update System Configuration</Button>
        </div>
      </div>
    </div>
  );
};
