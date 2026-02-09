
import React from 'react';
import { Terminal, Shield, Lock, ArrowRight, Github } from 'lucide-react';
import { Button } from './common/Button';
import { TextField } from './common/TextField';

interface LoginViewProps {
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600 rounded-full blur-[128px]" />
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-600 rounded-2xl shadow-2xl shadow-indigo-500/20 mb-6">
            <Terminal size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">
            Nexus<span className="text-indigo-400">Flow</span>
          </h1>
          <p className="text-slate-400 font-medium">Enterprise Software Delivery Platform</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <TextField 
              label="E-mail Corporativo"
              placeholder="alice@nexusflow.io"
              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
              required
            />
            <TextField 
              label="Senha"
              type="password"
              placeholder="••••••••"
              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
              required
            />
            
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-xs text-slate-400 font-medium">Manter conectado</span>
              </label>
              <button type="button" className="text-xs text-indigo-400 font-bold hover:underline">Esqueceu a senha?</button>
            </div>

            <Button 
              fullWidth 
              size="lg" 
              className="py-4"
              disabled={loading}
              startIcon={loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ArrowRight size={18} />}
            >
              {loading ? 'Autenticando...' : 'Acessar Control Plane'}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-900 px-3 text-slate-500 font-bold">Ou continue com</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all text-white text-xs font-bold">
              <Github size={16} /> GitHub
            </button>
            <button className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all text-white text-xs font-bold">
              <Shield size={16} /> Okta / SSO
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-500 text-xs">
          © 2025 NexusFlow Infrastructure. <br />
          <span className="text-slate-600">Authorized personnel only. Logs are being monitored.</span>
        </p>
      </div>
    </div>
  );
};
