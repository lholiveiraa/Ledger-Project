
import React from 'react';
import { Search, Book, Terminal, Shield, Rocket, ExternalLink, ChevronRight, HelpCircle } from 'lucide-react';
import { TextField } from './common/TextField';

export const DocsView: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = React.useState('intro');

  const topics = [
    { id: 'intro', label: 'Platform Overview', icon: <Book size={16} /> },
    { id: 'cli', label: 'CLI Reference', icon: <Terminal size={16} /> },
    { id: 'security', label: 'IAM & Secrets', icon: <Shield size={16} /> },
    { id: 'release', label: 'Release Lifecycle', icon: <Rocket size={16} /> },
    { id: 'support', label: 'Get Support', icon: <HelpCircle size={16} /> },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex h-[700px] animate-in fade-in duration-500">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-100 bg-slate-50/50 flex flex-col">
        <div className="p-6">
          <TextField placeholder="Search docs..." startIcon={<Search size={14}/>} className="bg-white" />
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {topics.map(topic => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${
                selectedTopic === topic.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {topic.icon} {topic.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-100">
           <a href="#" className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
             Developer API Docs <ExternalLink size={12}/>
           </a>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-12 custom-scrollbar">
        {selectedTopic === 'intro' && (
          <article className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-4">Welcome to NexusFlow</h2>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                The modern standard for software delivery. Orchestrate multi-cloud environments, versioned releases, and operational work items in a single, unified control plane.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 border border-slate-100 rounded-3xl bg-slate-50">
                 <h4 className="font-bold text-slate-800 mb-2">Immutable Releases</h4>
                 <p className="text-xs text-slate-500 leading-relaxed">Learn how NexusFlow packages your application into versioned artifacts that travel across environments.</p>
              </div>
              <div className="p-6 border border-slate-100 rounded-3xl bg-slate-50">
                 <h4 className="font-bold text-slate-800 mb-2">WorkOps Paradigm</h4>
                 <p className="text-xs text-slate-500 leading-relaxed">Discover how linking code changes directly to work items provides unprecedented traceability.</p>
              </div>
            </div>

            <section className="space-y-4">
               <h3 className="text-xl font-bold text-slate-800">Core Concepts</h3>
               <div className="space-y-2">
                 {[
                   'Apps: The root container for your source and configuration.',
                   'Environments: Logical clusters (Dev, HML, Prod) with strict isolation.',
                   'Releases: Immutable versions of an App ready for promotion.',
                   'Secrets: Environment-specific encrypted variables injected at runtime.'
                 ].map((text, i) => (
                   <div key={i} className="flex items-center gap-3 text-sm text-slate-600 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                      <ChevronRight size={14} className="text-indigo-500" /> {text}
                   </div>
                 ))}
               </div>
            </section>
          </article>
        )}

        {selectedTopic === 'cli' && (
          <article className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-4">Nexus CLI Reference</h2>
            <div className="bg-slate-950 p-6 rounded-2xl font-mono text-sm border border-slate-800">
              <p className="text-emerald-400 mb-2"># Install CLI</p>
              <p className="text-slate-300 mb-6">curl -sSL nexusflow.io/install | sh</p>
              
              <p className="text-emerald-400 mb-2"># Authenticate</p>
              <p className="text-slate-300 mb-6">nexus auth login</p>

              <p className="text-emerald-400 mb-2"># Create new release</p>
              <p className="text-slate-300">nexus release create --app portal-ui --version v1.5.0</p>
            </div>
            
            <section className="p-6 bg-amber-50 border border-amber-100 rounded-3xl flex gap-4">
               <HelpCircle className="text-amber-500 shrink-0" size={24} />
               <p className="text-sm text-amber-700 font-medium leading-relaxed">
                 Need help? You can always run <code className="bg-amber-100 px-1 rounded font-bold">nexus --help</code> for a list of all available global commands.
               </p>
            </section>
          </article>
        )}

        {selectedTopic === 'support' && (
           <article className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 text-center py-12">
              <div className="inline-flex items-center justify-center p-6 bg-indigo-50 rounded-full mb-6">
                 <HelpCircle size={48} className="text-indigo-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter">How can we help today?</h2>
              <p className="text-slate-500">Our support engineers are ready to assist with your infrastructure challenges.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 max-w-lg mx-auto">
                 <div className="p-6 border border-slate-100 rounded-3xl hover:border-indigo-200 hover:shadow-lg transition-all text-left">
                    <h4 className="font-bold text-slate-800 mb-1">Live Chat</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-4">Response time: ~5 mins</p>
                    <button className="text-xs font-bold text-indigo-600 hover:underline">Start Conversation</button>
                 </div>
                 <div className="p-6 border border-slate-100 rounded-3xl hover:border-indigo-200 hover:shadow-lg transition-all text-left">
                    <h4 className="font-bold text-slate-800 mb-1">Ticket System</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-4">Response time: ~2 hours</p>
                    <button className="text-xs font-bold text-indigo-600 hover:underline">Open New Case</button>
                 </div>
              </div>
           </article>
        )}
      </main>
    </div>
  );
};
