/**
 * Tests for Workspace Store
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { act } from '@testing-library/react'
import { useWorkspaceStore, type WorkspaceExport } from '../workspaceStore'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock authStore
vi.mock('../authStore', () => ({
  useAuthStore: {
    getState: () => ({
      isAuthenticated: false,
    }),
  },
}))

// Helper to reset store state
const resetStore = () => {
  // Create fresh default workspace
  useWorkspaceStore.setState({
    workspaces: [],
    activeWorkspaceId: null,
    isLoading: false,
    isApiMode: false,
    error: null,
    dagValidation: null,
  })
}

describe('workspaceStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetStore()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initial state', () => {
    it('should have default state', () => {
      const state = useWorkspaceStore.getState()
      expect(state.isLoading).toBe(false)
      expect(state.isApiMode).toBe(false)
      expect(state.error).toBeNull()
      expect(state.dagValidation).toBeNull()
    })
  })

  describe('setApiMode', () => {
    it('should set API mode', () => {
      act(() => {
        useWorkspaceStore.getState().setApiMode(true)
      })
      expect(useWorkspaceStore.getState().isApiMode).toBe(true)

      act(() => {
        useWorkspaceStore.getState().setApiMode(false)
      })
      expect(useWorkspaceStore.getState().isApiMode).toBe(false)
    })
  })

  describe('createWorkspace', () => {
    it('should create new workspace in localStorage mode', async () => {
      await act(async () => {
        await useWorkspaceStore.getState().createWorkspace('Test Workspace')
      })

      const state = useWorkspaceStore.getState()
      const workspace = state.workspaces.find(w => w.name === 'Test Workspace')
      expect(workspace).toBeDefined()
      expect(workspace?.name).toBe('Test Workspace')
      expect(workspace?.pages.length).toBeGreaterThan(0)
      expect(state.activeWorkspaceId).toBe(workspace?.id)
    })

    it('should create workspace with default name', async () => {
      await act(async () => {
        await useWorkspaceStore.getState().createWorkspace()
      })

      const state = useWorkspaceStore.getState()
      const workspace = state.workspaces.find(w => w.name === 'New Workspace')
      expect(workspace).toBeDefined()
    })
  })

  describe('deleteWorkspace', () => {
    it('should delete workspace', async () => {
      // Create two workspaces
      await act(async () => {
        await useWorkspaceStore.getState().createWorkspace('Workspace 1')
        await useWorkspaceStore.getState().createWorkspace('Workspace 2')
      })

      const workspacesBefore = useWorkspaceStore.getState().workspaces
      const ws1 = workspacesBefore.find(w => w.name === 'Workspace 1')!

      await act(async () => {
        await useWorkspaceStore.getState().deleteWorkspace(ws1.id)
      })

      const workspacesAfter = useWorkspaceStore.getState().workspaces
      expect(workspacesAfter.find(w => w.id === ws1.id)).toBeUndefined()
    })

    it('should create default workspace when deleting last one', async () => {
      // Create one workspace
      await act(async () => {
        await useWorkspaceStore.getState().createWorkspace('Only Workspace')
      })

      const workspace = useWorkspaceStore.getState().workspaces[0]

      await act(async () => {
        await useWorkspaceStore.getState().deleteWorkspace(workspace.id)
      })

      const state = useWorkspaceStore.getState()
      expect(state.workspaces.length).toBe(1)
      expect(state.activeWorkspaceId).toBeTruthy()
    })
  })

  describe('renameWorkspace', () => {
    it('should rename workspace', async () => {
      await act(async () => {
        await useWorkspaceStore.getState().createWorkspace('Old Name')
      })

      const workspace = useWorkspaceStore.getState().workspaces[0]

      await act(async () => {
        await useWorkspaceStore.getState().renameWorkspace(workspace.id, 'New Name')
      })

      const renamed = useWorkspaceStore.getState().workspaces.find(w => w.id === workspace.id)
      expect(renamed?.name).toBe('New Name')
    })
  })

  describe('setActiveWorkspace', () => {
    it('should set active workspace', async () => {
      await act(async () => {
        await useWorkspaceStore.getState().createWorkspace('Workspace 1')
        await useWorkspaceStore.getState().createWorkspace('Workspace 2')
      })

      const workspaces = useWorkspaceStore.getState().workspaces
      const ws1 = workspaces.find(w => w.name === 'Workspace 1')!

      await act(async () => {
        await useWorkspaceStore.getState().setActiveWorkspace(ws1.id)
      })

      expect(useWorkspaceStore.getState().activeWorkspaceId).toBe(ws1.id)
    })
  })

  describe('createPage', () => {
    it('should create new workflow page', async () => {
      await act(async () => {
        await useWorkspaceStore.getState().createWorkspace('Test')
      })

      await act(async () => {
        await useWorkspaceStore.getState().createPage('New Page')
      })

      const workspace = useWorkspaceStore.getState().getActiveWorkspace()
      const page = workspace?.pages.find(p => p.name === 'New Page')
      expect(page).toBeDefined()
      expect(page?.type).toBe('workflow')
    })

    it('should set new page as active', async () => {
      await act(async () => {
        await useWorkspaceStore.getState().createWorkspace('Test')
      })

      await act(async () => {
        await useWorkspaceStore.getState().createPage('New Page')
      })

      const workspace = useWorkspaceStore.getState().getActiveWorkspace()
      const page = workspace?.pages.find(p => p.name === 'New Page')
      expect(workspace?.activePageId).toBe(page?.id)
    })
  })

  describe('deletePage', () => {
    it('should delete page', async () => {
      await act(async () => {
        await useWorkspaceStore.getState().createWorkspace('Test')
        await useWorkspaceStore.getState().createPage('Page 1')
        await useWorkspaceStore.getState().createPage('Page 2')
      })

      const workspace = useWorkspaceStore.getState().getActiveWorkspace()!
      const page1 = workspace.pages.find(p => p.name === 'Page 1')!

      await act(async () => {
        await useWorkspaceStore.getState().deletePage(page1.id)
      })

      const updatedWorkspace = useWorkspaceStore.getState().getActiveWorkspace()
      expect(updatedWorkspace?.pages.find(p => p.id === page1.id)).toBeUndefined()
    })

    it('should not delete last page', async () => {
      await act(async () => {
        await useWorkspaceStore.getState().createWorkspace('Test')
      })

      const workspace = useWorkspaceStore.getState().getActiveWorkspace()!
      const pageCount = workspace.pages.length

      await act(async () => {
        await useWorkspaceStore.getState().deletePage(workspace.pages[0].id)
      })

      // Should still have same page (delete blocked)
      expect(useWorkspaceStore.getState().getActiveWorkspace()?.pages.length).toBe(pageCount)
    })
  })

  describe('renamePage', () => {
    it('should rename page', async () => {
      await act(async () => {
        await useWorkspaceStore.getState().createWorkspace('Test')
      })

      const workspace = useWorkspaceStore.getState().getActiveWorkspace()!
      const page = workspace.pages[0]

      await act(async () => {
        await useWorkspaceStore.getState().renamePage(page.id, 'Renamed Page')
      })

      const updatedPage = useWorkspaceStore.getState().getActiveWorkspace()?.pages.find(p => p.id === page.id)
      expect(updatedPage?.name).toBe('Renamed Page')
    })
  })

  describe('setActivePage', () => {
    it('should set active page', async () => {
      await act(async () => {
        await useWorkspaceStore.getState().createWorkspace('Test')
        await useWorkspaceStore.getState().createPage('Page 2')
      })

      const workspace = useWorkspaceStore.getState().getActiveWorkspace()!
      const page = workspace.pages[0]

      act(() => {
        useWorkspaceStore.getState().setActivePage(page.id)
      })

      expect(useWorkspaceStore.getState().getActiveWorkspace()?.activePageId).toBe(page.id)
    })
  })

  describe('duplicatePage', () => {
    it('should duplicate workflow page', async () => {
      await act(async () => {
        await useWorkspaceStore.getState().createWorkspace('Test')
      })

      const workspace = useWorkspaceStore.getState().getActiveWorkspace()!
      const originalPage = workspace.pages[0]

      await act(async () => {
        await useWorkspaceStore.getState().duplicatePage(originalPage.id)
      })

      const updatedWorkspace = useWorkspaceStore.getState().getActiveWorkspace()
      expect(updatedWorkspace?.pages.length).toBe(2)
      expect(updatedWorkspace?.pages.some(p => p.name.includes('(Copy)'))).toBe(true)
    })
  })

  describe('createCodePageFromWorkflow', () => {
    it('should create code page from workflow', async () => {
      await act(async () => {
        await useWorkspaceStore.getState().createWorkspace('Test')
      })

      const workspace = useWorkspaceStore.getState().getActiveWorkspace()!
      const workflowPage = workspace.pages[0]

      act(() => {
        useWorkspaceStore.getState().createCodePageFromWorkflow(workflowPage.id, '# Test Code')
      })

      const updatedWorkspace = useWorkspaceStore.getState().getActiveWorkspace()
      const codePage = updatedWorkspace?.pages.find(p => p.type === 'code')
      expect(codePage).toBeDefined()
      expect(codePage?.name).toContain('Code')
    })
  })

  describe('updateCodePageContent', () => {
    it('should update code page content', async () => {
      await act(async () => {
        await useWorkspaceStore.getState().createWorkspace('Test')
      })

      const workspace = useWorkspaceStore.getState().getActiveWorkspace()!
      const workflowPage = workspace.pages[0]

      act(() => {
        useWorkspaceStore.getState().createCodePageFromWorkflow(workflowPage.id, '# Original')
      })

      const codePage = useWorkspaceStore.getState().getActiveWorkspace()?.pages.find(p => p.type === 'code')!

      act(() => {
        useWorkspaceStore.getState().updateCodePageContent(codePage.id, '# Updated Code')
      })

      const updatedPage = useWorkspaceStore.getState().getActiveWorkspace()?.pages.find(p => p.id === codePage.id)
      expect((updatedPage as any)?.code).toBe('# Updated Code')
    })
  })

  describe('createDagPage', () => {
    it('should create DAG page', async () => {
      await act(async () => {
        await useWorkspaceStore.getState().createWorkspace('Test')
      })

      await act(async () => {
        await useWorkspaceStore.getState().createDagPage('My DAG')
      })

      const workspace = useWorkspaceStore.getState().getActiveWorkspace()
      const dagPage = workspace?.pages.find(p => p.type === 'dag')
      expect(dagPage).toBeDefined()
      expect(dagPage?.name).toBe('My DAG')
      expect((dagPage as any)?.dagConfig).toBeDefined()
    })
  })

  describe('updateDagConfig', () => {
    it('should update DAG config', async () => {
      await act(async () => {
        await useWorkspaceStore.getState().createWorkspace('Test')
        await useWorkspaceStore.getState().createDagPage('My DAG')
      })

      const dagPage = useWorkspaceStore.getState().getActiveWorkspace()?.pages.find(p => p.type === 'dag')!

      act(() => {
        useWorkspaceStore.getState().updateDagConfig(dagPage.id, {
          description: 'Updated description',
          catchup: true,
        })
      })

      const updated = useWorkspaceStore.getState().getActiveWorkspace()?.pages.find(p => p.id === dagPage.id) as any
      expect(updated?.dagConfig?.description).toBe('Updated description')
      expect(updated?.dagConfig?.catchup).toBe(true)
    })
  })

  describe('setNodes and setEdges', () => {
    it('should update nodes', async () => {
      await act(async () => {
        await useWorkspaceStore.getState().createWorkspace('Test')
      })

      const testNodes = [
        { id: '1', type: 'source', position: { x: 0, y: 0 }, data: { label: 'Test' } },
      ]

      act(() => {
        useWorkspaceStore.getState().setNodes(testNodes as any)
      })

      expect(useWorkspaceStore.getState().getActiveNodes()).toHaveLength(1)
    })

    it('should update edges', async () => {
      await act(async () => {
        await useWorkspaceStore.getState().createWorkspace('Test')
      })

      const testEdges = [{ id: 'e1', source: '1', target: '2' }]

      act(() => {
        useWorkspaceStore.getState().setEdges(testEdges as any)
      })

      expect(useWorkspaceStore.getState().getActiveEdges()).toHaveLength(1)
    })
  })

  describe('updatePageContent', () => {
    it('should update both nodes and edges', async () => {
      await act(async () => {
        await useWorkspaceStore.getState().createWorkspace('Test')
      })

      const testNodes = [
        { id: '1', type: 'source', position: { x: 0, y: 0 }, data: { label: 'Test' } },
        { id: '2', type: 'sink', position: { x: 100, y: 0 }, data: { label: 'Output' } },
      ]
      const testEdges = [{ id: 'e1', source: '1', target: '2' }]

      act(() => {
        useWorkspaceStore.getState().updatePageContent(testNodes as any, testEdges as any)
      })

      expect(useWorkspaceStore.getState().getActiveNodes()).toHaveLength(2)
      expect(useWorkspaceStore.getState().getActiveEdges()).toHaveLength(1)
    })
  })

  describe('DAG validation', () => {
    it('should run DAG validation', async () => {
      await act(async () => {
        await useWorkspaceStore.getState().createWorkspace('Test')
        await useWorkspaceStore.getState().createDagPage('Test DAG')
      })

      // Set active to DAG page
      const dagPage = useWorkspaceStore.getState().getActiveWorkspace()?.pages.find(p => p.type === 'dag')!
      act(() => {
        useWorkspaceStore.getState().setActivePage(dagPage.id)
      })

      act(() => {
        useWorkspaceStore.getState().runDagValidation()
      })

      // Empty DAG should be valid
      expect(useWorkspaceStore.getState().dagValidation).toBeDefined()
    })

    it('should clear DAG validation', async () => {
      await act(async () => {
        await useWorkspaceStore.getState().createWorkspace('Test')
        await useWorkspaceStore.getState().createDagPage('Test DAG')
      })

      const dagPage = useWorkspaceStore.getState().getActiveWorkspace()?.pages.find(p => p.type === 'dag')!
      act(() => {
        useWorkspaceStore.getState().setActivePage(dagPage.id)
        useWorkspaceStore.getState().runDagValidation()
      })

      act(() => {
        useWorkspaceStore.getState().clearDagValidation()
      })

      expect(useWorkspaceStore.getState().dagValidation).toBeNull()
    })
  })

  describe('exportWorkspace', () => {
    it('should export workspace', async () => {
      await act(async () => {
        await useWorkspaceStore.getState().createWorkspace('Export Test')
      })

      const exported = useWorkspaceStore.getState().exportWorkspace()

      expect(exported).toBeDefined()
      expect(exported?.version).toBe('1.0')
      expect(exported?.workspace.name).toBe('Export Test')
      expect(exported?.workspace.pages.length).toBeGreaterThan(0)
    })

    it('should return null when no active workspace', () => {
      resetStore()
      const exported = useWorkspaceStore.getState().exportWorkspace()
      expect(exported).toBeNull()
    })
  })

  describe('importWorkspace', () => {
    it('should import workspace', async () => {
      await act(async () => {
        await useWorkspaceStore.getState().createWorkspace('Original')
      })

      const importData: WorkspaceExport = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        workspace: {
          name: 'Imported Workspace',
          pages: [
            {
              id: 'page-1',
              name: 'Page 1',
              type: 'workflow',
              nodes: [{ id: 'n1', type: 'source', position: { x: 0, y: 0 }, data: { label: 'Source' } }],
              edges: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        },
      }

      act(() => {
        useWorkspaceStore.getState().importWorkspace(importData)
      })

      const workspaces = useWorkspaceStore.getState().workspaces
      const imported = workspaces.find(w => w.name === 'Imported Workspace (Imported)')
      expect(imported).toBeDefined()
    })

    it('should throw error for invalid import data', () => {
      expect(() => {
        useWorkspaceStore.getState().importWorkspace({} as any)
      }).toThrow('Invalid workspace export format')
    })
  })

  describe('computed getters', () => {
    it('getActiveWorkspace should return active workspace', async () => {
      await act(async () => {
        await useWorkspaceStore.getState().createWorkspace('Active Test')
      })

      const active = useWorkspaceStore.getState().getActiveWorkspace()
      expect(active).toBeDefined()
      expect(active?.name).toBe('Active Test')
    })

    it('getActiveWorkspace should return null when no active', () => {
      resetStore()
      const active = useWorkspaceStore.getState().getActiveWorkspace()
      expect(active).toBeNull()
    })

    it('getActivePage should return active page', async () => {
      await act(async () => {
        await useWorkspaceStore.getState().createWorkspace('Test')
      })

      const page = useWorkspaceStore.getState().getActivePage()
      expect(page).toBeDefined()
    })

    it('getActiveNodes should return empty array for non-workflow page', async () => {
      await act(async () => {
        await useWorkspaceStore.getState().createWorkspace('Test')
        await useWorkspaceStore.getState().createDagPage('DAG')
      })

      const dagPage = useWorkspaceStore.getState().getActiveWorkspace()?.pages.find(p => p.type === 'dag')!
      act(() => {
        useWorkspaceStore.getState().setActivePage(dagPage.id)
      })

      expect(useWorkspaceStore.getState().getActiveNodes()).toEqual([])
    })
  })
})
