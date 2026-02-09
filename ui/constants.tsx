
import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Rocket, 
  ShieldCheck, 
  Activity, 
  Lock, 
  History,
  Users
} from 'lucide-react';
import { 
  WorkItem, 
  WorkItemType, 
  WorkItemStatus, 
  Release, 
  EnvironmentType, 
  Secret, 
  SystemEvent, 
  AppConfig,
  User,
  Role
} from './types';

export const NAV_ITEMS = [
  { id: 'DASHBOARD', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'WORK', label: 'WorkOps', icon: <Briefcase size={20} /> },
  { id: 'RELEASES', label: 'Releases', icon: <Rocket size={20} /> },
  { id: 'ENVIRONMENTS', label: 'Environments', icon: <ShieldCheck size={20} /> },
  { id: 'OBSERVABILITY', label: 'Observability', icon: <Activity size={20} /> },
  { id: 'SECRETS', label: 'Secrets', icon: <Lock size={20} /> },
  { id: 'IAM', label: 'Access Control', icon: <Users size={20} /> },
  { id: 'EVENTS', label: 'Audit Log', icon: <History size={20} /> },
];

/*
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alice Cooper', email: 'alice@nexusflow.io', role: 'Admin', status: 'ACTIVE', mfaEnabled: true, lastLogin: '10 mins ago' },
  { id: 'u2', name: 'Bob Martin', email: 'bob@nexusflow.io', role: 'Developer', status: 'ACTIVE', mfaEnabled: true, lastLogin: '2 hours ago' },
  { id: 'u3', name: 'Charlie Cloud', email: 'charlie@nexusflow.io', role: 'SRE Lead', status: 'ACTIVE', mfaEnabled: false, lastLogin: 'Yesterday' },
  { id: 'u4', name: 'Diana Ops', email: 'diana@nexusflow.io', role: 'Security', status: 'PENDING', mfaEnabled: false, lastLogin: 'Never' },
];

export const MOCK_ROLES: Role[] = [
  { id: 'r1', name: 'Admin', description: 'Full access to all resources and management', permissions: ['*'] },
  { id: 'r2', name: 'SRE Lead', description: 'Can manage clusters, releases and secrets', permissions: ['cluster:write', 'release:promote', 'secret:read', 'observability:read'] },
  { id: 'r3', name: 'Developer', description: 'Can create work items and promote to non-prod', permissions: ['work:write', 'release:create', 'env:dev:deploy'] },
];

export const MOCK_APP: AppConfig = {
  id: 'app-001',
  name: 'Customer-Facing Portal',
  repository: 'github.com/nexusflow/portal-ui',
  buildContext: './Dockerfile',
  currentReleases: {
    [EnvironmentType.DEV]: 'v1.4.2-rc1',
    [EnvironmentType.HML]: 'v1.4.1',
    [EnvironmentType.PROD]: 'v1.4.0',
  }
};

export const MOCK_WORK_ITEMS: WorkItem[] = [];
export const MOCK_RELEASES: Release[] = [];

export const MOCK_SECRETS: Secret[] = [];

export const MOCK_EVENTS: SystemEvent[] = [];
*/
