/**
 * API Client for ETLab Backend
 */

import { useAuthStore } from '../stores/authStore';

const API_BASE = '/api';

// Get auth headers from auth store
function getAuthHeaders(): HeadersInit {
  const tokens = useAuthStore.getState().tokens;
  if (tokens?.access_token) {
    return {
      'Authorization': `Bearer ${tokens.access_token}`,
    };
  }
  return {};
}

// Types
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  pages: Page[];
  active_page_id?: string;
}

export interface WorkspaceOwnerInfo {
  id: string;
  name: string;
  email: string;
}

export interface WorkspaceListItem {
  id: string;
  name: string;
  description?: string;
  page_count: number;
  created_at: string;
  updated_at: string;
  my_role: 'owner' | 'editor' | 'viewer';
  owner?: WorkspaceOwnerInfo;  // Present when shared with you (you're not owner)
}

export interface Page {
  id: string;
  workspace_id?: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodes: any[];  // JSON blob from API, transformed to typed nodes in store
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  edges: any[];  // JSON blob from API, transformed to typed edges in store
  generated_code?: string;
  created_at: string;
  updated_at: string;
}

export interface SparkConnection {
  id: string;
  name: string;
  connection_type: string;
  master_url?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: Record<string, any>;  // Dynamic config object
  is_default: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Execution {
  id: string;
  page_id?: string;
  spark_connection_id?: string;
  code: string;
  status: string;
  started_at?: string;
  completed_at?: string;
  logs?: string;
  error_message?: string;
  created_at: string;
}

// API Error
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Helper for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new ApiError(response.status, error.detail || 'API request failed');
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// ============================================
// Workspace API
// ============================================

export const workspaceApi = {
  list: () => apiCall<WorkspaceListItem[]>('/workspaces'),

  get: (id: string) => apiCall<Workspace>(`/workspaces/${id}`),

  create: (data: { name: string; description?: string }) =>
    apiCall<Workspace>('/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { name?: string; description?: string }) =>
    apiCall<Workspace>(`/workspaces/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiCall<void>(`/workspaces/${id}`, { method: 'DELETE' }),

  export: (id: string) => apiCall<Workspace>(`/workspaces/${id}/export`),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  import: (data: { name: string; description?: string; pages: any[] }) =>
    apiCall<Workspace>('/workspaces/import', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ============================================
// Page API
// ============================================

export const pageApi = {
  list: (workspaceId: string) =>
    apiCall<Page[]>(`/workspaces/${workspaceId}/pages`),

  get: (pageId: string) => apiCall<Page>(`/pages/${pageId}`),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: (workspaceId: string, data: { name: string; nodes?: any[]; edges?: any[] }) =>
    apiCall<Page>(`/workspaces/${workspaceId}/pages`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: (pageId: string, data: { name?: string; nodes?: any[]; edges?: any[] }) =>
    apiCall<Page>(`/pages/${pageId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (pageId: string) =>
    apiCall<void>(`/pages/${pageId}`, { method: 'DELETE' }),

  duplicate: (pageId: string) =>
    apiCall<Page>(`/pages/${pageId}/duplicate`, { method: 'POST' }),
};

// ============================================
// Spark Connection API
// ============================================

export const sparkApi = {
  list: () => apiCall<SparkConnection[]>('/spark-connections'),

  get: (id: string) => apiCall<SparkConnection>(`/spark-connections/${id}`),

  create: (data: {
    name: string;
    connection_type: string;
    master_url?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config?: Record<string, any>;
    is_default?: boolean;
  }) =>
    apiCall<SparkConnection>('/spark-connections', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<SparkConnection>) =>
    apiCall<SparkConnection>(`/spark-connections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiCall<void>(`/spark-connections/${id}`, { method: 'DELETE' }),

  test: (id: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiCall<{ success: boolean; message: string; details?: any }>(
      `/spark-connections/${id}/test`,
      { method: 'POST' }
    ),

  setDefault: (id: string) =>
    apiCall<SparkConnection>(`/spark-connections/${id}/default`, {
      method: 'PUT',
    }),
};

// ============================================
// Execution API
// ============================================

export const executionApi = {
  list: (options?: { page_id?: string; status?: string; limit?: number }) => {
    const params = new URLSearchParams();
    if (options?.page_id) params.append('page_id', options.page_id);
    if (options?.status) params.append('status', options.status);
    if (options?.limit) params.append('limit', options.limit.toString());
    const query = params.toString();
    return apiCall<Execution[]>(`/executions${query ? `?${query}` : ''}`);
  },

  get: (id: string) => apiCall<Execution>(`/executions/${id}`),

  execute: (data: { code: string; page_id?: string; spark_connection_id?: string }) =>
    apiCall<Execution>('/execute', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getLogs: (id: string) =>
    apiCall<{ id: string; status: string; logs: string }>(`/executions/${id}/logs`),

  cancel: (id: string) =>
    apiCall<Execution>(`/executions/${id}/cancel`, { method: 'POST' }),
};

// ============================================
// Health API
// ============================================

export const healthApi = {
  check: () => apiCall<{ status: string; app: string; env: string }>('/health'),

  database: () =>
    apiCall<{ status: string; database: string; error?: string }>('/health/db'),

  spark: () =>
    apiCall<{ status: string; message: string; default_master: string }>('/health/spark'),
};

// ============================================
// Schema Definition API
// ============================================

export interface SchemaColumn {
  name: string;
  dataType: string;
  nullable: boolean;
  description?: string;
}

export interface SchemaDefinition {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  source_type: string;
  columns: SchemaColumn[];
  config?: Record<string, any>;
  is_favorite: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface SchemaListResponse {
  schemas: SchemaDefinition[];
  total: number;
}

export const schemaApi = {
  list: (workspaceId: string, options?: { source_type?: string; is_favorite?: boolean; tag?: string }) => {
    const params = new URLSearchParams();
    if (options?.source_type) params.append('source_type', options.source_type);
    if (options?.is_favorite !== undefined) params.append('is_favorite', options.is_favorite.toString());
    if (options?.tag) params.append('tag', options.tag);
    const query = params.toString();
    return apiCall<SchemaListResponse>(`/workspaces/${workspaceId}/schemas${query ? `?${query}` : ''}`);
  },

  get: (schemaId: string) => apiCall<SchemaDefinition>(`/schemas/${schemaId}`),

  create: (workspaceId: string, data: {
    name: string;
    description?: string;
    source_type: string;
    columns: SchemaColumn[];
    config?: Record<string, any>;
    is_favorite?: boolean;
    tags?: string[];
  }) =>
    apiCall<SchemaDefinition>(`/workspaces/${workspaceId}/schemas`, {
      method: 'POST',
      body: JSON.stringify({ ...data, workspace_id: workspaceId }),
    }),

  update: (schemaId: string, data: Partial<{
    name: string;
    description: string;
    source_type: string;
    columns: SchemaColumn[];
    config: Record<string, any>;
    is_favorite: boolean;
    tags: string[];
  }>) =>
    apiCall<SchemaDefinition>(`/schemas/${schemaId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (schemaId: string) =>
    apiCall<void>(`/schemas/${schemaId}`, { method: 'DELETE' }),

  duplicate: (schemaId: string) =>
    apiCall<SchemaDefinition>(`/schemas/${schemaId}/duplicate`, { method: 'POST' }),

  toggleFavorite: (schemaId: string) =>
    apiCall<SchemaDefinition>(`/schemas/${schemaId}/favorite`, { method: 'PATCH' }),

  // Load default/seed schemas for a workspace
  loadDefaults: (workspaceId: string) =>
    apiCall<{ loaded: number; schemas: SchemaDefinition[] }>(`/workspaces/${workspaceId}/schemas/defaults`, { method: 'POST' }),
};

// ============================================
// Airflow Integration API
// ============================================

export interface AirflowSettings {
  mode: 'docker' | 'external' | 'compose';
  docker_port: number;
  external_url?: string;
  external_username?: string;
  external_password?: string;
  auto_save: boolean;
  auto_start: boolean;
}

export interface AirflowStatus {
  status: 'stopped' | 'starting' | 'running' | 'error' | 'unknown';
  mode: 'docker' | 'external' | 'compose';
  url?: string;
  message?: string;
}

export interface DagFile {
  name: string;
  filename: string;
  modified: number;
}

export const airflowApi = {
  getStatus: () => apiCall<AirflowStatus>('/airflow/status'),

  start: () =>
    apiCall<{ success: boolean; message: string; url: string }>('/airflow/start', {
      method: 'POST',
    }),

  stop: () =>
    apiCall<{ success: boolean; message: string }>('/airflow/stop', {
      method: 'POST',
    }),

  getSettings: () => apiCall<AirflowSettings>('/airflow/settings'),

  updateSettings: (settings: AirflowSettings) =>
    apiCall<AirflowSettings>('/airflow/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  syncDag: (dagId: string, code: string) =>
    apiCall<{ success: boolean; file_path: string; message: string }>('/airflow/sync', {
      method: 'POST',
      body: JSON.stringify({ dag_id: dagId, code }),
    }),

  deleteDag: (dagId: string) =>
    apiCall<{ success: boolean; message: string }>(`/airflow/dag/${dagId}`, {
      method: 'DELETE',
    }),

  listDags: () => apiCall<{ dags: DagFile[] }>('/airflow/dags'),

  testConnection: (url: string, username?: string, password?: string) =>
    apiCall<{ success: boolean; message: string }>('/airflow/test-connection', {
      method: 'POST',
      body: JSON.stringify({ url, username, password }),
    }),
};

// ============================================
// DAG Definition API
// ============================================

export interface DagDefinition {
  id: string;
  workspace_id: string;
  page_id?: string;
  dag_id: string;
  name: string;
  description?: string;
  dag_config: Record<string, any>;
  tasks: Record<string, any>[];
  edges: Record<string, any>[];
  generated_code?: string;
  is_synced: boolean;
  last_synced_at?: string;
  sync_error?: string;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at?: string;
}

export interface DagExecution {
  id: string;
  dag_definition_id: string;
  dag_run_id?: string;
  execution_date?: string;
  status: string;
  started_at?: string;
  completed_at?: string;
  logs?: string;
  error_message?: string;
  task_states?: Record<string, any>;
  triggered_by?: string;
  created_at: string;
}

export interface DagListResponse {
  dags: DagDefinition[];
  total: number;
}

export interface DagExecutionListResponse {
  executions: DagExecution[];
  total: number;
}

export interface DagSyncResponse {
  success: boolean;
  message: string;
  file_path?: string;
  synced_at?: string;
}

export const dagApi = {
  // List DAGs in a workspace
  list: (workspaceId: string, options?: { is_active?: boolean }) => {
    const params = new URLSearchParams();
    if (options?.is_active !== undefined) params.append('is_active', options.is_active.toString());
    const query = params.toString();
    return apiCall<DagListResponse>(`/dags/workspace/${workspaceId}${query ? `?${query}` : ''}`);
  },

  // Get DAG by ID
  get: (dagId: string) => apiCall<DagDefinition>(`/dags/${dagId}`),

  // Get DAG by page ID
  getByPage: (pageId: string) => apiCall<DagDefinition>(`/dags/by-page/${pageId}`),

  // Create DAG
  create: (workspaceId: string, data: {
    dag_id: string;
    name: string;
    description?: string;
    page_id?: string;
    dag_config?: Record<string, any>;
    tasks?: Record<string, any>[];
    edges?: Record<string, any>[];
    generated_code?: string;
  }) =>
    apiCall<DagDefinition>(`/dags/workspace/${workspaceId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update DAG
  update: (dagId: string, data: Partial<{
    dag_id: string;
    name: string;
    description: string;
    dag_config: Record<string, any>;
    tasks: Record<string, any>[];
    edges: Record<string, any>[];
    generated_code: string;
    is_active: boolean;
  }>) =>
    apiCall<DagDefinition>(`/dags/${dagId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete DAG
  delete: (dagId: string) =>
    apiCall<void>(`/dags/${dagId}`, { method: 'DELETE' }),

  // Sync DAG to Airflow
  sync: (dagId: string, options?: { force?: boolean }) =>
    apiCall<DagSyncResponse>(`/dags/${dagId}/sync`, {
      method: 'POST',
      body: JSON.stringify(options || {}),
    }),

  // Trigger DAG execution
  trigger: (dagId: string) =>
    apiCall<DagExecution>(`/dags/${dagId}/trigger`, { method: 'POST' }),

  // List DAG executions
  listExecutions: (dagId: string, options?: { status?: string; limit?: number }) => {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.limit) params.append('limit', options.limit.toString());
    const query = params.toString();
    return apiCall<DagExecutionListResponse>(`/dags/${dagId}/executions${query ? `?${query}` : ''}`);
  },

  // Get execution details
  getExecution: (executionId: string) =>
    apiCall<DagExecution>(`/dags/executions/${executionId}`),
};
