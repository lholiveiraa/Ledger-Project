// Use relative URL to leverage Vite proxy in dev and same-domain in prod
export const API_URL = "/api";

export interface App {
  id: number;
  name: string;
  git_repo?: string;
  envs: Environment[];
}

export interface Environment {
  id: number;
  app_id: number;
  name: string;
  provider: string;
  config: string;
}

export interface Release {
  id: number;
  version: string;
  created_at: string;
  work_items?: WorkItem[];
}

export interface WorkItem {
  id: number;
  title: string;
  type: string;
  status: string;
  description: string;
  owner: string;
  github_issue?: string;
  created_at: string;
  releases?: Release[];
}

export interface Incident {
  id: number;
  title: string;
  status: string;
  severity: string;
  environment_id: number;
  created_at: string;
  release_id?: number;
  release?: Release & { work_items?: WorkItem[] };
}

export interface Secret {
  id: number;
  environment_id: number;
  key: string;
  is_reference: boolean;
  version: number;
  updated_by: string;
  created_at: string;
}

export interface Resource {
  id: number;
  environment_id: number;
  name: string;
  type: string;
  provider: string;
  status: string;
  config: string;
  created_at: string;
}

export interface EnvStatus {
    status: string;
    url?: string;
    replicas?: number;
    latest_revision?: string;
    traffic_split?: string;
    provider?: string;
}

export interface Deployment {
  id: number;
  release_id: number;
  environment_id: number;
  status: string;
  logs: string;
  created_at: string;
  release?: Release;
  environment?: Environment;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  last_login: string;
  avatar: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string; // JSON string of array
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  category: string;
}

export const api = {
  getUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_URL}/users`);
    return res.json();
  },
  getRoles: async (): Promise<Role[]> => {
    const res = await fetch(`${API_URL}/roles`);
    return res.json();
  },
  getNotifications: async (): Promise<Notification[]> => {
    const res = await fetch(`${API_URL}/notifications`);
    return res.json();
  },
  markRead: async (ids?: string[], all?: boolean) => {
    const res = await fetch(`${API_URL}/notifications`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'read', ids, all }),
    });
    return res.json();
  },
  deleteNotification: async (id: string) => {
    const res = await fetch(`${API_URL}/notifications`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', ids: [id] }),
    });
    return res.json();
  },
  getDeployments: async (appId: number): Promise<Deployment[]> => {
      const res = await fetch(`${API_URL}/deployments?app_id=${appId}`);
      return res.json();
  },
  getApps: async (): Promise<App[]> => {
    const res = await fetch(`${API_URL}/apps`);
    return res.json();
  },
  createApp: async (app: Partial<App>): Promise<App> => {
    const res = await fetch(`${API_URL}/apps`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(app),
    });
    return res.json();
  },
  getEnvs: async (appId: number): Promise<Environment[]> => {
    const res = await fetch(`${API_URL}/envs?app_id=${appId}`);
    return res.json();
  },
  getReleases: async (appId: number): Promise<Release[]> => {
    const res = await fetch(`${API_URL}/releases?app_id=${appId}`);
    return res.json();
  },
  deploy: async (envId: number, releaseId: number) => {
    const res = await fetch(`${API_URL}/deploy`, {
      method: "POST",
      body: JSON.stringify({ env_id: envId, release_id: releaseId }),
    });
    return res.json();
  },
  getWorkItems: async (appId: number): Promise<WorkItem[]> => {
    const res = await fetch(`${API_URL}/workitems?app_id=${appId}`);
    return res.json();
  },
  createWorkItem: async (item: Partial<WorkItem>) => {
    const res = await fetch(`${API_URL}/workitems`, {
      method: "POST",
      body: JSON.stringify(item),
    });
    return res.json();
  },
  getIncidents: async (appId: number): Promise<Incident[]> => {
    const res = await fetch(`${API_URL}/incidents?app_id=${appId}`);
    return res.json();
  },
  getSecrets: async (envId: number): Promise<Secret[]> => {
    const res = await fetch(`${API_URL}/secrets?env_id=${envId}`);
    return res.json();
  },
  setSecrets: async (envId: number, secrets: Record<string, string>) => {
    const res = await fetch(`${API_URL}/secrets?env_id=${envId}`, {
      method: "POST",
      body: JSON.stringify({ secrets }),
    });
    return res.json();
  },
  getResources: async (envId: number): Promise<Resource[]> => {
    const res = await fetch(`${API_URL}/resources?env_id=${envId}`);
    return res.json();
  },
  createResource: async (envId: number, resource: Partial<Resource>) => {
    const res = await fetch(`${API_URL}/resources?env_id=${envId}`, {
        method: "POST",
        body: JSON.stringify(resource),
    });
    return res.json();
  },
  getEnvStatus: async (envId: number): Promise<EnvStatus> => {
      const res = await fetch(`${API_URL}/env-status?env_id=${envId}`);
      return res.json();
  },
  getLogs: async (envId: number, service?: string, releaseId?: string, lines: number = 100): Promise<string[]> => {
    let url = `${API_URL}/logs?env_id=${envId}&lines=${lines}`;
    if (service) url += `&service=${service}`;
    if (releaseId) url += `&release_id=${releaseId}`;
    const res = await fetch(url);
    return res.json();
  },
  getEvents: async (envId?: number, service?: string, type?: string): Promise<any[]> => {
    let url = `${API_URL}/events?`;
    if (envId) url += `env_id=${envId}&`;
    if (service) url += `service=${service}&`;
    if (type) url += `type=${type}&`;
    const res = await fetch(url);
    return res.json();
  },
  getHealth: async (envId: number): Promise<any> => {
    const res = await fetch(`${API_URL}/health?env_id=${envId}`);
    return res.json();
  },
  getComparison: async (sourceId: number, targetId: number): Promise<any> => {
    const res = await fetch(`${API_URL}/compare?source=${sourceId}&target=${targetId}`);
    return res.json();
  },
  getMetrics: async (envId: number): Promise<any[]> => {
    const res = await fetch(`${API_URL}/metrics?env_id=${envId}`);
    return res.json();
  }
};
