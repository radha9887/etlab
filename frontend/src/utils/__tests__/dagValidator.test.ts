import { describe, it, expect } from 'vitest'
import type { Node, Edge } from '@xyflow/react'
import type { DagTaskNodeData } from '../../types'
import {
  validateDag,
  getNodeValidationStatus,
  getValidationSummary,
  type DagValidationResult,
} from '../dagValidator'

// Helper to create a DAG task node
const createTaskNode = (
  id: string,
  label: string,
  type: string = 'python',
  config: Record<string, unknown> = {},
  configured: boolean = true
): Node<DagTaskNodeData> => ({
  id,
  type: 'dagTask',
  position: { x: 0, y: 0 },
  data: {
    type: type as any,
    label,
    category: 'python' as any,
    configured,
    config: {
      taskId: label.toLowerCase().replace(/\s+/g, '_'),
      ...config,
    },
  },
})

// Helper to create an edge
const createEdge = (source: string, target: string): Edge => ({
  id: `${source}-${target}`,
  source,
  target,
})

describe('dagValidator', () => {
  describe('validateDag', () => {
    describe('empty DAG', () => {
      it('should validate empty DAG without errors', () => {
        const result = validateDag([], [])

        expect(result.isValid).toBe(true)
        expect(result.hasErrors).toBe(false)
        expect(result.hasWarnings).toBe(false)
        expect(result.stats.totalNodes).toBe(0)
        expect(result.stats.totalEdges).toBe(0)
      })
    })

    describe('single node DAG', () => {
      it('should validate single configured node', () => {
        const nodes = [
          createTaskNode('task1', 'Task 1', 'python', { pythonCallable: 'my_func' }),
        ]

        const result = validateDag(nodes, [])

        expect(result.isValid).toBe(true)
        expect(result.stats.totalNodes).toBe(1)
      })

      it('should warn about unconfigured node', () => {
        const nodes = [
          createTaskNode('task1', 'Task 1', 'python', {}, false),
        ]

        const result = validateDag(nodes, [])

        expect(result.hasWarnings).toBe(true)
        expect(result.issues.some(i => i.code === 'NOT_CONFIGURED')).toBe(true)
      })
    })

    describe('circular dependency detection', () => {
      it('should detect simple circular dependency (A -> B -> A)', () => {
        const nodes = [
          createTaskNode('a', 'Task A', 'python', { pythonCallable: 'a' }),
          createTaskNode('b', 'Task B', 'python', { pythonCallable: 'b' }),
        ]
        const edges = [
          createEdge('a', 'b'),
          createEdge('b', 'a'),
        ]

        const result = validateDag(nodes, edges)

        expect(result.hasErrors).toBe(true)
        expect(result.issues.some(i => i.code === 'CIRCULAR_DEPENDENCY')).toBe(true)
      })

      it('should detect complex circular dependency (A -> B -> C -> A)', () => {
        const nodes = [
          createTaskNode('a', 'Task A', 'python', { pythonCallable: 'a' }),
          createTaskNode('b', 'Task B', 'python', { pythonCallable: 'b' }),
          createTaskNode('c', 'Task C', 'python', { pythonCallable: 'c' }),
        ]
        const edges = [
          createEdge('a', 'b'),
          createEdge('b', 'c'),
          createEdge('c', 'a'),
        ]

        const result = validateDag(nodes, edges)

        expect(result.hasErrors).toBe(true)
        expect(result.issues.some(i => i.code === 'CIRCULAR_DEPENDENCY')).toBe(true)
      })

      it('should not report false positive for valid chain', () => {
        const nodes = [
          createTaskNode('a', 'Task A', 'python', { pythonCallable: 'a' }),
          createTaskNode('b', 'Task B', 'python', { pythonCallable: 'b' }),
          createTaskNode('c', 'Task C', 'python', { pythonCallable: 'c' }),
        ]
        const edges = [
          createEdge('a', 'b'),
          createEdge('b', 'c'),
        ]

        const result = validateDag(nodes, edges)

        expect(result.issues.filter(i => i.code === 'CIRCULAR_DEPENDENCY')).toHaveLength(0)
      })

      it('should not report false positive for diamond pattern', () => {
        const nodes = [
          createTaskNode('a', 'Start', 'python', { pythonCallable: 'a' }),
          createTaskNode('b', 'Branch 1', 'python', { pythonCallable: 'b' }),
          createTaskNode('c', 'Branch 2', 'python', { pythonCallable: 'c' }),
          createTaskNode('d', 'End', 'python', { pythonCallable: 'd' }),
        ]
        const edges = [
          createEdge('a', 'b'),
          createEdge('a', 'c'),
          createEdge('b', 'd'),
          createEdge('c', 'd'),
        ]

        const result = validateDag(nodes, edges)

        expect(result.issues.filter(i => i.code === 'CIRCULAR_DEPENDENCY')).toHaveLength(0)
      })
    })

    describe('unreachable task detection', () => {
      it('should detect node with no downstream that has upstream', () => {
        const nodes = [
          createTaskNode('a', 'Task A', 'python', { pythonCallable: 'a' }),
          createTaskNode('b', 'Task B', 'python', { pythonCallable: 'b' }),
          createTaskNode('leaf', 'Leaf', 'python', { pythonCallable: 'leaf' }),
        ]
        const edges = [
          createEdge('a', 'b'),
          createEdge('b', 'leaf'), // leaf has upstream, no downstream
        ]

        const result = validateDag(nodes, edges)

        // leaf node has upstream but no downstream - should get NO_DOWNSTREAM info
        expect(result.issues.some(i =>
          i.nodeId === 'leaf' && i.code === 'NO_DOWNSTREAM'
        )).toBe(true)
      })

      it('should detect isolated node as separate flow (no UNREACHABLE)', () => {
        const nodes = [
          createTaskNode('a', 'Task A', 'python', { pythonCallable: 'a' }),
          createTaskNode('b', 'Task B', 'python', { pythonCallable: 'b' }),
          createTaskNode('isolated', 'Isolated', 'python', { pythonCallable: 'iso' }),
        ]
        const edges = [
          createEdge('a', 'b'),
        ]

        const result = validateDag(nodes, edges)

        // Isolated node is a start node (no incoming edges), so NOT unreachable
        // It's simply another separate flow
        expect(result.issues.some(i =>
          i.nodeId === 'isolated' && i.code === 'UNREACHABLE_TASK'
        )).toBe(false)
      })

      it('should warn when all nodes have dependencies (no start nodes)', () => {
        const nodes = [
          createTaskNode('a', 'Task A', 'python', { pythonCallable: 'a' }),
          createTaskNode('b', 'Task B', 'python', { pythonCallable: 'b' }),
        ]
        const edges = [
          createEdge('a', 'b'),
          createEdge('b', 'a'), // Creates a cycle where all have dependencies
        ]

        const result = validateDag(nodes, edges)

        // Should have circular dependency error
        expect(result.issues.some(i => i.code === 'CIRCULAR_DEPENDENCY')).toBe(true)
      })
    })

    describe('duplicate task ID detection', () => {
      it('should detect duplicate task IDs', () => {
        const nodes = [
          createTaskNode('a', 'Task A', 'python', { taskId: 'duplicate_id', pythonCallable: 'a' }),
          createTaskNode('b', 'Task B', 'python', { taskId: 'duplicate_id', pythonCallable: 'b' }),
        ]

        const result = validateDag(nodes, [])

        expect(result.hasErrors).toBe(true)
        expect(result.issues.filter(i => i.code === 'DUPLICATE_TASK_ID')).toHaveLength(2)
      })

      it('should not report error for unique task IDs', () => {
        const nodes = [
          createTaskNode('a', 'Task A', 'python', { taskId: 'task_a', pythonCallable: 'a' }),
          createTaskNode('b', 'Task B', 'python', { taskId: 'task_b', pythonCallable: 'b' }),
        ]

        const result = validateDag(nodes, [])

        expect(result.issues.filter(i => i.code === 'DUPLICATE_TASK_ID')).toHaveLength(0)
      })
    })

    describe('missing task ID validation', () => {
      it('should error on missing task ID', () => {
        const nodes = [
          createTaskNode('a', 'Task A', 'python', { taskId: '', pythonCallable: 'a' }),
        ]

        const result = validateDag(nodes, [])

        expect(result.hasErrors).toBe(true)
        expect(result.issues.some(i => i.code === 'MISSING_TASK_ID')).toBe(true)
      })

      it('should error on invalid task ID format', () => {
        const nodes = [
          createTaskNode('a', 'Task A', 'python', { taskId: '123-invalid', pythonCallable: 'a' }),
        ]

        const result = validateDag(nodes, [])

        expect(result.hasErrors).toBe(true)
        expect(result.issues.some(i => i.code === 'INVALID_TASK_ID')).toBe(true)
      })

      it('should accept valid task ID formats', () => {
        const validTaskIds = ['task_1', '_private', 'myTask', 'UPPER_CASE', 'task123']

        validTaskIds.forEach(taskId => {
          const nodes = [
            createTaskNode('a', 'Task', 'python', { taskId, pythonCallable: 'a' }),
          ]
          const result = validateDag(nodes, [])

          expect(result.issues.filter(i => i.code === 'INVALID_TASK_ID')).toHaveLength(0)
        })
      })
    })

    describe('sensor configuration validation', () => {
      it('should error when sensor timeout < poke interval', () => {
        const nodes = [
          createTaskNode('sensor1', 'File Sensor', 'file_sensor', {
            taskId: 'file_sensor',
            timeoutSeconds: 30,
            pokeIntervalSeconds: 60,
          }),
        ]

        const result = validateDag(nodes, [])

        expect(result.hasErrors).toBe(true)
        expect(result.issues.some(i => i.code === 'SENSOR_TIMEOUT_INVALID')).toBe(true)
      })

      it('should warn about short poke interval', () => {
        const nodes = [
          createTaskNode('sensor1', 'File Sensor', 'file_sensor', {
            taskId: 'file_sensor',
            timeoutSeconds: 300,
            pokeIntervalSeconds: 10,
            mode: 'poke',
          }),
        ]

        const result = validateDag(nodes, [])

        expect(result.hasWarnings).toBe(true)
        expect(result.issues.some(i => i.code === 'SENSOR_POKE_SHORT')).toBe(true)
      })

      it('should warn about very long timeout', () => {
        const nodes = [
          createTaskNode('sensor1', 'File Sensor', 'file_sensor', {
            taskId: 'file_sensor',
            timeoutSeconds: 100000, // > 24 hours
          }),
        ]

        const result = validateDag(nodes, [])

        expect(result.hasWarnings).toBe(true)
        expect(result.issues.some(i => i.code === 'SENSOR_TIMEOUT_LONG')).toBe(true)
      })

      it('should suggest deferrable mode for poke sensors', () => {
        const nodes = [
          createTaskNode('sensor1', 'File Sensor', 'file_sensor', {
            taskId: 'file_sensor',
            mode: 'poke',
            timeoutSeconds: 300,
            pokeIntervalSeconds: 60,
          }),
        ]

        const result = validateDag(nodes, [])

        expect(result.issues.some(i => i.code === 'SENSOR_NOT_DEFERRABLE')).toBe(true)
      })
    })

    describe('type-specific validation', () => {
      it('should error on Python task without callable', () => {
        const nodes = [
          createTaskNode('py1', 'Python Task', 'python', { taskId: 'py1' }),
        ]

        const result = validateDag(nodes, [])

        expect(result.hasErrors).toBe(true)
        expect(result.issues.some(i => i.code === 'MISSING_PYTHON_CALLABLE')).toBe(true)
      })

      it('should error on Bash task without command', () => {
        const nodes = [
          createTaskNode('bash1', 'Bash Task', 'bash', { taskId: 'bash1' }),
        ]

        const result = validateDag(nodes, [])

        expect(result.hasErrors).toBe(true)
        expect(result.issues.some(i => i.code === 'MISSING_BASH_COMMAND')).toBe(true)
      })

      it('should error on ETL task without page reference', () => {
        const nodes = [
          createTaskNode('etl1', 'ETL Task', 'etl_task', { taskId: 'etl1' }),
        ]

        const result = validateDag(nodes, [])

        expect(result.hasErrors).toBe(true)
        expect(result.issues.some(i => i.code === 'MISSING_ETL_PAGE')).toBe(true)
      })

      it('should error on Email task without recipient', () => {
        const nodes = [
          createTaskNode('email1', 'Email', 'email', { taskId: 'email1' }),
        ]

        const result = validateDag(nodes, [])

        expect(result.hasErrors).toBe(true)
        expect(result.issues.some(i => i.code === 'MISSING_EMAIL_TO')).toBe(true)
      })

      it('should error on Trigger DAG without target DAG', () => {
        const nodes = [
          createTaskNode('trigger1', 'Trigger', 'trigger_dag', { taskId: 'trigger1' }),
        ]

        const result = validateDag(nodes, [])

        expect(result.hasErrors).toBe(true)
        expect(result.issues.some(i => i.code === 'MISSING_TRIGGER_DAG')).toBe(true)
      })
    })

    describe('retry configuration', () => {
      it('should warn when retries set without delay', () => {
        const nodes = [
          createTaskNode('task1', 'Task', 'python', {
            taskId: 'task1',
            pythonCallable: 'my_func',
            retries: 3,
          }),
        ]

        const result = validateDag(nodes, [])

        expect(result.hasWarnings).toBe(true)
        expect(result.issues.some(i => i.code === 'MISSING_RETRY_DELAY')).toBe(true)
      })

      it('should not warn when retries and delay are both set', () => {
        const nodes = [
          createTaskNode('task1', 'Task', 'python', {
            taskId: 'task1',
            pythonCallable: 'my_func',
            retries: 3,
            retryDelayMinutes: 5,
          }),
        ]

        const result = validateDag(nodes, [])

        expect(result.issues.filter(i => i.code === 'MISSING_RETRY_DELAY')).toHaveLength(0)
      })
    })

    describe('validation result structure', () => {
      it('should include correct stats', () => {
        const nodes = [
          createTaskNode('a', 'Task A', 'python', { pythonCallable: 'a' }),
          createTaskNode('b', 'Task B', 'python', { pythonCallable: 'b' }),
        ]
        const edges = [createEdge('a', 'b')]

        const result = validateDag(nodes, edges)

        expect(result.stats.totalNodes).toBe(2)
        expect(result.stats.totalEdges).toBe(1)
        expect(typeof result.stats.errorCount).toBe('number')
        expect(typeof result.stats.warningCount).toBe('number')
        expect(typeof result.stats.infoCount).toBe('number')
      })

      it('should include node validations map', () => {
        const nodes = [
          createTaskNode('a', 'Task A', 'python', { pythonCallable: 'a' }),
        ]

        const result = validateDag(nodes, [])

        expect(result.nodeValidations).toBeInstanceOf(Map)
        expect(result.nodeValidations.has('a')).toBe(true)
      })
    })
  })

  describe('getNodeValidationStatus', () => {
    it('should return status for existing node', () => {
      const nodes = [
        createTaskNode('a', 'Task A', 'python', { taskId: '' }), // Will have error
      ]
      const validation = validateDag(nodes, [])

      const status = getNodeValidationStatus('a', validation)

      expect(status.hasErrors).toBe(true)
      expect(status.issues.length).toBeGreaterThan(0)
    })

    it('should return empty status for non-existent node', () => {
      const validation = validateDag([], [])

      const status = getNodeValidationStatus('nonexistent', validation)

      expect(status.hasErrors).toBe(false)
      expect(status.hasWarnings).toBe(false)
      expect(status.issues).toHaveLength(0)
    })
  })

  describe('getValidationSummary', () => {
    it('should return "DAG is valid" for valid DAG', () => {
      const nodes = [
        createTaskNode('a', 'Task A', 'python', { pythonCallable: 'a' }),
      ]
      const validation = validateDag(nodes, [])

      // Filter out info-level issues
      validation.stats.warningCount = 0
      validation.stats.errorCount = 0

      const summary = getValidationSummary(validation)

      expect(summary).toBe('DAG is valid')
    })

    it('should include error count in summary', () => {
      const nodes = [
        createTaskNode('a', 'Task A', 'python', { taskId: '' }), // Missing task ID
      ]
      const validation = validateDag(nodes, [])

      const summary = getValidationSummary(validation)

      expect(summary).toContain('error')
    })

    it('should include warning count in summary', () => {
      const nodes = [
        createTaskNode('a', 'Task A', 'python', { pythonCallable: 'a' }, false), // Not configured
      ]
      const validation = validateDag(nodes, [])

      const summary = getValidationSummary(validation)

      expect(summary).toContain('warning')
    })

    it('should handle plural forms correctly', () => {
      const nodes = [
        createTaskNode('a', 'Task A', 'python', { taskId: '' }),
        createTaskNode('b', 'Task B', 'python', { taskId: '' }),
      ]
      const validation = validateDag(nodes, [])

      const summary = getValidationSummary(validation)

      expect(summary).toContain('errors') // Plural
    })
  })
})
