
import React, { useState, useEffect } from 'react';
import { api, User, Role } from '../services/api';
import { Tabs } from './common/Tabs';
import { Chip } from './common/Chip';
import { Button } from './common/Button';
import { TextField } from './common/TextField';
import { Select } from './common/Select';
import { 
  Users, 
  Shield, 
  UserPlus, 
  Key, 
  Mail, 
  MoreVertical, 
  ShieldAlert, 
  Lock, 
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Dialog } from './common/Dialog';

export const IAMView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, rolesData] = await Promise.all([
        api.getUsers(),
        api.getRoles()
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (e) {
      console.error("Failed to load IAM data", e);
    }
  };

  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'Developer'
  });

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'users', label: 'Team Members', icon: <Users size={14} /> },
    { id: 'roles', label: 'Roles & Policies', icon: <Shield size={14} /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Access Control (IAM)</h3>
          <p className="text-sm text-slate-500 font-medium">Manage organization identity, roles, and resource access.</p>
        </div>
        <Button startIcon={<UserPlus size={16} />} onClick={() => setIsInviteOpen(true)}>
          Invite Member
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        
        <div className="p-6">
          {activeTab === 'users' ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                </div>
                <Button variant="outlined" startIcon={<Key size={14} />}>Manage SSO</Button>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User Profile</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Access Role</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Security</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700">{user.name}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Chip label={user.role} color="info" size="xs" variant="outlined" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {user.mfaEnabled ? (
                            <div className="flex items-center gap-1 text-emerald-600 font-bold text-[10px] uppercase">
                              <CheckCircle2 size={12} /> MFA Active
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-amber-500 font-bold text-[10px] uppercase">
                              <AlertCircle size={12} /> MFA Disabled
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Chip 
                          label={user.status} 
                          color={user.status === 'ACTIVE' ? 'success' : user.status === 'PENDING' ? 'warning' : 'error'} 
                          size="xs" 
                        />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map(role => (
                <div key={role.id} className="p-5 border border-slate-200 rounded-2xl hover:border-indigo-400 hover:shadow-lg transition-all group bg-slate-50/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-white rounded-lg border border-slate-100 text-indigo-500 shadow-sm">
                      <Shield size={20} />
                    </div>
                    <button className="text-slate-300 hover:text-indigo-500"><Lock size={16} /></button>
                  </div>
                  <h4 className="font-bold text-slate-800 mb-1">{role.name}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-6">{role.description}</p>
                  
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Capabilities</p>
                    <div className="flex flex-wrap gap-1.5">
                      {/* Handle permissions as string or array */}
                      {(typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions).map((p: string) => (
                        <span key={p} className="px-2 py-0.5 bg-white border border-slate-100 rounded text-[10px] font-mono text-slate-600">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">System Role</span>
                    <button className="text-xs font-bold text-indigo-600 hover:underline">Edit Policy</button>
                  </div>
                </div>
              ))}
              <button className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/20 transition-all gap-3">
                 <div className="p-3 rounded-full bg-slate-50"><Shield size={24}/></div>
                 <span className="text-sm font-bold">Define Custom Role</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      <Dialog 
        isOpen={isInviteOpen} 
        onClose={() => setIsInviteOpen(false)} 
        title="Invite Member to NexusFlow"
        footer={
          <>
            <Button variant="outlined" fullWidth onClick={() => setIsInviteOpen(false)}>Cancel</Button>
            <Button fullWidth startIcon={<Mail size={16} />} onClick={() => setIsInviteOpen(false)}>Send Invitation</Button>
          </>
        }
      >
        <div className="space-y-6">
          <TextField 
            label="E-mail Address" 
            placeholder="colleague@company.com" 
            startIcon={<Mail size={16}/>}
            value={inviteData.email}
            onChange={(e) => setInviteData({...inviteData, email: (e.target as HTMLInputElement).value})}
          />
          
          <Select 
            label="Assigned Access Role"
            value={inviteData.role}
            onChange={(val) => setInviteData({...inviteData, role: val})}
            options={roles.map(r => ({ label: r.name, value: r.name, description: r.description }))}
          />

          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex gap-3">
            <ShieldAlert className="text-amber-500 shrink-0" size={20} />
            <div>
              <p className="text-xs font-bold text-amber-700">Governance Warning</p>
              <p className="text-[10px] text-amber-600 leading-relaxed">Inviting a user with 'Admin' privileges will allow them to manage clusters and delete production secrets.</p>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
