import { useState } from 'react';
import {
  Database,
  ChevronDown,
  ChevronRight,
  Type,
  Hash,
  Calendar,
  ToggleLeft,
  Binary,
  List,
  Box,
  MapPin,
  Clock,
  AlertCircle,
} from 'lucide-react';
import type { ETLNodeData, SourceNodeData, TransformNodeData } from '../../types';

interface ColumnSchema {
  name: string;
  dataType: string;
  nullable?: boolean;
  description?: string;
}

interface SchemaPreviewProps {
  nodeData: ETLNodeData;
  availableColumns?: { name: string; dataType: string; source: string }[];
}

// Map data types to icons
const getTypeIcon = (dataType: string) => {
  const type = dataType.toLowerCase();
  if (type.includes('string') || type.includes('varchar') || type.includes('char') || type.includes('text')) {
    return Type;
  }
  if (type.includes('int') || type.includes('long') || type.includes('short') || type.includes('decimal') || type.includes('double') || type.includes('float') || type.includes('numeric')) {
    return Hash;
  }
  if (type.includes('date') && !type.includes('time')) {
    return Calendar;
  }
  if (type.includes('timestamp') || type.includes('datetime') || type.includes('time')) {
    return Clock;
  }
  if (type.includes('bool')) {
    return ToggleLeft;
  }
  if (type.includes('binary') || type.includes('byte')) {
    return Binary;
  }
  if (type.includes('array') || type.includes('list')) {
    return List;
  }
  if (type.includes('struct') || type.includes('map') || type.includes('object')) {
    return Box;
  }
  return MapPin;
};

// Get color for data type category
const getTypeColor = (dataType: string) => {
  const type = dataType.toLowerCase();
  if (type.includes('string') || type.includes('varchar') || type.includes('char') || type.includes('text')) {
    return 'text-green-400';
  }
  if (type.includes('int') || type.includes('long') || type.includes('short') || type.includes('decimal') || type.includes('double') || type.includes('float') || type.includes('numeric')) {
    return 'text-blue-400';
  }
  if (type.includes('date') || type.includes('timestamp') || type.includes('datetime') || type.includes('time')) {
    return 'text-purple-400';
  }
  if (type.includes('bool')) {
    return 'text-yellow-400';
  }
  if (type.includes('binary') || type.includes('byte')) {
    return 'text-gray-400';
  }
  if (type.includes('array') || type.includes('list') || type.includes('struct') || type.includes('map')) {
    return 'text-orange-400';
  }
  return 'text-gray-400';
};

// Extract schema from source node configuration
const getSourceSchema = (data: SourceNodeData): ColumnSchema[] => {
  const config = data.config || {};

  // Check for explicit schema definition
  if (config.schema && Array.isArray(config.schema)) {
    return config.schema;
  }

  // Check for inferSchema flag
  if (config.inferSchema) {
    return [{ name: '(Schema will be inferred at runtime)', dataType: 'auto', description: 'Enable schema inference' }];
  }

  // Generate sample schema based on source type
  switch (data.nodeType) {
    case 'csv':
    case 'parquet':
    case 'json':
    case 'excel':
      return [
        { name: '(Schema from file)', dataType: 'auto', description: 'Schema will be read from file' }
      ];
    case 'jdbc':
    case 'mysql':
    case 'postgres':
    case 'sqlserver':
    case 'oracle':
      return [
        { name: '(Schema from database)', dataType: 'auto', description: 'Schema will be queried from database' }
      ];
    case 'kafka':
      return [
        { name: 'key', dataType: 'binary', nullable: true },
        { name: 'value', dataType: 'binary', nullable: false },
        { name: 'topic', dataType: 'string', nullable: false },
        { name: 'partition', dataType: 'integer', nullable: false },
        { name: 'offset', dataType: 'long', nullable: false },
        { name: 'timestamp', dataType: 'timestamp', nullable: false },
      ];
    case 'delta':
      return [
        { name: '(Schema from Delta table)', dataType: 'auto', description: 'Schema managed by Delta Lake' }
      ];
    default:
      return [];
  }
};

// Infer output schema from transform configuration
const getTransformSchema = (data: TransformNodeData, inputColumns: ColumnSchema[]): ColumnSchema[] => {
  const config = data.config || {} as Record<string, unknown>;

  switch (data.nodeType) {
    case 'select':
      if (config.columns && Array.isArray(config.columns)) {
        return (config.columns as string[]).map((col: string) => {
          const existing = inputColumns.find(c => c.name === col);
          return existing || { name: col, dataType: 'unknown' };
        });
      }
      return inputColumns;

    case 'rename':
      if (config.renames && typeof config.renames === 'object') {
        const renames = config.renames as Record<string, string>;
        return inputColumns.map(col => ({
          ...col,
          name: renames[col.name] || col.name
        }));
      }
      return inputColumns;

    case 'cast':
      if (config.casts && typeof config.casts === 'object') {
        const casts = config.casts as Record<string, string>;
        return inputColumns.map(col => ({
          ...col,
          dataType: casts[col.name] || col.dataType
        }));
      }
      return inputColumns;

    case 'withColumn':
      if (config.columnName) {
        return [
          ...inputColumns,
          { name: String(config.columnName), dataType: String(config.dataType || 'string') }
        ];
      }
      return inputColumns;

    case 'drop':
      if (config.columns && Array.isArray(config.columns)) {
        const dropCols = config.columns as string[];
        return inputColumns.filter(col => !dropCols.includes(col.name));
      }
      return inputColumns;

    case 'filter':
    case 'where':
    case 'distinct':
    case 'sort':
    case 'limit':
    case 'sample':
    case 'cache':
    case 'checkpoint':
    case 'repartition':
    case 'coalesce':
      return inputColumns; // Schema unchanged

    case 'aggregate':
    case 'groupBy':
      const groupCols: ColumnSchema[] = [];
      if (config.groupBy && Array.isArray(config.groupBy)) {
        config.groupBy.forEach((col: string) => {
          const existing = inputColumns.find(c => c.name === col);
          groupCols.push(existing || { name: col, dataType: 'unknown' });
        });
      }
      if (config.aggregations && Array.isArray(config.aggregations)) {
        config.aggregations.forEach((agg: { column: string; function: string; alias?: string }) => {
          groupCols.push({
            name: agg.alias || `${agg.function}_${agg.column}`,
            dataType: agg.function === 'count' ? 'long' : 'double'
          });
        });
      }
      return groupCols.length > 0 ? groupCols : inputColumns;

    case 'window':
      if (config.windowFunctions && Array.isArray(config.windowFunctions)) {
        const newCols = config.windowFunctions.map((wf: { alias: string; function: string }) => ({
          name: wf.alias || 'window_result',
          dataType: wf.function === 'row_number' || wf.function === 'rank' ? 'integer' : 'double'
        }));
        return [...inputColumns, ...newCols];
      }
      return inputColumns;

    case 'join':
      // For joins, we'd need both input schemas
      return [
        ...inputColumns,
        { name: '(+ joined columns)', dataType: 'varies', description: 'Columns from right side of join' }
      ];

    case 'union':
      return inputColumns;

    case 'pivot':
      return [
        { name: '(pivoted schema)', dataType: 'varies', description: 'Pivot columns generated dynamically' }
      ];

    case 'unpivot':
      if (config.variableColumnName && config.valueColumnName) {
        const idCols = Array.isArray(config.idColumns) ? config.idColumns as string[] : [];
        const keepCols = inputColumns.filter(col => idCols.includes(col.name));
        return [
          ...keepCols,
          { name: String(config.variableColumnName), dataType: 'string' },
          { name: String(config.valueColumnName), dataType: 'string' }
        ];
      }
      return inputColumns;

    case 'explode':
      if (config.column) {
        return inputColumns.map(col => ({
          ...col,
          dataType: col.name === config.column ? 'element_type' : col.dataType
        }));
      }
      return inputColumns;

    case 'flatten':
      return [
        { name: '(flattened schema)', dataType: 'varies', description: 'Nested fields extracted to top level' }
      ];

    default:
      return inputColumns;
  }
};

interface SchemaColumnRowProps {
  column: ColumnSchema;
  index: number;
}

const SchemaColumnRow = ({ column, index }: SchemaColumnRowProps) => {
  const Icon = getTypeIcon(column.dataType);
  const colorClass = getTypeColor(column.dataType);

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 ${
        index % 2 === 0 ? 'bg-panel-light/30' : ''
      } hover:bg-accent/10 transition-colors`}
    >
      <Icon className={`w-4 h-4 ${colorClass} flex-shrink-0`} />
      <span className="text-sm text-white flex-1 truncate">{column.name}</span>
      <span className={`text-xs ${colorClass} font-mono`}>{column.dataType}</span>
      {column.nullable === false && (
        <span className="text-xs text-red-400 px-1.5 py-0.5 bg-red-500/20 rounded">NOT NULL</span>
      )}
    </div>
  );
};

export const SchemaPreview = ({ nodeData, availableColumns }: SchemaPreviewProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Determine schema based on node type
  let schema: ColumnSchema[] = [];
  let schemaSource = '';

  if (nodeData.category === 'source') {
    schema = getSourceSchema(nodeData as SourceNodeData);
    schemaSource = 'Source Schema';
  } else if (nodeData.category === 'transform') {
    // Use available columns as input schema
    const inputSchema: ColumnSchema[] = (availableColumns || []).map(col => ({
      name: col.name,
      dataType: col.dataType
    }));
    schema = getTransformSchema(nodeData as TransformNodeData, inputSchema);
    schemaSource = 'Output Schema';
  } else if (nodeData.category === 'sink') {
    // Sink schema is typically the same as input
    schema = (availableColumns || []).map(col => ({
      name: col.name,
      dataType: col.dataType
    }));
    schemaSource = 'Output Schema';
  }

  if (schema.length === 0 && availableColumns && availableColumns.length > 0) {
    schema = availableColumns.map(col => ({
      name: col.name,
      dataType: col.dataType
    }));
    schemaSource = 'Available Columns';
  }

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-panel-light hover:bg-gray-700 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
        <Database className="w-4 h-4 text-accent" />
        <span className="text-sm font-medium text-white flex-1 text-left">{schemaSource}</span>
        <span className="text-xs text-gray-400">{schema.length} columns</span>
      </button>

      {/* Schema List */}
      {isExpanded && (
        <div className="max-h-48 overflow-y-auto">
          {schema.length > 0 ? (
            schema.map((column, index) => (
              <SchemaColumnRow key={column.name + index} column={column} index={index} />
            ))
          ) : (
            <div className="flex items-center gap-2 px-3 py-4 text-gray-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">No schema information available</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
