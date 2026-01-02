import type { Node, Edge } from '@xyflow/react';
import type { ETLNodeData } from '../../types';

// Flexible column interface that accepts optional nullable
interface SchemaColumn {
  name: string;
  dataType: string;
  nullable?: boolean;
}

// Map common data type names to PySpark types
export const mapDataTypeToPySpark = (dataType: string): string => {
  const type = dataType.toLowerCase().trim();

  // Handle complex types
  if (type.startsWith('array<')) {
    const innerType = type.slice(6, -1);
    return `ArrayType(${mapDataTypeToPySpark(innerType)})`;
  }
  if (type.startsWith('map<')) {
    const inner = type.slice(4, -1);
    const [keyType, valueType] = inner.split(',').map(t => t.trim());
    return `MapType(${mapDataTypeToPySpark(keyType)}, ${mapDataTypeToPySpark(valueType)})`;
  }
  if (type.startsWith('struct<')) {
    // For struct, return as string to be handled specially
    return `"${dataType}"`;
  }
  if (type.startsWith('decimal(')) {
    const match = type.match(/decimal\((\d+),?\s*(\d+)?\)/);
    if (match) {
      const precision = match[1] || '10';
      const scale = match[2] || '0';
      return `DecimalType(${precision}, ${scale})`;
    }
    return 'DecimalType(10, 2)';
  }
  if (type === 'decimal') {
    return 'DecimalType(10, 2)';
  }

  // Handle primitive types
  const typeMap: Record<string, string> = {
    'string': 'StringType()',
    'integer': 'IntegerType()',
    'int': 'IntegerType()',
    'long': 'LongType()',
    'bigint': 'LongType()',
    'short': 'ShortType()',
    'smallint': 'ShortType()',
    'byte': 'ByteType()',
    'tinyint': 'ByteType()',
    'double': 'DoubleType()',
    'float': 'FloatType()',
    'boolean': 'BooleanType()',
    'bool': 'BooleanType()',
    'binary': 'BinaryType()',
    'date': 'DateType()',
    'timestamp': 'TimestampType()',
    'timestamp_ntz': 'TimestampNTZType()',
  };

  return typeMap[type] || 'StringType()';
};

// Generate PySpark StructType schema from columns
export const generateSchemaCode = (columns: SchemaColumn[], varName: string): string[] => {
  if (!columns || columns.length === 0) return [];

  const lines: string[] = [];
  lines.push(`# Schema definition for ${varName}`);
  lines.push(`${varName}_schema = StructType([`);

  columns.forEach((col, idx) => {
    const pyType = mapDataTypeToPySpark(col.dataType);
    const nullable = col.nullable !== false ? 'True' : 'False';
    const comma = idx < columns.length - 1 ? ',' : '';
    lines.push(`    StructField("${col.name}", ${pyType}, ${nullable})${comma}`);
  });

  lines.push(`])`);
  lines.push('');

  return lines;
};

// Helper to create safe variable names
export const toVarName = (nodeId: string, label: string): string => {
  const safeName = label.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
  return `df_${safeName}_${nodeId.replace('node_', '')}`;
};

// Topological sort to determine execution order
export const topologicalSort = (nodes: Node<ETLNodeData>[], edges: Edge[]): Node<ETLNodeData>[] => {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  // Initialize
  nodes.forEach(node => {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  });

  // Build graph
  edges.forEach(edge => {
    const targets = adjacency.get(edge.source) || [];
    targets.push(edge.target);
    adjacency.set(edge.source, targets);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });

  // Find nodes with no incoming edges
  const queue: string[] = [];
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) queue.push(nodeId);
  });

  const sorted: Node<ETLNodeData>[] = [];
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodes.find(n => n.id === nodeId);
    if (node) sorted.push(node);

    (adjacency.get(nodeId) || []).forEach(targetId => {
      const newDegree = (inDegree.get(targetId) || 1) - 1;
      inDegree.set(targetId, newDegree);
      if (newDegree === 0) queue.push(targetId);
    });
  }

  return sorted;
};

// Get input node(s) for a given node
export const getInputNodes = (nodeId: string, edges: Edge[]): { inputNodeId: string; handle: string | null }[] => {
  return edges
    .filter(e => e.target === nodeId)
    .map(e => ({ inputNodeId: e.source, handle: e.targetHandle ?? null }));
};
