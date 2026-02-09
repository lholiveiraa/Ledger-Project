
import React from 'react';
import { User, Mail, Shield, ShieldCheck, MapPin, Calendar, Clock, Rocket, CheckCircle2, History } from 'lucide-react';
import { Button } from './common/Button';
import { TextField } from './common/TextField';
import { Chip } from './common/Chip';

export const ProfileView: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Profile Card */}
        <div className="w-full md:w-80 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 bg-indigo-100 rounded-3xl border-4 border-white shadow-xl flex items-center justify-center text-indigo-600 font-black text-4xl">
                AC
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-xl border-4 border-white text-white shadow-lg">
                <ShieldCheck size={20} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Alice Cooper</h3>
            <p className="text-sm text-slate-500 mb-6">Principal SRE Engineer</p>
            
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <Chip label="Infrastructure" color="primary" size="xs" />
              <Chip label="Security" color="info" size="xs" />
              <Chip label="Admin" color="success" size="xs" />
            </div>

            <Button variant="outlined" fullWidth size="sm">Update Photo</Button>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Account Stats</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-600 text-xs font-medium">
                  <Rocket size={14} className="text-indigo-500" /> Releases Created
                </div>
                <span className="font-bold text-slate-800">42</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-600 text-xs font-medium">
                  <CheckCircle2 size={14} className="text-emerald-500" /> Items Completed
                </div>
                <span className="font-bold text-slate-800">128</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-600 text-xs font-medium">
                  <Clock size={14} className="text-amber-500" /> Platform Time
                </div>
                <span className="font-bold text-slate-800">840h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="flex-1 space-y-6 w-full">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextField label="Full Name" value="Alice Cooper" startIcon={<User size={16}/>} />
              <TextField label="Job Title" value="Principal SRE Engineer" startIcon={<Shield size={16}/>} />
              <TextField label="Email Address" value="alice@nexusflow.io" startIcon={<Mail size={16}/>} disabled />
              <TextField label="Location" value="San Francisco, CA" startIcon={<MapPin size={16}/>} />
            </div>
            
            <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end gap-3">
              <Button variant="outlined">Reset Defaults</Button>
              <Button>Save Changes</Button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Shield size={20} className="text-indigo-500" /> Security & Access
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-800">Multi-factor Authentication (MFA)</p>
                  <p className="text-xs text-slate-500">Adds an extra layer of security to your account.</p>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                  <CheckCircle2 size={16} /> Enabled
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-800">API Access Tokens</p>
                  <p className="text-xs text-slate-500">Manage personal tokens for CLI access.</p>
                </div>
                <Button variant="outlined" size="sm">Manage Keys</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
