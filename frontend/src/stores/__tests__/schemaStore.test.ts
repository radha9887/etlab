/**
 * Tests for Schema Store
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useSchemaStore } from '../schemaStore'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Reset store state
const resetStore = () => {
  useSchemaStore.setState({
    schemas: [],
    isLoading: false,
    error: null,
  })
}

describe('schemaStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetStore()
  })

  describe('initial state', () => {
    it('should have empty initial state', () => {
      const state = useSchemaStore.getState()
      expect(state.schemas).toEqual([])
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('addSchema', () => {
    it('should add a schema', () => {
      const schema = {
        id: 'test-1',
        name: 'Test Schema',
        source: 'csv' as const,
        columns: [{ name: 'id', dataType: 'integer', nullable: false }],
      }

      act(() => {
        useSchemaStore.getState().addSchema(schema)
      })

      expect(useSchemaStore.getState().schemas).toHaveLength(1)
      expect(useSchemaStore.getState().schemas[0]).toEqual(schema)
    })

    it('should add multiple schemas', () => {
      const schema1 = {
        id: 'test-1',
        name: 'Schema 1',
        source: 'csv' as const,
        columns: [],
      }
      const schema2 = {
        id: 'test-2',
        name: 'Schema 2',
        source: 'parquet' as const,
        columns: [],
      }

      act(() => {
        useSchemaStore.getState().addSchema(schema1)
        useSchemaStore.getState().addSchema(schema2)
      })

      expect(useSchemaStore.getState().schemas).toHaveLength(2)
    })
  })

  describe('removeSchema', () => {
    it('should remove a schema by id', () => {
      const schema = {
        id: 'to-remove',
        name: 'Remove Me',
        source: 'csv' as const,
        columns: [],
      }

      act(() => {
        useSchemaStore.getState().addSchema(schema)
      })

      expect(useSchemaStore.getState().schemas).toHaveLength(1)

      act(() => {
        useSchemaStore.getState().removeSchema('to-remove')
      })

      expect(useSchemaStore.getState().schemas).toHaveLength(0)
    })

    it('should not affect other schemas', () => {
      act(() => {
        useSchemaStore.getState().addSchema({
          id: 'keep',
          name: 'Keep',
          source: 'csv' as const,
          columns: [],
        })
        useSchemaStore.getState().addSchema({
          id: 'remove',
          name: 'Remove',
          source: 'csv' as const,
          columns: [],
        })
      })

      act(() => {
        useSchemaStore.getState().removeSchema('remove')
      })

      expect(useSchemaStore.getState().schemas).toHaveLength(1)
      expect(useSchemaStore.getState().schemas[0].id).toBe('keep')
    })
  })

  describe('loadFromYaml', () => {
    it('should load single schema from YAML', () => {
      const yamlContent = `
name: Orders
source: csv
columns:
  - name: id
    dataType: integer
    nullable: false
  - name: total
    dataType: double
`

      act(() => {
        useSchemaStore.getState().loadFromYaml(yamlContent)
      })

      const schemas = useSchemaStore.getState().schemas
      expect(schemas).toHaveLength(1)
      expect(schemas[0].name).toBe('Orders')
      expect(schemas[0].columns).toHaveLength(2)
    })

    it('should load array of schemas from YAML', () => {
      const yamlContent = `
- name: Orders
  source: csv
  columns:
    - name: id
      dataType: integer
- name: Products
  source: parquet
  columns:
    - name: sku
      dataType: string
`

      act(() => {
        useSchemaStore.getState().loadFromYaml(yamlContent)
      })

      expect(useSchemaStore.getState().schemas).toHaveLength(2)
    })

    it('should load schemas with "schemas" key', () => {
      const yamlContent = `
schemas:
  - name: Users
    source: jdbc
    columns:
      - name: email
        dataType: string
`

      act(() => {
        useSchemaStore.getState().loadFromYaml(yamlContent)
      })

      expect(useSchemaStore.getState().schemas).toHaveLength(1)
      expect(useSchemaStore.getState().schemas[0].name).toBe('Users')
    })

    it('should handle column type as fallback for dataType', () => {
      const yamlContent = `
name: Test
source: csv
columns:
  - name: old_format
    type: string
`

      act(() => {
        useSchemaStore.getState().loadFromYaml(yamlContent)
      })

      const schemas = useSchemaStore.getState().schemas
      expect(schemas[0].columns[0].dataType).toBe('string')
    })

    it('should throw error for invalid YAML', () => {
      const invalidYaml = 'name: {invalid'

      expect(() => {
        useSchemaStore.getState().loadFromYaml(invalidYaml)
      }).toThrow()
    })

    it('should default nullable to true', () => {
      const yamlContent = `
name: Test
columns:
  - name: col1
    dataType: string
`

      act(() => {
        useSchemaStore.getState().loadFromYaml(yamlContent)
      })

      expect(useSchemaStore.getState().schemas[0].columns[0].nullable).toBe(true)
    })

    it('should respect nullable: false', () => {
      const yamlContent = `
name: Test
columns:
  - name: col1
    dataType: string
    nullable: false
`

      act(() => {
        useSchemaStore.getState().loadFromYaml(yamlContent)
      })

      expect(useSchemaStore.getState().schemas[0].columns[0].nullable).toBe(false)
    })
  })

  describe('clearSchemas', () => {
    it('should clear all schemas', () => {
      act(() => {
        useSchemaStore.getState().addSchema({
          id: '1',
          name: 'Schema 1',
          source: 'csv' as const,
          columns: [],
        })
        useSchemaStore.getState().addSchema({
          id: '2',
          name: 'Schema 2',
          source: 'csv' as const,
          columns: [],
        })
      })

      expect(useSchemaStore.getState().schemas).toHaveLength(2)

      act(() => {
        useSchemaStore.getState().clearSchemas()
      })

      expect(useSchemaStore.getState().schemas).toHaveLength(0)
    })
  })

  describe('loadFromApi', () => {
    it('should load schemas from API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          schemas: [
            {
              id: 'api-1',
              name: 'API Schema',
              source_type: 'csv',
              columns: [
                { name: 'id', dataType: 'integer', nullable: false },
              ],
              config: {},
            },
          ],
        }),
      })

      await act(async () => {
        await useSchemaStore.getState().loadFromApi('workspace-1')
      })

      const state = useSchemaStore.getState()
      expect(state.schemas).toHaveLength(1)
      expect(state.schemas[0].name).toBe('API Schema')
      expect(state.isLoading).toBe(false)
    })

    it('should set error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      await act(async () => {
        await useSchemaStore.getState().loadFromApi('workspace-1')
      })

      expect(useSchemaStore.getState().error).toBe('Failed to load schemas')
    })
  })

  describe('saveToApi', () => {
    it('should save schema to API', async () => {
      const mockSavedSchema = {
        id: 'saved-1',
        name: 'Saved Schema',
        source_type: 'csv',
        columns: [],
        config: {},
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSavedSchema,
      })

      const schema = {
        id: '',
        name: 'Saved Schema',
        source: 'csv' as const,
        columns: [],
      }

      let result: any
      await act(async () => {
        result = await useSchemaStore.getState().saveToApi('workspace-1', schema)
      })

      expect(result).toBeDefined()
      expect(result.name).toBe('Saved Schema')
    })

    it('should return null on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      let result: any
      await act(async () => {
        result = await useSchemaStore.getState().saveToApi('workspace-1', {
          id: '',
          name: 'Test',
          source: 'csv' as const,
          columns: [],
        })
      })

      expect(result).toBeNull()
      expect(useSchemaStore.getState().error).toBe('Failed to save schema')
    })
  })

  describe('deleteFromApi', () => {
    it('should delete schema from API', async () => {
      // Add a schema first
      act(() => {
        useSchemaStore.getState().addSchema({
          id: 'to-delete',
          name: 'Delete Me',
          source: 'csv' as const,
          columns: [],
        })
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      await act(async () => {
        await useSchemaStore.getState().deleteFromApi('to-delete')
      })

      expect(useSchemaStore.getState().schemas).toHaveLength(0)
    })
  })

  describe('complex YAML scenarios', () => {
    it('should handle schema with config', () => {
      const yamlContent = `
name: JDBC Schema
source: jdbc
columns:
  - name: id
    dataType: integer
config:
  url: jdbc:postgresql://localhost:5432/db
  table: users
`

      act(() => {
        useSchemaStore.getState().loadFromYaml(yamlContent)
      })

      const schema = useSchemaStore.getState().schemas[0]
      expect(schema.config).toBeDefined()
      expect((schema.config as any)?.url).toBe('jdbc:postgresql://localhost:5432/db')
    })

    it('should handle schema with path', () => {
      const yamlContent = `
name: File Schema
source: csv
path: /data/files/input.csv
columns:
  - name: data
    dataType: string
`

      act(() => {
        useSchemaStore.getState().loadFromYaml(yamlContent)
      })

      const schema = useSchemaStore.getState().schemas[0]
      expect(schema.path).toBe('/data/files/input.csv')
    })

    it('should handle empty columns', () => {
      const yamlContent = `
name: Empty Schema
source: csv
columns: []
`

      act(() => {
        useSchemaStore.getState().loadFromYaml(yamlContent)
      })

      expect(useSchemaStore.getState().schemas[0].columns).toEqual([])
    })

    it('should handle missing columns', () => {
      const yamlContent = `
name: No Columns
source: csv
`

      act(() => {
        useSchemaStore.getState().loadFromYaml(yamlContent)
      })

      expect(useSchemaStore.getState().schemas[0].columns).toEqual([])
    })
  })
})
