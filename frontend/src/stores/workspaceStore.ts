import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Node, Edge } from '@xyflow/react';
import type { ETLNodeData, Page, Workspace, WorkflowPage, CodePage, DagPage, DagConfig, DagTaskNodeData } from '../types';
import { isWorkflowPage, isCodePage, isDagPage } from '../types';
import { workspaceApi, pageApi, dagApi } from '../services/api';
import { validateDag, type DagValidationResult } from '../utils/dagValidator';
import { useAuthStore } from './authStore';

// Helper to generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Auto-save interval (5 seconds)
const AUTO_SAVE_INTERVAL = 5000;

// Workspace refresh interval (30 seconds)
const WORKSPACE_REFRESH_INTERVAL = 30000;

// Track pending saves
let autoSaveTimer: ReturnType<typeof setInterval> | null = null;
let workspaceRefreshTimer: ReturnType<typeof setInterval> | null = null;
let pendingPageUpdates: Map<string, { nodes: any[]; edges: any[] }> = new Map();
let pendingDagUpdates: Map<string, { tasks: any[]; edges: any[]; dagConfig?: any }> = new Map();

// Helper to get current timestamp
const now = () => new Date().toISOString();

// Create a default workflow page
const createDefaultPage = (name: string = 'Untitled Page'): WorkflowPage => ({
  id: generateId(),
  name,
  type: 'workflow',
  nodes: [],
  edges: [],
  createdAt: now(),
  updatedAt: now(),
});

// Create a code page
const createCodePage = (
  name: string,
  code: string,
  sourceWorkflowId?: string,
  sourceWorkflowName?: string,
  sourceType?: 'workflow' | 'dag'
): CodePage => ({
  id: generateId(),
  name,
  type: 'code',
  code,
  language: 'python',
  sourceWorkflowId,
  sourceWorkflowName,
  sourceType,
  createdAt: now(),
  updatedAt: now(),
});

// Create a DAG page with default config
const createDagPage = (name: string): DagPage => ({
  id: generateId(),
  name,
  type: 'dag',
  dagConfig: {
    dagId: name.toLowerCase().replace(/\s+/g, '_'),
    description: '',
    schedule: {
      type: 'manual',
    },
    defaultArgs: {
      owner: 'airflow',
      retries: 3,
      retryDelayMinutes: 5,
      executionTimeoutMinutes: 60,
      emailOnFailure: false,
      emailOnRetry: false,
    },
    startDate: new Date().toISOString().split('T')[0],
    catchup: false,
    maxActiveRuns: 1,
    tags: [],
  },
  tasks: [],
  edges: [],
  createdAt: now(),
  updatedAt: now(),
});

// Create a default workspace
const createDefaultWorkspace = (name: string = 'My Workspace'): Workspace => {
  const defaultPage = createDefaultPage('ETL Page 1');
  return {
    id: generateId(),
    name,
    pages: [defaultPage],
    activePageId: defaultPage.id,
    createdAt: now(),
    updatedAt: now(),
  };
};

// Track DAG page to DagDefinition ID mapping
let dagPageToDagId: Map<string, string> = new Map();

// Auto-save function - syncs pending changes to API
const flushPendingUpdates = async (isApiMode: boolean, getWorkspaceStore?: () => any) => {
  if (!isApiMode) return;

  // Handle workflow page updates
  if (pendingPageUpdates.size > 0) {
    const updates = Array.from(pendingPageUpdates.entries());
    pendingPageUpdates.clear();

    for (const [pageId, data] of updates) {
      try {
        await pageApi.update(pageId, { nodes: data.nodes, edges: data.edges });
        // Auto-saved page
      } catch (err) {
        console.error(`Failed to auto-save page ${pageId}:`, err);
      }
    }
  }

  // Handle DAG page updates
  if (pendingDagUpdates.size > 0) {
    const dagUpdates = Array.from(pendingDagUpdates.entries());
    pendingDagUpdates.clear();

    for (const [pageId, data] of dagUpdates) {
      try {
        // Check if we have a DagDefinition ID for this page
        let dagDefId = dagPageToDagId.get(pageId);

        if (!dagDefId) {
          // Try to get or create the DagDefinition
          try {
            const existingDag = await dagApi.getByPage(pageId);
            dagDefId = existingDag.id;
            dagPageToDagId.set(pageId, dagDefId);
          } catch {
            // No existing DAG, create one now
            // Get the page info from the store to create a proper DagDefinition
            if (getWorkspaceStore) {
              const store = getWorkspaceStore();
              const workspace = store.getActiveWorkspace?.();
              if (workspace) {
                const dagPage = workspace.pages.find((p: any) => p.id === pageId && p.type === 'dag');
                if (dagPage) {
                  try {
                    const newDag = await dagApi.create(workspace.id, {
                      dag_id: dagPage.dagConfig?.dagId || dagPage.name.toLowerCase().replace(/\s+/g, '_'),
                      name: dagPage.name,
                      description: dagPage.dagConfig?.description || '',
                      page_id: pageId,
                      dag_config: dagPage.dagConfig || data.dagConfig || {},
                      tasks: data.tasks || [],
                      edges: data.edges || [],
                    });
                    dagDefId = newDag.id;
                    dagPageToDagId.set(pageId, dagDefId);
                    // Created DagDefinition during auto-save
                  } catch (createErr) {
                    console.error(`Failed to create DagDefinition for page ${pageId}:`, createErr);
                    continue;
                  }
                }
              }
            }
            if (!dagDefId) {
              // No DagDefinition found, skipping auto-save
              continue;
            }
          }
        }

        await dagApi.update(dagDefId, {
          tasks: data.tasks,
          edges: data.edges,
          ...(data.dagConfig && { dag_config: data.dagConfig }),
        });
        // Auto-saved DAG
      } catch (err) {
        console.error(`Failed to auto-save DAG for page ${pageId}:`, err);
      }
    }
  }
};

// Start auto-save timer
const startAutoSave = (getIsApiMode: () => boolean, getStore?: () => any) => {
  if (autoSaveTimer) return;

  autoSaveTimer = setInterval(() => {
    flushPendingUpdates(getIsApiMode(), getStore);
  }, AUTO_SAVE_INTERVAL);

  // Auto-save started
};

// Stop auto-save timer
const stopAutoSave = () => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
    // Auto-save stopped
  }
};

interface WorkspaceStore {
  // State
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  isLoading: boolean;
  isApiMode: boolean;
  error: string | null;
  dagValidation: DagValidationResult | null;

  // Computed
  getActiveWorkspace: () => Workspace | null;
  getActivePage: () => Page | null;
  getActiveNodes: () => Node<ETLNodeData>[];
  getActiveEdges: () => Edge[];
  canEdit: () => boolean;  // Returns true if user can edit current workspace

  // Initialization
  initialize: () => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
  reset: () => void;
  setApiMode: (enabled: boolean) => void;

  // Workspace actions
  createWorkspace: (name?: string) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  renameWorkspace: (workspaceId: string, name: string) => Promise<void>;
  setActiveWorkspace: (workspaceId: string) => Promise<void>;

  // Page actions
  createPage: (name?: string) => Promise<void>;
  deletePage: (pageId: string) => Promise<void>;
  renamePage: (pageId: string, name: string) => Promise<void>;
  setActivePage: (pageId: string) => void;
  duplicatePage: (pageId: string) => Promise<void>;

  // Code page actions
  createCodePageFromWorkflow: (workflowPageId: string, code: string) => void;
  updateCodePageContent: (pageId: string, code: string) => void;

  // DAG page actions
  createDagPage: (name?: string) => Promise<void>;
  updateDagConfig: (pageId: string, config: Partial<DagConfig>) => void;
  setDagTasks: (tasks: Node<DagTaskNodeData>[]) => void;
  setDagEdges: (edges: Edge[]) => void;
  deleteDagTask: (taskId: string) => void;
  runDagValidation: () => void;
  clearDagValidation: () => void;

  // Node/Edge actions for active page
  setNodes: (nodes: Node<ETLNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  updatePageContent: (nodes: Node<ETLNodeData>[], edges: Edge[]) => void;

  // Workspace import/export
  exportWorkspace: () => WorkspaceExport | null;
  importWorkspace: (data: WorkspaceExport) => void;
}

// Workspace export format
export interface WorkspaceExport {
  version: string;
  exportedAt: string;
  workspace: {
    name: string;
    pages: Page[];
  };
  schemas?: any[];
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => {
      // Initialize with default workspace
      const defaultWorkspace = createDefaultWorkspace();

      return {
        workspaces: [defaultWorkspace],
        activeWorkspaceId: defaultWorkspace.id,
        isLoading: false,
        isApiMode: false,
        error: null,
        dagValidation: null,

        // Computed getters
        getActiveWorkspace: () => {
          const { workspaces, activeWorkspaceId } = get();
          return workspaces.find(w => w.id === activeWorkspaceId) || null;
        },

        getActivePage: () => {
          const workspace = get().getActiveWorkspace();
          if (!workspace) return null;
          return workspace.pages.find(p => p.id === workspace.activePageId) || null;
        },

        getActiveNodes: () => {
          const page = get().getActivePage();
          if (!page || !isWorkflowPage(page)) return [];
          return page.nodes || [];
        },

        getActiveEdges: () => {
          const page = get().getActivePage();
          if (!page || !isWorkflowPage(page)) return [];
          return page.edges || [];
        },

        // Check if user can edit current workspace (owner or editor)
        canEdit: () => {
          const workspace = get().getActiveWorkspace();
          if (!workspace) return true; // Default to allow for local mode
          const role = workspace.myRole;
          // If no role set (local mode or legacy), allow editing
          if (!role) return true;
          // Owner and editor can edit, viewer cannot
          return role === 'owner' || role === 'editor';
        },

        // Initialize - try to connect to API (only if authenticated)
        initialize: async () => {
          set({ isLoading: true, error: null });

          // Stop any existing refresh timer
          if (workspaceRefreshTimer) {
            clearInterval(workspaceRefreshTimer);
            workspaceRefreshTimer = null;
          }

          // Check if user is authenticated
          const { isAuthenticated } = useAuthStore.getState();

          if (!isAuthenticated) {
            // Not logged in - use localStorage mode
            set({ isApiMode: false, isLoading: false });
            stopAutoSave();
            return;
          }

          try {
            // Try to fetch workspaces from API
            const apiWorkspaces = await workspaceApi.list();

            if (apiWorkspaces.length > 0) {
              // Fetch full workspace data for the first one
              const firstWorkspace = await workspaceApi.get(apiWorkspaces[0].id);
              const firstListItem = apiWorkspaces[0];

              const workspaces: Workspace[] = [{
                id: firstWorkspace.id,
                name: firstWorkspace.name,
                pages: firstWorkspace.pages.map(p => ({
                  id: p.id,
                  name: p.name,
                  type: 'workflow' as const,
                  nodes: p.nodes || [],
                  edges: p.edges || [],
                  createdAt: p.created_at,
                  updatedAt: p.updated_at,
                })),
                activePageId: firstWorkspace.active_page_id || firstWorkspace.pages[0]?.id,
                createdAt: firstWorkspace.created_at,
                updatedAt: firstWorkspace.updated_at,
                myRole: firstListItem.my_role,
                owner: firstListItem.owner,
              }];

              // Add other workspaces (without full page data yet)
              for (let i = 1; i < apiWorkspaces.length; i++) {
                const ws = apiWorkspaces[i];
                workspaces.push({
                  id: ws.id,
                  name: ws.name,
                  pages: [],
                  activePageId: '',
                  createdAt: ws.created_at,
                  updatedAt: ws.updated_at,
                  myRole: ws.my_role,
                  owner: ws.owner,
                });
              }

              set({
                workspaces,
                activeWorkspaceId: workspaces[0].id,
                isApiMode: true,
                isLoading: false,
              });

              // Start auto-save with store getter for DAG creation
              startAutoSave(() => get().isApiMode, () => get());

              // Start workspace refresh timer (every 30 seconds)
              workspaceRefreshTimer = setInterval(() => {
                get().refreshWorkspaces();
              }, WORKSPACE_REFRESH_INTERVAL);
            } else {
              // No workspaces in API, create one
              const newWorkspace = await workspaceApi.create({ name: 'My Workspace' });

              set({
                workspaces: [{
                  id: newWorkspace.id,
                  name: newWorkspace.name,
                  pages: newWorkspace.pages.map(p => ({
                    id: p.id,
                    name: p.name,
                    type: 'workflow' as const,
                    nodes: p.nodes || [],
                    edges: p.edges || [],
                    createdAt: p.created_at,
                    updatedAt: p.updated_at,
                  })),
                  activePageId: newWorkspace.active_page_id || newWorkspace.pages[0]?.id,
                  createdAt: newWorkspace.created_at,
                  updatedAt: newWorkspace.updated_at,
                  myRole: 'owner',
                }],
                activeWorkspaceId: newWorkspace.id,
                isApiMode: true,
                isLoading: false,
              });

              // Start auto-save with store getter for DAG creation
              startAutoSave(() => get().isApiMode, () => get());

              // Start workspace refresh timer (every 30 seconds)
              workspaceRefreshTimer = setInterval(() => {
                get().refreshWorkspaces();
              }, WORKSPACE_REFRESH_INTERVAL);
            }
          } catch (error) {
            // API not available, use localStorage mode
            set({ isApiMode: false, isLoading: false });
            stopAutoSave();
          }
        },

        // Refresh workspace list from API (called every 30 seconds)
        refreshWorkspaces: async () => {
          const { isApiMode } = get();
          if (!isApiMode) return;

          try {
            const apiWorkspaces = await workspaceApi.list();
            const currentWorkspaces = get().workspaces;
            const activeWorkspaceId = get().activeWorkspaceId;

            // Merge new workspaces with existing (preserve loaded page data)
            const updatedWorkspaces: Workspace[] = apiWorkspaces.map(ws => {
              const existing = currentWorkspaces.find(w => w.id === ws.id);
              if (existing && existing.pages.length > 0) {
                // Keep existing page data, update metadata
                return {
                  ...existing,
                  name: ws.name,
                  updatedAt: ws.updated_at,
                  myRole: ws.my_role,
                  owner: ws.owner,
                };
              }
              // New workspace or not loaded yet
              return {
                id: ws.id,
                name: ws.name,
                pages: existing?.pages || [],
                activePageId: existing?.activePageId || '',
                createdAt: ws.created_at,
                updatedAt: ws.updated_at,
                myRole: ws.my_role,
                owner: ws.owner,
              };
            });

            // Check if active workspace was removed (e.g., unshared)
            const activeStillExists = updatedWorkspaces.some(w => w.id === activeWorkspaceId);

            set({
              workspaces: updatedWorkspaces,
              activeWorkspaceId: activeStillExists
                ? activeWorkspaceId
                : (updatedWorkspaces[0]?.id || null),
            });
          } catch (error) {
            console.error('Failed to refresh workspaces:', error);
          }
        },

        setApiMode: (enabled) => {
          set({ isApiMode: enabled });
        },

        // Reset store to initial state (used on logout/user switch)
        reset: () => {
          stopAutoSave();
          if (workspaceRefreshTimer) {
            clearInterval(workspaceRefreshTimer);
            workspaceRefreshTimer = null;
          }
          pendingPageUpdates.clear();
          pendingDagUpdates.clear();
          dagPageToDagId.clear();

          const defaultWorkspace = createDefaultWorkspace();
          set({
            workspaces: [defaultWorkspace],
            activeWorkspaceId: defaultWorkspace.id,
            isLoading: false,
            isApiMode: false,
            error: null,
            dagValidation: null,
          });
        },

        // Workspace actions
        createWorkspace: async (name = 'New Workspace') => {
          const { isApiMode } = get();

          if (isApiMode) {
            try {
              const newWorkspace = await workspaceApi.create({ name });
              set(state => ({
                workspaces: [...state.workspaces, {
                  id: newWorkspace.id,
                  name: newWorkspace.name,
                  pages: newWorkspace.pages.map(p => ({
                    id: p.id,
                    name: p.name,
                    type: 'workflow' as const,
                    nodes: p.nodes || [],
                    edges: p.edges || [],
                    createdAt: p.created_at,
                    updatedAt: p.updated_at,
                  })),
                  activePageId: newWorkspace.active_page_id || newWorkspace.pages[0]?.id,
                  createdAt: newWorkspace.created_at,
                  updatedAt: newWorkspace.updated_at,
                }],
                activeWorkspaceId: newWorkspace.id,
              }));
            } catch (error) {
              console.error('Failed to create workspace:', error);
            }
          } else {
            const newWorkspace = createDefaultWorkspace(name);
            set(state => ({
              workspaces: [...state.workspaces, newWorkspace],
              activeWorkspaceId: newWorkspace.id,
            }));
          }
        },

        deleteWorkspace: async (workspaceId) => {
          const { isApiMode } = get();

          if (isApiMode) {
            try {
              await workspaceApi.delete(workspaceId);
            } catch (error) {
              console.error('Failed to delete workspace:', error);
              return;
            }
          }

          set(state => {
            const filtered = state.workspaces.filter(w => w.id !== workspaceId);
            const newActiveId = state.activeWorkspaceId === workspaceId
              ? (filtered[0]?.id || null)
              : state.activeWorkspaceId;

            if (filtered.length === 0) {
              const defaultWs = createDefaultWorkspace();
              return {
                workspaces: [defaultWs],
                activeWorkspaceId: defaultWs.id,
              };
            }

            return {
              workspaces: filtered,
              activeWorkspaceId: newActiveId,
            };
          });
        },

        renameWorkspace: async (workspaceId, name) => {
          const { isApiMode } = get();

          if (isApiMode) {
            try {
              await workspaceApi.update(workspaceId, { name });
            } catch (error) {
              console.error('Failed to rename workspace:', error);
              return;
            }
          }

          set(state => ({
            workspaces: state.workspaces.map(w =>
              w.id === workspaceId
                ? { ...w, name, updatedAt: now() }
                : w
            ),
          }));
        },

        setActiveWorkspace: async (workspaceId) => {
          const { isApiMode, workspaces } = get();

          // If using API, fetch full workspace data
          if (isApiMode) {
            const existing = workspaces.find(w => w.id === workspaceId);
            if (!existing || existing.pages.length === 0) {
              try {
                const fullWorkspace = await workspaceApi.get(workspaceId);
                set(state => ({
                  workspaces: state.workspaces.map(w =>
                    w.id === workspaceId
                      ? {
                          id: fullWorkspace.id,
                          name: fullWorkspace.name,
                          pages: fullWorkspace.pages.map(p => ({
                            id: p.id,
                            name: p.name,
                            type: 'workflow' as const,
                            nodes: p.nodes || [],
                            edges: p.edges || [],
                            createdAt: p.created_at,
                            updatedAt: p.updated_at,
                          })),
                          activePageId: fullWorkspace.active_page_id || fullWorkspace.pages[0]?.id,
                          createdAt: fullWorkspace.created_at,
                          updatedAt: fullWorkspace.updated_at,
                        }
                      : w
                  ),
                  activeWorkspaceId: workspaceId,
                }));
                return;
              } catch (error) {
                console.error('Failed to fetch workspace:', error);
              }
            }
          }

          set({ activeWorkspaceId: workspaceId });
        },

        // Page actions
        createPage: async (name) => {
          const { isApiMode } = get();
          const workspace = get().getActiveWorkspace();
          if (!workspace) return;

          const etlPageCount = workspace.pages.filter(p => isWorkflowPage(p)).length + 1;
          const pageName = name || `ETL Page ${etlPageCount}`;

          if (isApiMode) {
            try {
              const newPage = await pageApi.create(workspace.id, { name: pageName });
              set(state => ({
                workspaces: state.workspaces.map(w =>
                  w.id === workspace.id
                    ? {
                        ...w,
                        pages: [...w.pages, {
                          id: newPage.id,
                          name: newPage.name,
                          type: 'workflow' as const,
                          nodes: newPage.nodes || [],
                          edges: newPage.edges || [],
                          createdAt: newPage.created_at,
                          updatedAt: newPage.updated_at,
                        }],
                        activePageId: newPage.id,
                        updatedAt: now(),
                      }
                    : w
                ),
              }));
            } catch (error) {
              console.error('Failed to create page:', error);
            }
          } else {
            const newPage = createDefaultPage(pageName);
            set(state => ({
              workspaces: state.workspaces.map(w =>
                w.id === workspace.id
                  ? {
                      ...w,
                      pages: [...w.pages, newPage],
                      activePageId: newPage.id,
                      updatedAt: now(),
                    }
                  : w
              ),
            }));
          }
        },

        deletePage: async (pageId) => {
          const { isApiMode } = get();
          const workspace = get().getActiveWorkspace();
          if (!workspace || workspace.pages.length <= 1) return;

          // Get page info before deletion for DAG cleanup
          const page = workspace.pages.find(p => p.id === pageId);
          const wasDagPage = page && isDagPage(page);

          // Delete locally FIRST (immediate clear) - don't wait for API
          set(state => ({
            workspaces: state.workspaces.map(w => {
              if (w.id !== workspace.id) return w;

              const filtered = w.pages.filter(p => p.id !== pageId);
              const newActivePageId = w.activePageId === pageId
                ? filtered[0]?.id
                : w.activePageId;

              return {
                ...w,
                pages: filtered,
                activePageId: newActivePageId,
                updatedAt: now(),
              };
            }),
          }));

          // Clean up any pending updates for this page
          pendingPageUpdates.delete(pageId);
          pendingDagUpdates.delete(pageId);

          // Then delete from API in the background (don't block UI)
          if (isApiMode) {
            // Delete the page from API
            pageApi.delete(pageId).catch(error => {
              console.error('Failed to delete page from API:', error);
            });

            // If it was a DAG page, also delete the DagDefinition
            if (wasDagPage) {
              const dagDefId = dagPageToDagId.get(pageId);
              if (dagDefId) {
                dagApi.delete(dagDefId).catch(error => {
                  console.error('Failed to delete DagDefinition:', error);
                });
                dagPageToDagId.delete(pageId);
              }
            }
          }
        },

        renamePage: async (pageId, name) => {
          const { isApiMode } = get();
          const workspace = get().getActiveWorkspace();
          const page = workspace?.pages.find(p => p.id === pageId);

          if (isApiMode) {
            try {
              await pageApi.update(pageId, { name });
            } catch (error) {
              console.error('Failed to rename page:', error);
              return;
            }
          }

          // Generate new dagId from the new name
          const newDagId = name.toLowerCase().replace(/\s+/g, '_');

          set(state => ({
            workspaces: state.workspaces.map(w => ({
              ...w,
              pages: w.pages.map(p => {
                if (p.id !== pageId) return p;
                // If it's a DAG page, also update the dagConfig.dagId
                if (isDagPage(p)) {
                  return {
                    ...p,
                    name,
                    dagConfig: { ...p.dagConfig, dagId: newDagId },
                    updatedAt: now(),
                  };
                }
                return { ...p, name, updatedAt: now() };
              }),
              updatedAt: now(),
            })),
          }));

          // If it's a DAG page in API mode, also update the DagDefinition
          if (isApiMode && page && isDagPage(page)) {
            try {
              let dagDefId = dagPageToDagId.get(pageId);

              // If mapping doesn't exist, try to look it up
              if (!dagDefId) {
                try {
                  const existingDag = await dagApi.getByPage(pageId);
                  dagDefId = existingDag.id;
                  dagPageToDagId.set(pageId, dagDefId);
                } catch {
                  // No DagDefinition found for this page
                  console.warn('No DagDefinition found for DAG page:', pageId);
                }
              }

              if (dagDefId) {
                await dagApi.update(dagDefId, { name, dag_id: newDagId });
              }
            } catch (err) {
              console.error('Failed to update DagDefinition name:', err);
            }
          }
        },

        setActivePage: (pageId) => {
          const workspace = get().getActiveWorkspace();
          if (!workspace) return;

          set(state => ({
            workspaces: state.workspaces.map(w =>
              w.id === workspace.id
                ? { ...w, activePageId: pageId }
                : w
            ),
          }));
        },

        duplicatePage: async (pageId) => {
          const { isApiMode } = get();
          const workspace = get().getActiveWorkspace();
          if (!workspace) return;

          const page = workspace.pages.find(p => p.id === pageId);
          if (!page) return;

          if (isApiMode) {
            try {
              const duplicated = await pageApi.duplicate(pageId);
              set(state => ({
                workspaces: state.workspaces.map(w =>
                  w.id === workspace.id
                    ? {
                        ...w,
                        pages: [...w.pages, {
                          id: duplicated.id,
                          name: duplicated.name,
                          type: 'workflow' as const,
                          nodes: duplicated.nodes || [],
                          edges: duplicated.edges || [],
                          createdAt: duplicated.created_at,
                          updatedAt: duplicated.updated_at,
                        }],
                        activePageId: duplicated.id,
                        updatedAt: now(),
                      }
                    : w
                ),
              }));
            } catch (error) {
              console.error('Failed to duplicate page:', error);
            }
          } else {
            // Only duplicate workflow pages (code pages can't be duplicated this way)
            if (!isWorkflowPage(page)) return;

            const newPage: WorkflowPage = {
              id: generateId(),
              name: `${page.name} (Copy)`,
              type: 'workflow',
              nodes: page.nodes.map(n => ({ ...n, id: generateId() })),
              edges: [],
              createdAt: now(),
              updatedAt: now(),
            };

            set(state => ({
              workspaces: state.workspaces.map(w =>
                w.id === workspace.id
                  ? {
                      ...w,
                      pages: [...w.pages, newPage],
                      activePageId: newPage.id,
                      updatedAt: now(),
                    }
                  : w
              ),
            }));
          }
        },

        // Code page actions
        createCodePageFromWorkflow: (workflowPageId, code) => {
          const workspace = get().getActiveWorkspace();
          if (!workspace) return;

          const sourcePage = workspace.pages.find(p => p.id === workflowPageId);
          if (!sourcePage) return;

          // Determine source type based on page type
          const sourceType: 'workflow' | 'dag' = isDagPage(sourcePage) ? 'dag' : 'workflow';

          const newCodePage = createCodePage(
            `${sourcePage.name} - Code`,
            code,
            workflowPageId,
            sourcePage.name,
            sourceType
          );

          set(state => ({
            workspaces: state.workspaces.map(w =>
              w.id === workspace.id
                ? {
                    ...w,
                    pages: [...w.pages, newCodePage],
                    activePageId: newCodePage.id,
                    updatedAt: now(),
                  }
                : w
            ),
          }));
        },

        updateCodePageContent: (pageId, code) => {
          const workspace = get().getActiveWorkspace();
          if (!workspace) return;

          set(state => ({
            workspaces: state.workspaces.map(w =>
              w.id === workspace.id
                ? {
                    ...w,
                    pages: w.pages.map(p =>
                      p.id === pageId && isCodePage(p)
                        ? { ...p, code, updatedAt: now() }
                        : p
                    ),
                    updatedAt: now(),
                  }
                : w
            ),
          }));
        },

        // DAG page actions
        createDagPage: async (name) => {
          const { isApiMode } = get();
          const workspace = get().getActiveWorkspace();
          if (!workspace) return;

          const pageNumber = workspace.pages.filter(p => isDagPage(p)).length + 1;
          const pageName = name || `DAG ${pageNumber}`;
          const newDagPage = createDagPage(pageName);

          set(state => ({
            workspaces: state.workspaces.map(w =>
              w.id === workspace.id
                ? {
                    ...w,
                    pages: [...w.pages, newDagPage],
                    activePageId: newDagPage.id,
                    updatedAt: now(),
                  }
                : w
            ),
          }));

          // Create DagDefinition in database when in API mode
          if (isApiMode) {
            try {
              const dagDef = await dagApi.create(workspace.id, {
                dag_id: newDagPage.dagConfig.dagId,
                name: pageName,
                description: newDagPage.dagConfig.description || '',
                page_id: newDagPage.id,
                dag_config: newDagPage.dagConfig,
                tasks: [],
                edges: [],
              });
              // Map the page ID to the DagDefinition ID for auto-save
              dagPageToDagId.set(newDagPage.id, dagDef.id);
              // Created DagDefinition for new DAG page
            } catch (err) {
              console.error('Failed to create DagDefinition:', err);
            }
          }
        },

        updateDagConfig: (pageId, config) => {
          const { isApiMode } = get();
          const workspace = get().getActiveWorkspace();
          if (!workspace) return;

          // Get current page data for queueing
          const currentPage = workspace.pages.find(p => p.id === pageId);

          set(state => ({
            workspaces: state.workspaces.map(w =>
              w.id === workspace.id
                ? {
                    ...w,
                    pages: w.pages.map(p =>
                      p.id === pageId && isDagPage(p)
                        ? { ...p, dagConfig: { ...p.dagConfig, ...config }, updatedAt: now() }
                        : p
                    ),
                    updatedAt: now(),
                  }
                : w
            ),
          }));

          // Queue for auto-save
          if (isApiMode && currentPage && isDagPage(currentPage)) {
            const existing = pendingDagUpdates.get(pageId);
            pendingDagUpdates.set(pageId, {
              tasks: existing?.tasks || currentPage.tasks,
              edges: existing?.edges || currentPage.edges,
              dagConfig: { ...currentPage.dagConfig, ...config },
            });
          }
        },

        setDagTasks: (tasks) => {
          const { isApiMode } = get();
          const workspace = get().getActiveWorkspace();
          const page = get().getActivePage();
          if (!workspace || !page || !isDagPage(page)) return;

          set(state => ({
            workspaces: state.workspaces.map(w =>
              w.id === workspace.id
                ? {
                    ...w,
                    pages: w.pages.map(p =>
                      p.id === page.id && isDagPage(p)
                        ? { ...p, tasks, updatedAt: now() }
                        : p
                    ),
                    updatedAt: now(),
                  }
                : w
            ),
          }));

          // Queue for auto-save
          if (isApiMode) {
            const existing = pendingDagUpdates.get(page.id);
            pendingDagUpdates.set(page.id, {
              tasks,
              edges: existing?.edges || page.edges,
              dagConfig: existing?.dagConfig,
            });
          }

          // Run validation after task updates
          get().runDagValidation();
        },

        setDagEdges: (edges) => {
          const { isApiMode } = get();
          const workspace = get().getActiveWorkspace();
          const page = get().getActivePage();
          if (!workspace || !page || !isDagPage(page)) return;

          set(state => ({
            workspaces: state.workspaces.map(w =>
              w.id === workspace.id
                ? {
                    ...w,
                    pages: w.pages.map(p =>
                      p.id === page.id && isDagPage(p)
                        ? { ...p, edges, updatedAt: now() }
                        : p
                    ),
                    updatedAt: now(),
                  }
                : w
            ),
          }));

          // Queue for auto-save
          if (isApiMode) {
            const existing = pendingDagUpdates.get(page.id);
            pendingDagUpdates.set(page.id, {
              tasks: existing?.tasks || page.tasks,
              edges,
              dagConfig: existing?.dagConfig,
            });
          }

          // Run validation after edge updates
          get().runDagValidation();
        },

        deleteDagTask: (taskId) => {
          const { isApiMode } = get();
          const workspace = get().getActiveWorkspace();
          const page = get().getActivePage();
          if (!workspace || !page || !isDagPage(page)) return;

          // Remove task and any connected edges
          const newTasks = page.tasks.filter(t => t.id !== taskId);
          const newEdges = page.edges.filter(e => e.source !== taskId && e.target !== taskId);

          set(state => ({
            workspaces: state.workspaces.map(w =>
              w.id === workspace.id
                ? {
                    ...w,
                    pages: w.pages.map(p =>
                      p.id === page.id && isDagPage(p)
                        ? { ...p, tasks: newTasks, edges: newEdges, updatedAt: now() }
                        : p
                    ),
                    updatedAt: now(),
                  }
                : w
            ),
          }));

          // Queue for auto-save
          if (isApiMode) {
            pendingDagUpdates.set(page.id, {
              tasks: newTasks,
              edges: newEdges,
            });
          }

          // Re-run validation after task deletion
          get().runDagValidation();
        },

        runDagValidation: () => {
          const page = get().getActivePage();
          if (!page || !isDagPage(page)) {
            set({ dagValidation: null });
            return;
          }

          const validation = validateDag(page.tasks, page.edges);
          set({ dagValidation: validation });
        },

        clearDagValidation: () => {
          set({ dagValidation: null });
        },

        // Node/Edge actions - these update locally and queue for auto-save
        setNodes: (nodes) => {
          const { isApiMode } = get();
          const workspace = get().getActiveWorkspace();
          const page = get().getActivePage();
          if (!workspace || !page || !isWorkflowPage(page)) return;

          set(state => ({
            workspaces: state.workspaces.map(w =>
              w.id === workspace.id
                ? {
                    ...w,
                    pages: w.pages.map(p =>
                      p.id === page.id
                        ? { ...p, nodes, updatedAt: now() }
                        : p
                    ),
                    updatedAt: now(),
                  }
                : w
            ),
          }));

          // Queue for auto-save
          if (isApiMode) {
            const existing = pendingPageUpdates.get(page.id);
            pendingPageUpdates.set(page.id, {
              nodes,
              edges: existing?.edges || page.edges,
            });
          }
        },

        setEdges: (edges) => {
          const { isApiMode } = get();
          const workspace = get().getActiveWorkspace();
          const page = get().getActivePage();
          if (!workspace || !page || !isWorkflowPage(page)) return;

          set(state => ({
            workspaces: state.workspaces.map(w =>
              w.id === workspace.id
                ? {
                    ...w,
                    pages: w.pages.map(p =>
                      p.id === page.id
                        ? { ...p, edges, updatedAt: now() }
                        : p
                    ),
                    updatedAt: now(),
                  }
                : w
            ),
          }));

          // Queue for auto-save
          if (isApiMode) {
            const existing = pendingPageUpdates.get(page.id);
            pendingPageUpdates.set(page.id, {
              nodes: existing?.nodes || page.nodes,
              edges,
            });
          }
        },

        updatePageContent: (nodes, edges) => {
          const { isApiMode } = get();
          const workspace = get().getActiveWorkspace();
          const page = get().getActivePage();
          if (!workspace || !page || !isWorkflowPage(page)) return;

          set(state => ({
            workspaces: state.workspaces.map(w =>
              w.id === workspace.id
                ? {
                    ...w,
                    pages: w.pages.map(p =>
                      p.id === page.id
                        ? { ...p, nodes, edges, updatedAt: now() }
                        : p
                    ),
                    updatedAt: now(),
                  }
                : w
            ),
          }));

          // Queue for auto-save
          if (isApiMode) {
            pendingPageUpdates.set(page.id, { nodes, edges });
          }
        },

        // Export current workspace to JSON
        exportWorkspace: () => {
          const workspace = get().getActiveWorkspace();
          if (!workspace) return null;

          // Create a clean export with all pages
          const exportData: WorkspaceExport = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            workspace: {
              name: workspace.name,
              pages: workspace.pages.map(page => {
                // Strip internal IDs to make import cleaner
                if (isWorkflowPage(page)) {
                  return {
                    ...page,
                    id: page.id, // Keep ID for reference during import
                  };
                }
                if (isDagPage(page)) {
                  return {
                    ...page,
                    id: page.id,
                  };
                }
                if (isCodePage(page)) {
                  return {
                    ...page,
                    id: page.id,
                  };
                }
                return page;
              }),
            },
          };

          return exportData;
        },

        // Import workspace from JSON
        importWorkspace: (data: WorkspaceExport) => {
          try {
            // Validate the import data
            if (!data.workspace || !data.workspace.pages) {
              throw new Error('Invalid workspace export format');
            }

            const newWorkspaceId = generateId();
            const pageIdMapping = new Map<string, string>();

            // Regenerate IDs for all pages
            const pages: Page[] = data.workspace.pages.map(page => {
              const newPageId = generateId();
              pageIdMapping.set(page.id, newPageId);

              if (page.type === 'workflow' || !page.type) {
                // Workflow page - need to map node IDs for edges
                const workflowPage = page as WorkflowPage;
                const nodeIdMapping = new Map<string, string>();

                // First pass: create new node IDs
                const newNodes = workflowPage.nodes?.map(n => {
                  const newNodeId = generateId();
                  nodeIdMapping.set(n.id, newNodeId);
                  return { ...n, id: newNodeId };
                }) || [];

                // Second pass: update edge source/target with new node IDs
                const newEdges = workflowPage.edges?.map(e => ({
                  ...e,
                  id: generateId(),
                  source: nodeIdMapping.get(e.source) || e.source,
                  target: nodeIdMapping.get(e.target) || e.target,
                })) || [];

                return {
                  ...workflowPage,
                  id: newPageId,
                  type: 'workflow' as const,
                  nodes: newNodes,
                  edges: newEdges,
                  createdAt: now(),
                  updatedAt: now(),
                };
              }

              if (page.type === 'dag') {
                // DAG page - need to map task IDs for edges
                const dagPage = page as DagPage;
                const taskIdMapping = new Map<string, string>();

                // First pass: create new task IDs
                const newTasks = dagPage.tasks?.map(t => {
                  const newTaskId = generateId();
                  taskIdMapping.set(t.id, newTaskId);
                  return { ...t, id: newTaskId };
                }) || [];

                // Second pass: update edge source/target with new task IDs
                const newEdges = dagPage.edges?.map(e => ({
                  ...e,
                  id: generateId(),
                  source: taskIdMapping.get(e.source) || e.source,
                  target: taskIdMapping.get(e.target) || e.target,
                })) || [];

                return {
                  ...dagPage,
                  id: newPageId,
                  type: 'dag' as const,
                  tasks: newTasks,
                  edges: newEdges,
                  createdAt: now(),
                  updatedAt: now(),
                };
              }

              if (page.type === 'code') {
                // Code page
                const codePage = page as CodePage;
                return {
                  ...codePage,
                  id: newPageId,
                  type: 'code' as const,
                  // Update source workflow ID if it was mapped
                  sourceWorkflowId: codePage.sourceWorkflowId
                    ? (pageIdMapping.get(codePage.sourceWorkflowId) || codePage.sourceWorkflowId)
                    : undefined,
                  createdAt: now(),
                  updatedAt: now(),
                };
              }

              return page;
            });

            // Create the new workspace
            const newWorkspace: Workspace = {
              id: newWorkspaceId,
              name: `${data.workspace.name} (Imported)`,
              pages,
              activePageId: pages[0]?.id || '',
              createdAt: now(),
              updatedAt: now(),
            };

            // Add to workspaces and set as active
            set(state => ({
              workspaces: [...state.workspaces, newWorkspace],
              activeWorkspaceId: newWorkspaceId,
            }));

            // Workspace imported successfully
          } catch (error) {
            console.error('Failed to import workspace:', error);
            throw error;
          }
        },
      };
    },
    {
      name: 'etlab-workspaces',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        // Reset to fresh state on version change
        if (version < 2) {
          const workspaceId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const defaultPage: WorkflowPage = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: 'ETL Page 1',
            type: 'workflow',
            nodes: [],
            edges: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return {
            workspaces: [{
              id: workspaceId,
              name: 'My Workspace',
              pages: [defaultPage],
              activePageId: defaultPage.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }],
            activeWorkspaceId: workspaceId,
            isLoading: false,
            isApiMode: false,
            error: null,
          };
        }
        return persistedState;
      },
    }
  )
);
