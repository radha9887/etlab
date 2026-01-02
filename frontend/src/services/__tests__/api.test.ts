/**
 * Tests for API Service
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  workspaceApi,
  pageApi,
  sparkApi,
  executionApi,
  healthApi,
  schemaApi,
  airflowApi,
  dagApi,
  ApiError,
} from '../api'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock useAuthStore
vi.mock('../../stores/authStore', () => ({
  useAuthStore: {
    getState: () => ({
      tokens: {
        access_token: 'test_token',
        refresh_token: 'test_refresh',
      },
    }),
  },
}))

// Helper to create mock response
const createMockResponse = (data: any, ok = true, status = 200) => ({
  ok,
  status,
  json: vi.fn().mockResolvedValue(data),
})

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('ApiError', () => {
    it('should create ApiError with status and message', () => {
      const error = new ApiError(404, 'Not found')
      expect(error.status).toBe(404)
      expect(error.message).toBe('Not found')
      expect(error.name).toBe('ApiError')
    })
  })

  describe('workspaceApi', () => {
    it('list should fetch workspaces', async () => {
      const mockWorkspaces = [
        { id: '1', name: 'Workspace 1', page_count: 2 },
        { id: '2', name: 'Workspace 2', page_count: 1 },
      ]
      mockFetch.mockResolvedValueOnce(createMockResponse(mockWorkspaces))

      const result = await workspaceApi.list()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/workspaces',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test_token',
          }),
        })
      )
      expect(result).toEqual(mockWorkspaces)
    })

    it('get should fetch single workspace', async () => {
      const mockWorkspace = { id: '1', name: 'Test Workspace', pages: [] }
      mockFetch.mockResolvedValueOnce(createMockResponse(mockWorkspace))

      const result = await workspaceApi.get('1')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/workspaces/1',
        expect.anything()
      )
      expect(result).toEqual(mockWorkspace)
    })

    it('create should post new workspace', async () => {
      const mockWorkspace = { id: '1', name: 'New Workspace', pages: [] }
      mockFetch.mockResolvedValueOnce(createMockResponse(mockWorkspace))

      const result = await workspaceApi.create({ name: 'New Workspace' })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/workspaces',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'New Workspace' }),
        })
      )
      expect(result).toEqual(mockWorkspace)
    })

    it('update should put workspace changes', async () => {
      const mockWorkspace = { id: '1', name: 'Updated', pages: [] }
      mockFetch.mockResolvedValueOnce(createMockResponse(mockWorkspace))

      const result = await workspaceApi.update('1', { name: 'Updated' })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/workspaces/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: 'Updated' }),
        })
      )
    })

    it('delete should delete workspace', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(undefined, true, 204))

      await workspaceApi.delete('1')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/workspaces/1',
        expect.objectContaining({ method: 'DELETE' })
      )
    })

    it('export should fetch workspace export', async () => {
      const mockExport = { name: 'Test', pages: [] }
      mockFetch.mockResolvedValueOnce(createMockResponse(mockExport))

      const result = await workspaceApi.export('1')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/workspaces/1/export',
        expect.anything()
      )
      expect(result).toEqual(mockExport)
    })

    it('import should import workspace data', async () => {
      const mockWorkspace = { id: '1', name: 'Imported', pages: [] }
      mockFetch.mockResolvedValueOnce(createMockResponse(mockWorkspace))

      const result = await workspaceApi.import({ name: 'Imported', pages: [] })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/workspaces/import',
        expect.objectContaining({ method: 'POST' })
      )
    })
  })

  describe('pageApi', () => {
    it('list should fetch pages for workspace', async () => {
      const mockPages = [{ id: '1', name: 'Page 1', nodes: [], edges: [] }]
      mockFetch.mockResolvedValueOnce(createMockResponse(mockPages))

      const result = await pageApi.list('workspace-1')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/workspaces/workspace-1/pages',
        expect.anything()
      )
      expect(result).toEqual(mockPages)
    })

    it('get should fetch single page', async () => {
      const mockPage = { id: '1', name: 'Page 1', nodes: [], edges: [] }
      mockFetch.mockResolvedValueOnce(createMockResponse(mockPage))

      const result = await pageApi.get('1')

      expect(mockFetch).toHaveBeenCalledWith('/api/pages/1', expect.anything())
    })

    it('create should post new page', async () => {
      const mockPage = { id: '1', name: 'New Page', nodes: [], edges: [] }
      mockFetch.mockResolvedValueOnce(createMockResponse(mockPage))

      const result = await pageApi.create('workspace-1', { name: 'New Page' })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/workspaces/workspace-1/pages',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'New Page' }),
        })
      )
    })

    it('update should put page changes', async () => {
      const mockPage = { id: '1', name: 'Updated', nodes: [], edges: [] }
      mockFetch.mockResolvedValueOnce(createMockResponse(mockPage))

      const result = await pageApi.update('1', { name: 'Updated' })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/pages/1',
        expect.objectContaining({
          method: 'PUT',
        })
      )
    })

    it('delete should delete page', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(undefined, true, 204))

      await pageApi.delete('1')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/pages/1',
        expect.objectContaining({ method: 'DELETE' })
      )
    })

    it('duplicate should post to duplicate endpoint', async () => {
      const mockPage = { id: '2', name: 'Page 1 (Copy)', nodes: [], edges: [] }
      mockFetch.mockResolvedValueOnce(createMockResponse(mockPage))

      const result = await pageApi.duplicate('1')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/pages/1/duplicate',
        expect.objectContaining({ method: 'POST' })
      )
    })
  })

  describe('sparkApi', () => {
    it('list should fetch spark connections', async () => {
      const mockConnections = [{ id: '1', name: 'Local Spark' }]
      mockFetch.mockResolvedValueOnce(createMockResponse(mockConnections))

      const result = await sparkApi.list()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/spark-connections',
        expect.anything()
      )
    })

    it('create should post new connection', async () => {
      const mockConnection = { id: '1', name: 'New', connection_type: 'local' }
      mockFetch.mockResolvedValueOnce(createMockResponse(mockConnection))

      await sparkApi.create({ name: 'New', connection_type: 'local' })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/spark-connections',
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('test should test connection', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ success: true, message: 'Connected' })
      )

      const result = await sparkApi.test('1')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/spark-connections/1/test',
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.success).toBe(true)
    })

    it('setDefault should set default connection', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ id: '1', is_default: true }))

      await sparkApi.setDefault('1')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/spark-connections/1/default',
        expect.objectContaining({ method: 'PUT' })
      )
    })
  })

  describe('executionApi', () => {
    it('list should fetch executions with options', async () => {
      const mockExecutions = [{ id: '1', status: 'completed' }]
      mockFetch.mockResolvedValueOnce(createMockResponse(mockExecutions))

      await executionApi.list({ page_id: 'p1', status: 'completed', limit: 10 })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/executions?page_id=p1&status=completed&limit=10',
        expect.anything()
      )
    })

    it('list should work without options', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse([]))

      await executionApi.list()

      expect(mockFetch).toHaveBeenCalledWith('/api/executions', expect.anything())
    })

    it('execute should post code execution', async () => {
      const mockExecution = { id: '1', status: 'pending' }
      mockFetch.mockResolvedValueOnce(createMockResponse(mockExecution))

      await executionApi.execute({ code: 'print("hello")' })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/execute',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ code: 'print("hello")' }),
        })
      )
    })

    it('getLogs should fetch execution logs', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ id: '1', logs: 'Output...' })
      )

      const result = await executionApi.getLogs('1')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/executions/1/logs',
        expect.anything()
      )
    })

    it('cancel should cancel execution', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ id: '1', status: 'cancelled' })
      )

      await executionApi.cancel('1')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/executions/1/cancel',
        expect.objectContaining({ method: 'POST' })
      )
    })
  })

  describe('healthApi', () => {
    it('check should return health status', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ status: 'healthy', app: 'etlab' })
      )

      const result = await healthApi.check()

      expect(mockFetch).toHaveBeenCalledWith('/api/health', expect.anything())
      expect(result.status).toBe('healthy')
    })

    it('database should return database health', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ status: 'healthy', database: 'postgresql' })
      )

      const result = await healthApi.database()

      expect(mockFetch).toHaveBeenCalledWith('/api/health/db', expect.anything())
    })

    it('spark should return spark health', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ status: 'healthy', message: 'Spark available' })
      )

      const result = await healthApi.spark()

      expect(mockFetch).toHaveBeenCalledWith('/api/health/spark', expect.anything())
    })
  })

  describe('schemaApi', () => {
    it('list should fetch schemas with options', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ schemas: [], total: 0 })
      )

      await schemaApi.list('workspace-1', { source_type: 'csv', is_favorite: true })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/workspaces/workspace-1/schemas?source_type=csv&is_favorite=true',
        expect.anything()
      )
    })

    it('create should post new schema', async () => {
      const mockSchema = { id: '1', name: 'New Schema', columns: [] }
      mockFetch.mockResolvedValueOnce(createMockResponse(mockSchema))

      await schemaApi.create('workspace-1', {
        name: 'New Schema',
        source_type: 'csv',
        columns: [],
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/workspaces/workspace-1/schemas',
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('duplicate should duplicate schema', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ id: '2', name: 'Schema (Copy)' })
      )

      await schemaApi.duplicate('1')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/schemas/1/duplicate',
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('toggleFavorite should toggle favorite status', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ id: '1', is_favorite: true })
      )

      await schemaApi.toggleFavorite('1')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/schemas/1/favorite',
        expect.objectContaining({ method: 'PATCH' })
      )
    })

    it('loadDefaults should load default schemas', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ loaded: 5, schemas: [] })
      )

      await schemaApi.loadDefaults('workspace-1')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/workspaces/workspace-1/schemas/defaults',
        expect.objectContaining({ method: 'POST' })
      )
    })
  })

  describe('airflowApi', () => {
    it('getStatus should fetch airflow status', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ status: 'running', mode: 'docker' })
      )

      const result = await airflowApi.getStatus()

      expect(mockFetch).toHaveBeenCalledWith('/api/airflow/status', expect.anything())
      expect(result.status).toBe('running')
    })

    it('start should start airflow', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ success: true, url: 'http://localhost:8080' })
      )

      const result = await airflowApi.start()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/airflow/start',
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.success).toBe(true)
    })

    it('stop should stop airflow', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ success: true, message: 'Stopped' })
      )

      await airflowApi.stop()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/airflow/stop',
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('syncDag should sync DAG to airflow', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ success: true, file_path: '/dags/test.py' })
      )

      await airflowApi.syncDag('test_dag', 'dag_code')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/airflow/sync',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ dag_id: 'test_dag', code: 'dag_code' }),
        })
      )
    })

    it('deleteDag should delete DAG', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ success: true, message: 'Deleted' })
      )

      await airflowApi.deleteDag('test_dag')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/airflow/dag/test_dag',
        expect.objectContaining({ method: 'DELETE' })
      )
    })

    it('testConnection should test external connection', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ success: true, message: 'Connected' })
      )

      await airflowApi.testConnection('http://localhost:8080', 'admin', 'admin')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/airflow/test-connection',
        expect.objectContaining({ method: 'POST' })
      )
    })
  })

  describe('dagApi', () => {
    it('list should fetch DAGs for workspace', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ dags: [], total: 0 })
      )

      await dagApi.list('workspace-1', { is_active: true })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/dags/workspace/workspace-1?is_active=true',
        expect.anything()
      )
    })

    it('getByPage should fetch DAG by page ID', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ id: '1', dag_id: 'test' })
      )

      await dagApi.getByPage('page-1')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/dags/by-page/page-1',
        expect.anything()
      )
    })

    it('create should create new DAG', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ id: '1', dag_id: 'new_dag' })
      )

      await dagApi.create('workspace-1', {
        dag_id: 'new_dag',
        name: 'New DAG',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/dags/workspace/workspace-1',
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('sync should sync DAG to airflow', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ success: true, message: 'Synced' })
      )

      await dagApi.sync('1', { force: true })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/dags/1/sync',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ force: true }),
        })
      )
    })

    it('trigger should trigger DAG execution', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ id: 'exec-1', status: 'pending' })
      )

      await dagApi.trigger('1')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/dags/1/trigger',
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('listExecutions should fetch executions with options', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ executions: [], total: 0 })
      )

      await dagApi.listExecutions('1', { status: 'completed', limit: 5 })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/dags/1/executions?status=completed&limit=5',
        expect.anything()
      )
    })
  })

  describe('Error handling', () => {
    it('should throw ApiError on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ detail: 'Not found' }, false, 404)
      )

      await expect(workspaceApi.get('non-existent')).rejects.toThrow(ApiError)
    })

    it('should handle error without detail', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: vi.fn().mockRejectedValue(new Error('Parse error')),
      })

      await expect(workspaceApi.list()).rejects.toThrow('Unknown error')
    })
  })
})
