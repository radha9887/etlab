import { describe, it, expect } from 'vitest'
import type { Node, Edge } from '@xyflow/react'
import type { ETLNodeData, SourceNodeData, TransformNodeData, SinkNodeData } from '../../types'
import {
  generatePySparkCode,
  topologicalSort,
  toVarName,
  getInputNodes,
  mapDataTypeToPySpark,
  generateSchemaCode,
} from '../pyspark'

// Helper to create a source node
const createSourceNode = (
  id: string,
  label: string,
  sourceType: string,
  config: Record<string, unknown> = {}
): Node<SourceNodeData> => ({
  id,
  type: 'source',
  position: { x: 0, y: 0 },
  data: {
    type: 'source',
    category: 'source',
    sourceType: sourceType as any,
    label,
    config,
  },
})

// Helper to create a transform node
const createTransformNode = (
  id: string,
  label: string,
  transformType: string,
  config: Record<string, unknown> = {}
): Node<TransformNodeData> => ({
  id,
  type: 'transform',
  position: { x: 100, y: 0 },
  data: {
    type: 'transform',
    category: 'transform',
    transformType: transformType as any,
    label,
    config,
  },
})

// Helper to create a sink node
const createSinkNode = (
  id: string,
  label: string,
  sinkType: string,
  config: Record<string, unknown> = {}
): Node<SinkNodeData> => ({
  id,
  type: 'sink',
  position: { x: 200, y: 0 },
  data: {
    type: 'sink',
    category: 'sink',
    sinkType: sinkType as any,
    label,
    config,
  },
})

// Helper to create an edge
const createEdge = (source: string, target: string, targetHandle?: string): Edge => ({
  id: `${source}-${target}`,
  source,
  target,
  targetHandle,
})

describe('codeGenerator helpers', () => {
  describe('toVarName', () => {
    it('should create safe variable name from label', () => {
      const result = toVarName('node_123', 'My Source')

      expect(result).toBe('df_my_source_123')
    })

    it('should handle special characters', () => {
      const result = toVarName('node_abc', 'Data@Source#1')

      expect(result).toBe('df_data_source_1_abc')
    })

    it('should handle consecutive special characters', () => {
      const result = toVarName('node_x', 'My---Data')

      expect(result).toBe('df_my_data_x')
    })

    it('should handle empty label', () => {
      const result = toVarName('node_1', '')

      expect(result).toBe('df__1')
    })
  })

  describe('topologicalSort', () => {
    it('should sort nodes in dependency order', () => {
      const nodes = [
        createSourceNode('c', 'Sink', 'csv'),
        createSourceNode('a', 'Source', 'csv'),
        createSourceNode('b', 'Transform', 'csv'),
      ]
      const edges = [
        createEdge('a', 'b'),
        createEdge('b', 'c'),
      ]

      const sorted = topologicalSort(nodes as Node<ETLNodeData>[], edges)

      const ids = sorted.map(n => n.id)
      expect(ids.indexOf('a')).toBeLessThan(ids.indexOf('b'))
      expect(ids.indexOf('b')).toBeLessThan(ids.indexOf('c'))
    })

    it('should handle diamond pattern', () => {
      const nodes = [
        createSourceNode('a', 'Start', 'csv'),
        createSourceNode('b', 'Branch1', 'csv'),
        createSourceNode('c', 'Branch2', 'csv'),
        createSourceNode('d', 'End', 'csv'),
      ]
      const edges = [
        createEdge('a', 'b'),
        createEdge('a', 'c'),
        createEdge('b', 'd'),
        createEdge('c', 'd'),
      ]

      const sorted = topologicalSort(nodes as Node<ETLNodeData>[], edges)

      const ids = sorted.map(n => n.id)
      expect(ids.indexOf('a')).toBeLessThan(ids.indexOf('b'))
      expect(ids.indexOf('a')).toBeLessThan(ids.indexOf('c'))
      expect(ids.indexOf('b')).toBeLessThan(ids.indexOf('d'))
      expect(ids.indexOf('c')).toBeLessThan(ids.indexOf('d'))
    })

    it('should handle independent nodes', () => {
      const nodes = [
        createSourceNode('a', 'A', 'csv'),
        createSourceNode('b', 'B', 'csv'),
      ]

      const sorted = topologicalSort(nodes as Node<ETLNodeData>[], [])

      expect(sorted).toHaveLength(2)
    })

    it('should return empty array for empty input', () => {
      const sorted = topologicalSort([], [])

      expect(sorted).toHaveLength(0)
    })
  })

  describe('getInputNodes', () => {
    it('should return input nodes for a given node', () => {
      const edges = [
        createEdge('source1', 'transform1'),
        createEdge('source2', 'transform1', 'input-2'),
      ]

      const inputs = getInputNodes('transform1', edges)

      expect(inputs).toHaveLength(2)
      expect(inputs[0].inputNodeId).toBe('source1')
      expect(inputs[1].inputNodeId).toBe('source2')
      expect(inputs[1].handle).toBe('input-2')
    })

    it('should return empty array for node with no inputs', () => {
      const edges = [createEdge('a', 'b')]

      const inputs = getInputNodes('a', edges)

      expect(inputs).toHaveLength(0)
    })

    it('should handle null target handle', () => {
      const edges = [createEdge('a', 'b')]

      const inputs = getInputNodes('b', edges)

      expect(inputs[0].handle).toBeNull()
    })
  })

  describe('mapDataTypeToPySpark', () => {
    it('should map string type', () => {
      expect(mapDataTypeToPySpark('string')).toBe('StringType()')
    })

    it('should map integer types', () => {
      expect(mapDataTypeToPySpark('integer')).toBe('IntegerType()')
      expect(mapDataTypeToPySpark('int')).toBe('IntegerType()')
    })

    it('should map long types', () => {
      expect(mapDataTypeToPySpark('long')).toBe('LongType()')
      expect(mapDataTypeToPySpark('bigint')).toBe('LongType()')
    })

    it('should map boolean types', () => {
      expect(mapDataTypeToPySpark('boolean')).toBe('BooleanType()')
      expect(mapDataTypeToPySpark('bool')).toBe('BooleanType()')
    })

    it('should map date/time types', () => {
      expect(mapDataTypeToPySpark('date')).toBe('DateType()')
      expect(mapDataTypeToPySpark('timestamp')).toBe('TimestampType()')
    })

    it('should map decimal with precision and scale', () => {
      expect(mapDataTypeToPySpark('decimal(10,2)')).toBe('DecimalType(10, 2)')
      expect(mapDataTypeToPySpark('decimal(18, 4)')).toBe('DecimalType(18, 4)')
    })

    it('should handle decimal without parameters', () => {
      expect(mapDataTypeToPySpark('decimal')).toBe('DecimalType(10, 2)')
    })

    it('should handle array types', () => {
      expect(mapDataTypeToPySpark('array<string>')).toBe('ArrayType(StringType())')
      expect(mapDataTypeToPySpark('array<integer>')).toBe('ArrayType(IntegerType())')
    })

    it('should handle map types', () => {
      expect(mapDataTypeToPySpark('map<string, integer>')).toBe('MapType(StringType(), IntegerType())')
    })

    it('should handle unknown types as string', () => {
      expect(mapDataTypeToPySpark('unknown_type')).toBe('StringType()')
    })

    it('should be case insensitive', () => {
      expect(mapDataTypeToPySpark('STRING')).toBe('StringType()')
      expect(mapDataTypeToPySpark('Integer')).toBe('IntegerType()')
    })
  })

  describe('generateSchemaCode', () => {
    it('should generate schema for columns', () => {
      const columns = [
        { name: 'id', dataType: 'integer', nullable: false },
        { name: 'name', dataType: 'string', nullable: true },
      ]

      const lines = generateSchemaCode(columns, 'df_source')

      expect(lines.join('\n')).toContain('df_source_schema = StructType')
      expect(lines.join('\n')).toContain('StructField("id", IntegerType(), False)')
      expect(lines.join('\n')).toContain('StructField("name", StringType(), True)')
    })

    it('should return empty array for no columns', () => {
      expect(generateSchemaCode([], 'df')).toHaveLength(0)
    })

    it('should handle undefined columns', () => {
      expect(generateSchemaCode(undefined as any, 'df')).toHaveLength(0)
    })

    it('should default nullable to true', () => {
      const columns = [{ name: 'col', dataType: 'string' }]

      const lines = generateSchemaCode(columns, 'df')

      expect(lines.join('\n')).toContain('True)')
    })
  })
})

describe('generatePySparkCode', () => {
  describe('empty workflow', () => {
    it('should return template code for empty workflow', () => {
      const result = generatePySparkCode([], [])

      expect(result.code).toContain('SparkSession')
      expect(result.code).toContain('Drag nodes from the sidebar')
      expect(result.cells).toHaveLength(1)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('source nodes', () => {
    it('should generate CSV source code', () => {
      const nodes = [
        createSourceNode('node_1', 'CSV Source', 'csv', {
          path: '/data/input.csv',
          header: true,
          inferSchema: true,
        }),
      ]

      const result = generatePySparkCode(nodes as Node<ETLNodeData>[], [])

      expect(result.code).toContain('.format("csv")')
      expect(result.code).toContain('/data/input.csv')
      expect(result.code).toContain('header')
    })

    it('should generate Parquet source code', () => {
      const nodes = [
        createSourceNode('node_1', 'Parquet Source', 'parquet', {
          path: '/data/input.parquet',
        }),
      ]

      const result = generatePySparkCode(nodes as Node<ETLNodeData>[], [])

      expect(result.code).toContain('.format("parquet")')
      expect(result.code).toContain('/data/input.parquet')
    })

    it('should generate JSON source code', () => {
      const nodes = [
        createSourceNode('node_1', 'JSON Source', 'json', {
          path: '/data/input.json',
          multiLine: true,
        }),
      ]

      const result = generatePySparkCode(nodes as Node<ETLNodeData>[], [])

      expect(result.code).toContain('.format("json")')
      expect(result.code).toContain('/data/input.json')
    })

    it('should generate JDBC source code', () => {
      const nodes = [
        createSourceNode('node_1', 'Database', 'jdbc', {
          url: 'jdbc:postgresql://localhost:5432/db',
          dbtable: 'users',
          user: 'admin',
        }),
      ]

      const result = generatePySparkCode(nodes as Node<ETLNodeData>[], [])

      expect(result.code).toContain('.format("jdbc")')
      expect(result.code).toContain('jdbc:postgresql')
      expect(result.code).toContain('dbtable')
    })
  })

  describe('transform nodes', () => {
    it('should generate filter code with simple condition', () => {
      const nodes = [
        createSourceNode('node_1', 'Source', 'csv', { path: '/data.csv' }),
        createTransformNode('node_2', 'Filter', 'filter', {
          mode: 'simple',
          conditions: [
            { column: 'status', operator: '==', value: 'active' },
          ],
        }),
      ]
      const edges = [createEdge('node_1', 'node_2')]

      const result = generatePySparkCode(nodes as Node<ETLNodeData>[], edges)

      expect(result.code).toContain('.filter(')
      expect(result.code).toContain('status')
    })

    it('should generate select code', () => {
      const nodes = [
        createSourceNode('node_1', 'Source', 'csv', { path: '/data.csv' }),
        createTransformNode('node_2', 'Select', 'select', {
          columns: 'id, name, email',
        }),
      ]
      const edges = [createEdge('node_1', 'node_2')]

      const result = generatePySparkCode(nodes as Node<ETLNodeData>[], edges)

      expect(result.code).toContain('.select(')
      expect(result.code).toContain('"id"')
      expect(result.code).toContain('"name"')
    })

    it('should generate join code', () => {
      const nodes = [
        createSourceNode('node_1', 'Orders', 'csv', { path: '/orders.csv' }),
        createSourceNode('node_2', 'Customers', 'csv', { path: '/customers.csv' }),
        createTransformNode('node_3', 'Join', 'join', {
          joinType: 'inner',
          leftColumn: 'customer_id',
          rightColumn: 'id',
        }),
      ]
      const edges = [
        createEdge('node_1', 'node_3'),
        createEdge('node_2', 'node_3', 'input-2'),
      ]

      const result = generatePySparkCode(nodes as Node<ETLNodeData>[], edges)

      expect(result.code).toContain('.join(')
      expect(result.code).toContain('inner')
    })

    it('should generate groupBy code', () => {
      const nodes = [
        createSourceNode('node_1', 'Source', 'csv', { path: '/data.csv' }),
        createTransformNode('node_2', 'GroupBy', 'groupBy', {
          groupByColumns: 'department',
          aggregations: [
            { column: 'salary', function: 'avg', alias: 'avg_salary' },
            { column: '*', function: 'count', alias: 'count' },
          ],
        }),
      ]
      const edges = [createEdge('node_1', 'node_2')]

      const result = generatePySparkCode(nodes as Node<ETLNodeData>[], edges)

      expect(result.code).toContain('.groupBy(')
      expect(result.code).toContain('.agg(')
    })

    it('should generate sort code', () => {
      const nodes = [
        createSourceNode('node_1', 'Source', 'csv', { path: '/data.csv' }),
        createTransformNode('node_2', 'Sort', 'sort', {
          sortColumns: [{ column: 'created_at', direction: 'desc' }],
        }),
      ]
      const edges = [createEdge('node_1', 'node_2')]

      const result = generatePySparkCode(nodes as Node<ETLNodeData>[], edges)

      expect(result.code).toContain('.orderBy(')
      expect(result.code).toContain('.desc()')
    })

    it('should generate distinct code', () => {
      const nodes = [
        createSourceNode('node_1', 'Source', 'csv', { path: '/data.csv' }),
        createTransformNode('node_2', 'Distinct', 'distinct', {}),
      ]
      const edges = [createEdge('node_1', 'node_2')]

      const result = generatePySparkCode(nodes as Node<ETLNodeData>[], edges)

      expect(result.code).toContain('.distinct()')
    })

    it('should generate union code', () => {
      const nodes = [
        createSourceNode('node_1', 'Source1', 'csv', { path: '/data1.csv' }),
        createSourceNode('node_2', 'Source2', 'csv', { path: '/data2.csv' }),
        createTransformNode('node_3', 'Union', 'union', {}),
      ]
      const edges = [
        createEdge('node_1', 'node_3'),
        createEdge('node_2', 'node_3', 'input-2'),
      ]

      const result = generatePySparkCode(nodes as Node<ETLNodeData>[], edges)

      expect(result.code).toContain('.union(')
    })

    it('should generate limit code', () => {
      const nodes = [
        createSourceNode('node_1', 'Source', 'csv', { path: '/data.csv' }),
        createTransformNode('node_2', 'Limit', 'limit', { n: 100 }),
      ]
      const edges = [createEdge('node_1', 'node_2')]

      const result = generatePySparkCode(nodes as Node<ETLNodeData>[], edges)

      expect(result.code).toContain('.limit(100)')
    })

    it('should generate dropColumn code', () => {
      const nodes = [
        createSourceNode('node_1', 'Source', 'csv', { path: '/data.csv' }),
        createTransformNode('node_2', 'Drop Columns', 'dropColumn', {
          columns: 'temp_col, debug_col',
        }),
      ]
      const edges = [createEdge('node_1', 'node_2')]

      const result = generatePySparkCode(nodes as Node<ETLNodeData>[], edges)

      expect(result.code).toContain('.drop(')
    })

    it('should generate rename code', () => {
      const nodes = [
        createSourceNode('node_1', 'Source', 'csv', { path: '/data.csv' }),
        createTransformNode('node_2', 'Rename', 'rename', {
          renameMappings: [{ oldName: 'old_col', newName: 'new_col' }],
        }),
      ]
      const edges = [createEdge('node_1', 'node_2')]

      const result = generatePySparkCode(nodes as Node<ETLNodeData>[], edges)

      expect(result.code).toContain('.withColumnRenamed(')
      expect(result.code).toContain('old_col')
      expect(result.code).toContain('new_col')
    })
  })

  describe('sink nodes', () => {
    it('should generate CSV sink code', () => {
      const nodes = [
        createSourceNode('node_1', 'Source', 'csv', { path: '/input.csv' }),
        createSinkNode('node_2', 'Output', 'csv', {
          path: '/output.csv',
          mode: 'overwrite',
          header: true,
        }),
      ]
      const edges = [createEdge('node_1', 'node_2')]

      const result = generatePySparkCode(nodes as Node<ETLNodeData>[], edges)

      expect(result.code).toContain('.write')
      expect(result.code).toContain('.format("csv")')
      expect(result.code).toContain('.mode("overwrite")')
    })

    it('should generate Parquet sink code', () => {
      const nodes = [
        createSourceNode('node_1', 'Source', 'csv', { path: '/input.csv' }),
        createSinkNode('node_2', 'Output', 'parquet', {
          path: '/output.parquet',
          mode: 'append',
        }),
      ]
      const edges = [createEdge('node_1', 'node_2')]

      const result = generatePySparkCode(nodes as Node<ETLNodeData>[], edges)

      expect(result.code).toContain('.write')
      expect(result.code).toContain('parquet')
    })

    it('should generate console sink code', () => {
      const nodes = [
        createSourceNode('node_1', 'Source', 'csv', { path: '/input.csv' }),
        createSinkNode('node_2', 'Show', 'console', {
          numRows: 50,
          truncate: false,
        }),
      ]
      const edges = [createEdge('node_1', 'node_2')]

      const result = generatePySparkCode(nodes as Node<ETLNodeData>[], edges)

      expect(result.code).toContain('.show(')
    })
  })

  describe('complete workflow', () => {
    it('should generate code for source -> transform -> sink', () => {
      const nodes = [
        createSourceNode('node_1', 'Input', 'csv', { path: '/data.csv' }),
        createTransformNode('node_2', 'Filter Active', 'filter', {
          mode: 'simple',
          conditions: [{ column: 'status', operator: '==', value: 'active' }],
        }),
        createSinkNode('node_3', 'Output', 'parquet', { path: '/output' }),
      ]
      const edges = [
        createEdge('node_1', 'node_2'),
        createEdge('node_2', 'node_3'),
      ]

      const result = generatePySparkCode(nodes as Node<ETLNodeData>[], edges)

      expect(result.code).toContain('SparkSession')
      expect(result.code).toContain('.format("csv")')
      expect(result.code).toContain('.filter(')
      expect(result.code).toContain('.write')
      expect(result.code).toContain('spark.stop()')
      expect(result.errors).toHaveLength(0)
    })

    it('should include all cells for each node', () => {
      const nodes = [
        createSourceNode('node_1', 'Input', 'csv', { path: '/data.csv' }),
        createTransformNode('node_2', 'Transform', 'filter', {}),
        createSinkNode('node_3', 'Output', 'parquet', { path: '/out' }),
      ]
      const edges = [
        createEdge('node_1', 'node_2'),
        createEdge('node_2', 'node_3'),
      ]

      const result = generatePySparkCode(nodes as Node<ETLNodeData>[], edges)

      // Should have imports, spark session, 3 node cells, and footer
      expect(result.cells.length).toBeGreaterThanOrEqual(5)

      // Check cell categories
      const categories = result.cells.map(c => c.category)
      expect(categories).toContain('imports')
      expect(categories).toContain('source')
      expect(categories).toContain('transform')
      expect(categories).toContain('sink')
      expect(categories).toContain('footer')
    })
  })

  describe('code output format', () => {
    it('should include generation timestamp', () => {
      const nodes = [createSourceNode('1', 'Src', 'csv', { path: '/data.csv' })]

      const result = generatePySparkCode(nodes as Node<ETLNodeData>[], [])

      expect(result.code).toContain('Generated at:')
    })

    it('should include pipeline summary', () => {
      const nodes = [
        createSourceNode('1', 'Src', 'csv', { path: '/data.csv' }),
        createSinkNode('2', 'Out', 'parquet', { path: '/out' }),
      ]
      const edges = [createEdge('1', '2')]

      const result = generatePySparkCode(nodes as Node<ETLNodeData>[], edges)

      expect(result.code).toContain('2 nodes')
      expect(result.code).toContain('1 connections')
    })

    it('should end with spark.stop()', () => {
      const nodes = [createSourceNode('1', 'Src', 'csv', { path: '/data.csv' })]

      const result = generatePySparkCode(nodes as Node<ETLNodeData>[], [])

      expect(result.code).toContain('spark.stop()')
    })
  })
})
