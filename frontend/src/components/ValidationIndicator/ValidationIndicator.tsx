import { useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react';
import type { ETLNodeData, SourceNodeData, TransformNodeData, SinkNodeData } from '../../types';

export type ValidationSeverity = 'error' | 'warning' | 'info' | 'success';

export interface ValidationMessage {
  severity: ValidationSeverity;
  message: string;
  field?: string;
}

interface ValidationIndicatorProps {
  nodeData: ETLNodeData;
  compact?: boolean;
}

// Validate source node configuration
const validateSourceNode = (data: SourceNodeData): ValidationMessage[] => {
  const messages: ValidationMessage[] = [];
  const config = data.config || {};

  switch (data.nodeType) {
    case 'csv':
    case 'parquet':
    case 'json':
    case 'excel':
    case 'orc':
    case 'avro':
      if (!config.path) {
        messages.push({ severity: 'error', message: 'File path is required', field: 'path' });
      }
      break;

    case 'jdbc':
    case 'mysql':
    case 'postgres':
    case 'sqlserver':
    case 'oracle':
      if (!config.url) {
        messages.push({ severity: 'error', message: 'JDBC URL is required', field: 'url' });
      }
      if (!config.table && !config.query) {
        messages.push({ severity: 'error', message: 'Table or query is required', field: 'table' });
      }
      break;

    case 'kafka':
      if (!config.servers) {
        messages.push({ severity: 'error', message: 'Bootstrap servers required', field: 'servers' });
      }
      if (!config.topic) {
        messages.push({ severity: 'error', message: 'Topic is required', field: 'topic' });
      }
      break;

    case 'delta':
      if (!config.path) {
        messages.push({ severity: 'error', message: 'Delta path is required', field: 'path' });
      }
      break;

    case 's3':
      if (!config.bucket) {
        messages.push({ severity: 'error', message: 'S3 bucket is required', field: 'bucket' });
      }
      break;

    case 'mongodb':
      if (!config.connectionUri) {
        messages.push({ severity: 'error', message: 'MongoDB URI is required', field: 'connectionUri' });
      }
      if (!config.database || !config.collection) {
        messages.push({ severity: 'error', message: 'Database and collection required', field: 'database' });
      }
      break;

    case 'elasticsearch':
      if (!config.hosts) {
        messages.push({ severity: 'error', message: 'ES hosts required', field: 'hosts' });
      }
      if (!config.index) {
        messages.push({ severity: 'error', message: 'Index is required', field: 'index' });
      }
      break;
  }

  // Check for schema definition
  if (!config.schema && !config.inferSchema) {
    messages.push({ severity: 'info', message: 'Consider defining schema for better performance' });
  }

  if (messages.length === 0) {
    messages.push({ severity: 'success', message: 'Configuration is valid' });
  }

  return messages;
};

// Helper to check if a config property is a non-empty array
const isNonEmptyArray = (val: unknown): boolean => {
  return Array.isArray(val) && val.length > 0;
};

// Helper to check if a config property is a non-empty object
const isNonEmptyObject = (val: unknown): boolean => {
  return typeof val === 'object' && val !== null && !Array.isArray(val) && Object.keys(val).length > 0;
};

// Validate transform node configuration
const validateTransformNode = (data: TransformNodeData): ValidationMessage[] => {
  const messages: ValidationMessage[] = [];
  const config = data.config || {};

  switch (data.transformType) {
    case 'filter':
      // FilterConfig has 3 modes: 'simple', 'advanced', 'sql'
      if (config.mode === 'sql') {
        if (!config.sqlExpression || (typeof config.sqlExpression === 'string' && !config.sqlExpression.trim())) {
          messages.push({ severity: 'error', message: 'SQL expression is required', field: 'sqlExpression' });
        }
      } else if (config.mode === 'advanced') {
        if (!config.conditionGroups) {
          messages.push({ severity: 'error', message: 'Filter conditions required', field: 'conditionGroups' });
        }
      } else {
        // Simple mode or unset - check conditions array
        if (!isNonEmptyArray(config.conditions)) {
          messages.push({ severity: 'error', message: 'Filter condition is required', field: 'conditions' });
        } else {
          // Check if any condition has a column selected
          const hasValidCondition = (config.conditions as Array<{ column: string }>).some(c => c.column);
          if (!hasValidCondition) {
            messages.push({ severity: 'error', message: 'At least one condition needs a column', field: 'conditions' });
          }
        }
      }
      break;

    case 'join':
      if (!config.joinType) {
        messages.push({ severity: 'warning', message: 'Join type not specified, using inner', field: 'joinType' });
      }
      // JoinConfig has conditionMode: 'sameColumn', 'differentColumns', 'expression'
      // Cross join doesn't need join conditions
      if (config.joinType !== 'cross') {
        if (config.conditionMode === 'sameColumn') {
          if (!config.sameColumns || (typeof config.sameColumns === 'string' && !config.sameColumns.trim())) {
            messages.push({ severity: 'error', message: 'Join columns required', field: 'sameColumns' });
          }
        } else if (config.conditionMode === 'differentColumns') {
          if (!isNonEmptyArray(config.columnPairs)) {
            messages.push({ severity: 'error', message: 'Column pairs required', field: 'columnPairs' });
          } else {
            const validPairs = (config.columnPairs as Array<{ leftColumn: string; rightColumn: string }>)
              .filter(p => p.leftColumn && p.rightColumn);
            if (validPairs.length === 0) {
              messages.push({ severity: 'error', message: 'At least one complete column pair required', field: 'columnPairs' });
            }
          }
        } else if (config.conditionMode === 'expression') {
          if (!config.expression || (typeof config.expression === 'string' && !config.expression.trim())) {
            messages.push({ severity: 'error', message: 'Join expression required', field: 'expression' });
          }
        } else {
          // Default: no condition mode set
          if (!config.sameColumns && !config.columnPairs && !config.expression) {
            messages.push({ severity: 'error', message: 'Join condition required', field: 'conditionMode' });
          }
        }
      }
      break;

    case 'groupBy':
      // GroupByConfig saves 'groupByColumns' as comma-separated string
      if (!config.groupByColumns || (typeof config.groupByColumns === 'string' && !config.groupByColumns.trim())) {
        messages.push({ severity: 'error', message: 'Group by columns required', field: 'groupByColumns' });
      }
      if (!isNonEmptyArray(config.aggregations)) {
        messages.push({ severity: 'warning', message: 'No aggregations defined', field: 'aggregations' });
      } else {
        // Check if aggregations have aliases
        const hasEmptyAlias = (config.aggregations as Array<{ alias: string }>).some(a => !a.alias);
        if (hasEmptyAlias) {
          messages.push({ severity: 'error', message: 'All aggregations need an alias', field: 'aggregations' });
        }
      }
      break;

    case 'select':
      // SelectConfig saves columns as comma-separated string, not array
      // Empty string means "select all" which is valid
      // Only error if computedColumns exist without proper aliases
      if (config.computedColumns && Array.isArray(config.computedColumns)) {
        const invalidComputed = (config.computedColumns as Array<{ expression: string; alias: string }>)
          .filter(c => c.expression && !c.alias);
        if (invalidComputed.length > 0) {
          messages.push({ severity: 'error', message: 'Computed columns need aliases', field: 'computedColumns' });
        }
      }
      break;

    case 'sort':
      // SortConfig saves 'sortColumns' as array, not 'columns'
      if (!isNonEmptyArray(config.sortColumns)) {
        messages.push({ severity: 'error', message: 'Sort columns required', field: 'sortColumns' });
      } else {
        // Check if any sort column has an empty column name
        const hasEmptyColumn = (config.sortColumns as Array<{ column: string }>).some(sc => !sc.column);
        if (hasEmptyColumn) {
          messages.push({ severity: 'error', message: 'All sort columns must have a column selected', field: 'sortColumns' });
        }
      }
      break;

    case 'window':
      if (!isNonEmptyArray(config.partitionBy)) {
        messages.push({ severity: 'warning', message: 'No partition columns defined', field: 'partitionBy' });
      }
      if (!isNonEmptyArray(config.functions)) {
        messages.push({ severity: 'error', message: 'Window functions required', field: 'functions' });
      }
      break;

    case 'addColumn':
      if (!config.columnName) {
        messages.push({ severity: 'error', message: 'Column name is required', field: 'columnName' });
      }
      if (!config.expression) {
        messages.push({ severity: 'error', message: 'Expression is required', field: 'expression' });
      }
      break;

    case 'rename':
      if (!isNonEmptyObject(config.renames)) {
        messages.push({ severity: 'error', message: 'Rename mappings required', field: 'renames' });
      }
      break;

    case 'dropColumn':
      if (!isNonEmptyArray(config.columns)) {
        messages.push({ severity: 'error', message: 'Columns to drop required', field: 'columns' });
      }
      break;

    case 'pivot':
      if (!config.groupBy || !config.pivotColumn || !config.aggColumn) {
        messages.push({ severity: 'error', message: 'Pivot configuration incomplete', field: 'pivotColumn' });
      }
      break;

    case 'unpivot':
      if (!isNonEmptyArray(config.idColumns)) {
        messages.push({ severity: 'error', message: 'ID columns required', field: 'idColumns' });
      }
      if (!isNonEmptyArray(config.valueColumns)) {
        messages.push({ severity: 'error', message: 'Value columns required', field: 'valueColumns' });
      }
      break;

    case 'repartition':
      if (!config.numPartitions && !isNonEmptyArray(config.columns)) {
        messages.push({ severity: 'warning', message: 'Specify partitions or columns', field: 'numPartitions' });
      }
      break;

    case 'deltaMerge':
      if (!config.targetPath) {
        messages.push({ severity: 'error', message: 'Target path is required', field: 'targetPath' });
      }
      if (!config.condition) {
        messages.push({ severity: 'error', message: 'Merge condition required', field: 'condition' });
      }
      break;

    case 'watermark':
      if (!config.column) {
        messages.push({ severity: 'error', message: 'Event time column required', field: 'column' });
      }
      if (!config.delay) {
        messages.push({ severity: 'error', message: 'Delay threshold required', field: 'delay' });
      }
      break;

    case 'pythonUdf':
    case 'pandasUdf':
      if (!config.functionName) {
        messages.push({ severity: 'error', message: 'Function name required', field: 'functionName' });
      }
      if (!config.functionBody) {
        messages.push({ severity: 'error', message: 'Function body required', field: 'functionBody' });
      }
      break;

    case 'greatExpectations':
      if (!isNonEmptyArray(config.expectations)) {
        messages.push({ severity: 'warning', message: 'No expectations defined', field: 'expectations' });
      }
      break;

    case 'dataAssertions':
      if (!isNonEmptyArray(config.assertions)) {
        messages.push({ severity: 'warning', message: 'No assertions defined', field: 'assertions' });
      }
      break;

    case 'schemaValidation':
      if (!isNonEmptyArray(config.expectedSchema)) {
        messages.push({ severity: 'error', message: 'Expected schema required', field: 'expectedSchema' });
      }
      break;

    case 'bucketing':
      if (!config.numBuckets) {
        messages.push({ severity: 'error', message: 'Number of buckets required', field: 'numBuckets' });
      }
      if (!isNonEmptyArray(config.bucketColumns)) {
        messages.push({ severity: 'error', message: 'Bucket columns required', field: 'bucketColumns' });
      }
      if (!config.tableName) {
        messages.push({ severity: 'error', message: 'Table name required', field: 'tableName' });
      }
      break;

    // Transforms that don't require configuration
    case 'distinct':
    case 'cache':
    case 'checkpoint':
    case 'unpersist':
    case 'explain':
    case 'union':
    case 'unionAll':
    case 'intersect':
    case 'subtract':
    case 'describe':
    case 'sparkConfig':
      // These are valid without configuration
      break;

    default:
      // For other transforms, check if they have any config
      if (Object.keys(config).length === 0 && !data.configured) {
        messages.push({ severity: 'info', message: 'Node not yet configured' });
      }
  }

  if (messages.length === 0) {
    messages.push({ severity: 'success', message: 'Configuration is valid' });
  }

  return messages;
};

// Validate sink node configuration
const validateSinkNode = (data: SinkNodeData): ValidationMessage[] => {
  const messages: ValidationMessage[] = [];
  const config = data.config || {};

  switch (data.nodeType) {
    case 'csv':
    case 'parquet':
    case 'json':
    case 'orc':
    case 'avro':
      if (!config.path) {
        messages.push({ severity: 'error', message: 'Output path is required', field: 'path' });
      }
      break;

    case 'jdbc':
    case 'mysql':
    case 'postgres':
    case 'sqlserver':
    case 'oracle':
      if (!config.url) {
        messages.push({ severity: 'error', message: 'JDBC URL is required', field: 'url' });
      }
      if (!config.table) {
        messages.push({ severity: 'error', message: 'Table name is required', field: 'table' });
      }
      break;

    case 'kafka':
      if (!config.servers) {
        messages.push({ severity: 'error', message: 'Bootstrap servers required', field: 'servers' });
      }
      if (!config.topic) {
        messages.push({ severity: 'error', message: 'Topic is required', field: 'topic' });
      }
      break;

    case 'delta':
      if (!config.path) {
        messages.push({ severity: 'error', message: 'Delta path is required', field: 'path' });
      }
      break;

    case 'console':
    case 'memory':
      // These don't require much configuration
      break;
  }

  // Check write mode
  if (!config.mode) {
    messages.push({ severity: 'info', message: 'Write mode not specified, using default' });
  }

  if (messages.length === 0) {
    messages.push({ severity: 'success', message: 'Configuration is valid' });
  }

  return messages;
};

// Get validation messages for any node type
export const getValidationMessages = (data: ETLNodeData): ValidationMessage[] => {
  switch (data.category) {
    case 'source':
      return validateSourceNode(data as SourceNodeData);
    case 'transform':
      return validateTransformNode(data as TransformNodeData);
    case 'sink':
      return validateSinkNode(data as SinkNodeData);
    default:
      return [{ severity: 'info', message: 'Unknown node type' }];
  }
};

// Get overall validation status
export const getValidationStatus = (messages: ValidationMessage[]): ValidationSeverity => {
  if (messages.some(m => m.severity === 'error')) return 'error';
  if (messages.some(m => m.severity === 'warning')) return 'warning';
  if (messages.some(m => m.severity === 'info')) return 'info';
  return 'success';
};

// Get icon for severity
const getIcon = (severity: ValidationSeverity) => {
  switch (severity) {
    case 'error':
      return <XCircle className="w-4 h-4 text-red-400" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    case 'info':
      return <Info className="w-4 h-4 text-blue-400" />;
    case 'success':
      return <CheckCircle className="w-4 h-4 text-green-400" />;
  }
};

// Get background color for severity
const getBgColor = (severity: ValidationSeverity) => {
  switch (severity) {
    case 'error':
      return 'bg-red-500/10 border-red-500/30';
    case 'warning':
      return 'bg-yellow-500/10 border-yellow-500/30';
    case 'info':
      return 'bg-blue-500/10 border-blue-500/30';
    case 'success':
      return 'bg-green-500/10 border-green-500/30';
  }
};

export const ValidationIndicator = ({ nodeData, compact = false }: ValidationIndicatorProps) => {
  const messages = useMemo(() => getValidationMessages(nodeData), [nodeData]);
  const status = useMemo(() => getValidationStatus(messages), [messages]);

  if (compact) {
    // Just show an icon for the overall status
    return (
      <div className="flex items-center" title={messages[0]?.message || 'Validation status'}>
        {getIcon(status)}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex items-start gap-2 p-2 rounded border ${getBgColor(msg.severity)}`}
        >
          {getIcon(msg.severity)}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-300">{msg.message}</p>
            {msg.field && (
              <span className="text-xs text-gray-500">Field: {msg.field}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
