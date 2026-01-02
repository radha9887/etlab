/**
 * Tests for Airflow Code Generator
 */
import { describe, it, expect } from 'vitest'
import type { Node, Edge } from '@xyflow/react'
import type { DagTaskNodeData, DagConfig } from '../../types'
import {
  generateAirflowCode,
  toTaskId,
  generateDefaultArgs,
  generateDependencies,
} from '../airflow'

// Helper to create minimal DagConfig
const createDagConfig = (overrides: Partial<DagConfig> = {}): DagConfig => ({
  dagId: 'test_dag',
  description: 'Test DAG',
  schedule: { type: 'manual' },
  catchup: false,
  maxActiveRuns: 1,
  tags: [],
  defaultArgs: {
    owner: 'airflow',
    retries: 2,
    retryDelayMinutes: 5,
    executionTimeoutMinutes: 60,
    email: '',
    emailOnFailure: false,
    emailOnRetry: false,
  },
  ...overrides,
})

// Helper to create task node
const createTaskNode = (
  id: string,
  label: string,
  taskType: string,
  configured: boolean = true,
  config: Record<string, unknown> = {}
): Node<DagTaskNodeData> => ({
  id,
  type: 'task',
  position: { x: 0, y: 0 },
  data: {
    label,
    taskType: taskType as any,
    configured,
    config: {
      taskId: label.toLowerCase().replace(/\s+/g, '_'),
      ...config,
    },
  },
})

describe('Airflow Code Generator', () => {
  describe('toTaskId', () => {
    it('converts label to lowercase', () => {
      expect(toTaskId('MyTask')).toBe('mytask')
    })

    it('replaces spaces with underscores', () => {
      expect(toTaskId('my task')).toBe('my_task')
    })

    it('removes special characters', () => {
      expect(toTaskId('task@123!')).toBe('task_123_')
    })

    it('collapses multiple underscores', () => {
      expect(toTaskId('my___task')).toBe('my_task')
    })

    it('handles complex strings', () => {
      expect(toTaskId('Extract Data (CSV)')).toBe('extract_data_csv_')
    })

    it('handles empty string', () => {
      expect(toTaskId('')).toBe('')
    })

    it('handles numbers at start', () => {
      expect(toTaskId('123task')).toBe('123task')
    })
  })

  describe('generateDefaultArgs', () => {
    it('generates default args with required fields', () => {
      const config = createDagConfig()
      const lines = generateDefaultArgs(config)

      expect(lines.join('\n')).toContain('default_args = {')
      expect(lines.join('\n')).toContain('"owner": "airflow"')
      expect(lines.join('\n')).toContain('"retries": 2')
      expect(lines.join('\n')).toContain('retry_delay')
      expect(lines.join('\n')).toContain('execution_timeout')
    })

    it('includes email settings when email is provided', () => {
      const config = createDagConfig({
        defaultArgs: {
          owner: 'test',
          retries: 1,
          retryDelayMinutes: 5,
          executionTimeoutMinutes: 30,
          email: 'test@example.com',
          emailOnFailure: true,
          emailOnRetry: false,
        },
      })
      const lines = generateDefaultArgs(config)
      const code = lines.join('\n')

      expect(code).toContain('"email": ["test@example.com"]')
      expect(code).toContain('"email_on_failure": True')
      expect(code).toContain('"email_on_retry": False')
    })

    it('does not include email settings when no email', () => {
      const config = createDagConfig()
      const lines = generateDefaultArgs(config)
      const code = lines.join('\n')

      expect(code).not.toContain('email_on_failure')
      expect(code).not.toContain('email_on_retry')
    })
  })

  describe('generateDependencies', () => {
    it('returns empty array when no edges', () => {
      const tasks = [createTaskNode('1', 'Task1', 'pythonOperator')]
      const edges: Edge[] = []

      const lines = generateDependencies(tasks, edges)
      expect(lines).toEqual([])
    })

    it('generates single dependency', () => {
      const tasks = [
        createTaskNode('1', 'extract', 'pythonOperator'),
        createTaskNode('2', 'transform', 'pythonOperator'),
      ]
      const edges: Edge[] = [{ id: 'e1', source: '1', target: '2' }]

      const lines = generateDependencies(tasks, edges)
      expect(lines.join('\n')).toContain('extract >> transform')
    })

    it('generates multiple targets from same source', () => {
      const tasks = [
        createTaskNode('1', 'extract', 'pythonOperator'),
        createTaskNode('2', 'transform_a', 'pythonOperator'),
        createTaskNode('3', 'transform_b', 'pythonOperator'),
      ]
      const edges: Edge[] = [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '1', target: '3' },
      ]

      const lines = generateDependencies(tasks, edges)
      const code = lines.join('\n')
      expect(code).toContain('extract >> [transform_a, transform_b]')
    })

    it('handles complex dependency chains', () => {
      const tasks = [
        createTaskNode('1', 'start', 'pythonOperator'),
        createTaskNode('2', 'middle', 'pythonOperator'),
        createTaskNode('3', 'end', 'pythonOperator'),
      ]
      const edges: Edge[] = [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '2', target: '3' },
      ]

      const lines = generateDependencies(tasks, edges)
      const code = lines.join('\n')
      expect(code).toContain('start >> middle')
      expect(code).toContain('middle >> end')
    })
  })

  describe('generateAirflowCode', () => {
    it('returns errors when DAG ID is missing', () => {
      const config = createDagConfig({ dagId: '' })
      const result = generateAirflowCode([], [], config)

      expect(result.errors).toContain('DAG ID is required')
    })

    it('returns errors when no tasks defined', () => {
      const config = createDagConfig()
      const result = generateAirflowCode([], [], config)

      expect(result.errors).toContain('No tasks defined in the DAG')
    })

    it('returns errors for unconfigured tasks', () => {
      const config = createDagConfig()
      const tasks = [createTaskNode('1', 'MyTask', 'pythonOperator', false)]

      const result = generateAirflowCode(tasks, [], config)
      expect(result.errors).toContain('Task "MyTask" is not configured')
    })

    it('generates valid Python code header', () => {
      const config = createDagConfig()
      const tasks = [createTaskNode('1', 'Task1', 'pythonOperator')]

      const result = generateAirflowCode(tasks, [], config)
      expect(result.code).toContain('"""')
      expect(result.code).toContain('Airflow DAG: test_dag')
      expect(result.code).toContain('Generated by ETLab')
    })

    it('generates DAG definition with correct parameters', () => {
      const config = createDagConfig({
        dagId: 'my_dag',
        description: 'My test DAG',
        catchup: true,
        maxActiveRuns: 3,
        tags: ['test', 'etl'],
      })
      const tasks = [createTaskNode('1', 'Task1', 'pythonOperator')]

      const result = generateAirflowCode(tasks, [], config)
      expect(result.code).toContain('dag_id="my_dag"')
      expect(result.code).toContain('description="My test DAG"')
      expect(result.code).toContain('catchup=True')
      expect(result.code).toContain('max_active_runs=3')
      expect(result.code).toContain('tags=["test","etl"]')
    })

    it('generates manual schedule correctly', () => {
      const config = createDagConfig({
        schedule: { type: 'manual' },
      })
      const tasks = [createTaskNode('1', 'Task1', 'pythonOperator')]

      const result = generateAirflowCode(tasks, [], config)
      expect(result.code).toContain('schedule=None')
    })

    it('generates preset schedule correctly', () => {
      const config = createDagConfig({
        schedule: { type: 'preset', preset: '@daily' },
      })
      const tasks = [createTaskNode('1', 'Task1', 'pythonOperator')]

      const result = generateAirflowCode(tasks, [], config)
      expect(result.code).toContain('schedule="@daily"')
    })

    it('generates cron schedule correctly', () => {
      const config = createDagConfig({
        schedule: { type: 'cron', cron: '0 6 * * *' },
      })
      const tasks = [createTaskNode('1', 'Task1', 'pythonOperator')]

      const result = generateAirflowCode(tasks, [], config)
      expect(result.code).toContain('schedule="0 6 * * *"')
    })

    it('includes imports section', () => {
      const config = createDagConfig()
      const tasks = [createTaskNode('1', 'Task1', 'pythonOperator')]

      const result = generateAirflowCode(tasks, [], config)
      expect(result.code).toContain('from airflow import DAG')
      expect(result.code).toContain('from datetime import')
    })

    it('includes default_args section', () => {
      const config = createDagConfig()
      const tasks = [createTaskNode('1', 'Task1', 'pythonOperator')]

      const result = generateAirflowCode(tasks, [], config)
      expect(result.code).toContain('default_args = {')
    })

    it('generates complete DAG for Python operator', () => {
      const config = createDagConfig({ dagId: 'python_dag' })
      const tasks = [
        createTaskNode('1', 'run_script', 'pythonOperator', true, {
          taskId: 'run_script',
          pythonCallable: 'my_function',
        }),
      ]

      const result = generateAirflowCode(tasks, [], config)
      expect(result.errors).toEqual([])
      expect(result.code).toContain('dag_id="python_dag"')
      expect(result.code).toContain('with DAG(')
      expect(result.code).toContain(') as dag:')
    })

    it('generates dependencies between tasks', () => {
      const config = createDagConfig()
      const tasks = [
        createTaskNode('1', 'task_a', 'pythonOperator'),
        createTaskNode('2', 'task_b', 'pythonOperator'),
      ]
      const edges: Edge[] = [{ id: 'e1', source: '1', target: '2' }]

      const result = generateAirflowCode(tasks, edges, config)
      expect(result.code).toContain('Task dependencies')
      expect(result.code).toContain('task_a >> task_b')
    })
  })

  describe('Schedule generation', () => {
    it('handles all preset schedules', () => {
      const presets = ['@once', '@hourly', '@daily', '@weekly', '@monthly', '@yearly']

      presets.forEach(preset => {
        const config = createDagConfig({
          schedule: { type: 'preset', preset },
        })
        const tasks = [createTaskNode('1', 'Task1', 'pythonOperator')]

        const result = generateAirflowCode(tasks, [], config)
        expect(result.code).toContain(`schedule="${preset}"`)
      })
    })

    it('handles custom cron expressions', () => {
      const cronExprs = ['0 0 * * *', '*/15 * * * *', '0 12 * * MON-FRI']

      cronExprs.forEach(cron => {
        const config = createDagConfig({
          schedule: { type: 'cron', cron },
        })
        const tasks = [createTaskNode('1', 'Task1', 'pythonOperator')]

        const result = generateAirflowCode(tasks, [], config)
        expect(result.code).toContain(`schedule="${cron}"`)
      })
    })
  })

  describe('Edge cases', () => {
    it('handles tasks with special characters in names', () => {
      const config = createDagConfig()
      const tasks = [
        createTaskNode('1', 'My Task (v2)', 'pythonOperator', true, {
          taskId: 'my_task_v2',
        }),
      ]

      const result = generateAirflowCode(tasks, [], config)
      expect(result.errors).toEqual([])
    })

    it('handles multiple unconfigured tasks', () => {
      const config = createDagConfig()
      const tasks = [
        createTaskNode('1', 'Task1', 'pythonOperator', false),
        createTaskNode('2', 'Task2', 'bashOperator', false),
        createTaskNode('3', 'Task3', 'pythonOperator', true),
      ]

      const result = generateAirflowCode(tasks, [], config)
      expect(result.errors).toHaveLength(2)
      expect(result.errors).toContain('Task "Task1" is not configured')
      expect(result.errors).toContain('Task "Task2" is not configured')
    })

    it('handles empty tags array', () => {
      const config = createDagConfig({ tags: [] })
      const tasks = [createTaskNode('1', 'Task1', 'pythonOperator')]

      const result = generateAirflowCode(tasks, [], config)
      expect(result.code).not.toContain('tags=')
    })

    it('handles missing description', () => {
      const config = createDagConfig({ description: '' })
      const tasks = [createTaskNode('1', 'Task1', 'pythonOperator')]

      const result = generateAirflowCode(tasks, [], config)
      expect(result.code).toContain('description=""')
    })
  })
})
