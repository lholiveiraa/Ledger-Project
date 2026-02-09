
export enum WorkItemType {
  FEATURE = 'FEATURE',
  BUG = 'BUG',
  INCIDENT = 'INCIDENT'
}

export enum WorkItemStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  RELEASED = 'RELEASED'
}

export enum EnvironmentType {
  DEV = 'DEV',
  HML = 'HML',
  PROD = 'PROD'
}

export interface WorkItem {
  id: string;
  title: string;
  description: string;
  type: WorkItemType;
  status: WorkItemStatus;
  assignee: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  linkedReleaseId?: string;
  tags: string[];
  github_issue?: string;
}

export interface Release {
  version: string;
  createdAt: string;
  workItems: string[]; // IDs
  status: 'DRAFT' | 'READY' | 'DEPLOYED' | 'ROLLED_BACK';
  environments: Record<EnvironmentType, string | null>; // env -> timestamp
}

export interface Secret {
  id: string;
  name: string;
  description: string;
  lastUpdated: string;
  environments: EnvironmentType[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  mfaEnabled: boolean;
  lastLogin: string;
  avatar?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface SystemEvent {
  id: string;
  timestamp: string;
  message: string;
  type: 'SUCCESS' | 'INFO' | 'ERROR' | 'WARNING';
  actor: string;
  resourceId?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

export interface AppConfig {
  id: string;
  name: string;
  repository: string;
  buildContext: string;
  currentReleases: Record<EnvironmentType, string>;
}

export type ViewType = 'DASHBOARD' | 'WORK' | 'RELEASES' | 'ENVIRONMENTS' | 'OBSERVABILITY' | 'SECRETS' | 'EVENTS' | 'IAM' | 'PROFILE' | 'SETTINGS' | 'DOCS' | 'NOTIFICATIONS';
