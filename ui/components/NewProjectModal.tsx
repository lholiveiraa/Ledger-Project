import React, { useState } from 'react';
import { Dialog } from './common/Dialog';
import { Button } from './common/Button';
import { TextField } from './common/TextField';
import { api, App } from '../services/api';
import { Rocket, Box, Code, GitBranch, ArrowRight, CheckCircle, Server } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (app: App) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template: 'nextjs',
    gitRepo: '',
  });

  const templates = [
    { id: 'nextjs', name: 'Next.js App', icon: <Box className="text-white" size={24} />, color: 'bg-black', desc: 'React framework for production' },
    { id: 'go', name: 'Go Service', icon: <Server className="text-white" size={24} />, color: 'bg-cyan-600', desc: 'High performance API backend' },
    { id: 'python', name: 'Python API', icon: <Code className="text-white" size={24} />, color: 'bg-yellow-500', desc: 'FastAPI / Flask application' },
    { id: 'empty', name: 'Empty Project', icon: <GitBranch className="text-white" size={24} />, color: 'bg-slate-500', desc: 'Start from scratch' },
  ];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Simulate Git creation delay
      await new Promise(r => setTimeout(r, 1500));
      
      const newApp = await api.createApp({
        name: formData.name,
        git_repo: formData.gitRepo || `github.com/my-org/${formData.name}`,
      });
      onSuccess(newApp);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
          <Rocket size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Let's build something new</h3>
        <p className="text-slate-500 text-sm mt-2">Start your journey by naming your project.</p>
      </div>

      <TextField
        label="Project Name"
        value={formData.name}
        onChange={(v) => setFormData({ ...formData, name: v })}
        placeholder="e.g., my-awesome-shop"
        autoFocus
      />
      
      <TextField
        label="Description (Optional)"
        value={formData.description}
        onChange={(v) => setFormData({ ...formData, description: v })}
        placeholder="What is this project about?"
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Choose a Template</h3>
        <p className="text-slate-500 text-xs mb-4">We'll scaffold the repository structure for you.</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {templates.map((t) => (
          <div 
            key={t.id}
            onClick={() => setFormData({ ...formData, template: t.id })}
            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
              formData.template === t.id 
                ? 'border-indigo-500 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-500' 
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-sm ${t.color}`}>
              {t.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-700">{t.name}</h4>
              <p className="text-xs text-slate-500">{t.desc}</p>
            </div>
            {formData.template === t.id && <CheckCircle size={20} className="text-indigo-600" />}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Almost Ready!</h3>
        <p className="text-slate-500 text-sm">We are about to set up the following:</p>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center gap-3">
          <GitBranch size={16} className="text-slate-400" />
          <span className="text-sm text-slate-600">Repo: <strong className="text-slate-800">github.com/my-org/{formData.name}</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <Server size={16} className="text-slate-400" />
          <span className="text-sm text-slate-600">Environments: <strong className="text-slate-800">Local, Dev, HML, Prod</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <Box size={16} className="text-slate-400" />
          <span className="text-sm text-slate-600">Template: <strong className="text-slate-800">{templates.find(t => t.id === formData.template)?.name}</strong></span>
        </div>
      </div>

      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-yellow-800 text-xs flex gap-2">
        <div className="mt-0.5">⚠️</div>
        <p>This will initialize a new git repository and push the initial commit with the chosen template structure.</p>
      </div>
    </div>
  );

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      title={step === 1 ? "New Project" : step === 2 ? "Select Template" : "Review & Create"}
      maxWidth="md"
      footer={
        <div className="flex justify-between w-full">
          {step > 1 ? (
            <Button variant="outlined" onClick={() => setStep(step - 1)}>Back</Button>
          ) : (
            <div /> 
          )}
          
          {step < 3 ? (
            <Button 
              onClick={() => setStep(step + 1)} 
              disabled={!formData.name}
              endIcon={<ArrowRight size={16} />}
            >
              Next Step
            </Button>
          ) : (
            <Button onClick={handleSubmit} isLoading={loading}>
              Create Project
            </Button>
          )}
        </div>
      }
    >
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </Dialog>
  );
};
