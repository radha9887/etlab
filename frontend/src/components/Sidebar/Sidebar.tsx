import { useRef, useState, useEffect } from 'react';
import {
  Database,
  FileJson,
  FileSpreadsheet,
  Server,
  Radio,
  Cloud,
  Triangle,
  Filter,
  GitMerge,
  Layers,
  ArrowUpDown,
  Combine,
  Columns,
  Plus,
  Minus,
  Type,
  Hash,
  HardDrive,
  Upload,
  Download,
  Settings,
  Slice,
  Table,
  X,
  FileUp,
  Percent,
  Eraser,
  PaintBucket,
  CircleDot,
  MinusCircle,
  Split,
  RotateCcw,
  RotateCw,
  Grid3x3,
  RefreshCw,
  Ungroup,
  Box,
  BarChart3,
  TableProperties,
  ListChecks,
  FileBarChart,
  ChevronDown,
  ChevronRight,
  Search,
  FileText,
  FileCode,
  Wrench,
  Terminal,
  Loader2,
  // Preprocessing icons
  ScanSearch,
  CircleOff,
  Copy,
  WrapText,
  AlertTriangle,
  CheckCircle2,
  FileType,
  FileDigit,
  // Optimization icons
  Zap,
  // Feature Engineering icons
  Scale,
  Binary,
  Calendar,
  TextCursor,
  Scissors,
  // Delta Lake icons
  Pencil,
  Trash2,
  Clock,
  // Action icons
  Eye,
  FileSearch,
  Hash as HashIcon,
  List,
  Info,
  // New transform icons
  ArrowRightLeft,
  GitCompare,
  Shrink,
  GitBranch,
  // Tooltip icons
  Lightbulb,
} from 'lucide-react';
import type { DraggableNodeItem, Schema } from '../../types';
import { useSchemaStore } from '../../stores/schemaStore';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { getShortTip } from '../../utils/tips';

// ============================================
// Node Definitions with Categories
// ============================================

interface NodeCategory {
  name: string;
  icon: React.ReactNode;
  nodes: DraggableNodeItem[];
}

// Source categories
const sourceCategories: NodeCategory[] = [
  {
    name: 'File Formats',
    icon: <FileSpreadsheet className="w-3 h-3" />,
    nodes: [
      { type: 'source', category: 'source', label: 'CSV', icon: 'csv', sourceType: 'csv' },
      { type: 'source', category: 'source', label: 'JSON', icon: 'json', sourceType: 'json' },
      { type: 'source', category: 'source', label: 'Parquet', icon: 'parquet', sourceType: 'parquet' },
      { type: 'source', category: 'source', label: 'ORC', icon: 'orc', sourceType: 'orc' },
      { type: 'source', category: 'source', label: 'Avro', icon: 'avro', sourceType: 'avro' },
      { type: 'source', category: 'source', label: 'Text', icon: 'text', sourceType: 'text' },
      { type: 'source', category: 'source', label: 'Excel', icon: 'excel', sourceType: 'excel' },
      { type: 'source', category: 'source', label: 'XML', icon: 'xml', sourceType: 'xml' },
    ],
  },
  {
    name: 'Databases',
    icon: <Database className="w-3 h-3" />,
    nodes: [
      { type: 'source', category: 'source', label: 'JDBC', icon: 'jdbc', sourceType: 'jdbc' },
      { type: 'source', category: 'source', label: 'MongoDB', icon: 'mongodb', sourceType: 'mongodb' },
      { type: 'source', category: 'source', label: 'Cassandra', icon: 'cassandra', sourceType: 'cassandra' },
      { type: 'source', category: 'source', label: 'Elasticsearch', icon: 'elasticsearch', sourceType: 'elasticsearch' },
    ],
  },
  {
    name: 'Data Warehouses',
    icon: <Server className="w-3 h-3" />,
    nodes: [
      { type: 'source', category: 'source', label: 'Snowflake', icon: 'snowflake', sourceType: 'snowflake' },
      { type: 'source', category: 'source', label: 'BigQuery', icon: 'bigquery', sourceType: 'bigquery' },
      { type: 'source', category: 'source', label: 'Redshift', icon: 'redshift', sourceType: 'redshift' },
    ],
  },
  {
    name: 'Cloud Storage',
    icon: <Cloud className="w-3 h-3" />,
    nodes: [
      { type: 'source', category: 'source', label: 'S3', icon: 's3', sourceType: 's3' },
      { type: 'source', category: 'source', label: 'Azure Blob', icon: 'azure', sourceType: 'azure' },
      { type: 'source', category: 'source', label: 'GCS', icon: 'gcs', sourceType: 'gcs' },
    ],
  },
  {
    name: 'Streaming',
    icon: <Radio className="w-3 h-3" />,
    nodes: [
      { type: 'source', category: 'source', label: 'Kafka', icon: 'kafka', sourceType: 'kafka' },
      { type: 'source', category: 'source', label: 'Kinesis', icon: 'kinesis', sourceType: 'kinesis' },
      { type: 'source', category: 'source', label: 'Event Hubs', icon: 'eventHubs', sourceType: 'eventHubs' },
      { type: 'source', category: 'source', label: 'Pub/Sub', icon: 'pubsub', sourceType: 'pubsub' },
      { type: 'source', category: 'source', label: 'Pulsar', icon: 'pulsar', sourceType: 'pulsar' },
    ],
  },
  {
    name: 'NoSQL/Cache',
    icon: <Database className="w-3 h-3" />,
    nodes: [
      { type: 'source', category: 'source', label: 'Redis', icon: 'redis', sourceType: 'redis' },
      { type: 'source', category: 'source', label: 'Neo4j', icon: 'neo4j', sourceType: 'neo4j' },
    ],
  },
  {
    name: 'Table Formats',
    icon: <Triangle className="w-3 h-3" />,
    nodes: [
      { type: 'source', category: 'source', label: 'Delta', icon: 'delta', sourceType: 'delta' },
      { type: 'source', category: 'source', label: 'Iceberg', icon: 'iceberg', sourceType: 'iceberg' },
      { type: 'source', category: 'source', label: 'Hudi', icon: 'hudi', sourceType: 'hudi' },
    ],
  },
  {
    name: 'Custom',
    icon: <Wrench className="w-3 h-3" />,
    nodes: [
      { type: 'source', category: 'source', label: 'Custom Source', icon: 'custom', sourceType: 'custom' },
    ],
  },
];

// Transform categories with shuffle type indicators
// narrow = no shuffle (green), wide = shuffle required (orange)
const transformCategories: NodeCategory[] = [
  {
    name: 'Column Operations',
    icon: <Columns className="w-3 h-3" />,
    nodes: [
      { type: 'transform', category: 'transform', label: 'Select', icon: 'select', transformType: 'select', shuffleType: 'narrow' },
      { type: 'transform', category: 'transform', label: 'Add Column', icon: 'addColumn', transformType: 'addColumn', shuffleType: 'narrow' },
      { type: 'transform', category: 'transform', label: 'Drop Column', icon: 'dropColumn', transformType: 'dropColumn', shuffleType: 'narrow' },
      { type: 'transform', category: 'transform', label: 'Rename', icon: 'rename', transformType: 'rename', shuffleType: 'narrow' },
      { type: 'transform', category: 'transform', label: 'Cast', icon: 'cast', transformType: 'cast', shuffleType: 'narrow' },
      { type: 'transform', category: 'transform', label: 'Flatten', icon: 'flatten', transformType: 'flatten', shuffleType: 'narrow' },
    ],
  },
  {
    name: 'Row Operations',
    icon: <Filter className="w-3 h-3" />,
    nodes: [
      { type: 'transform', category: 'transform', label: 'Filter', icon: 'filter', transformType: 'filter', shuffleType: 'narrow' },
      { type: 'transform', category: 'transform', label: 'Distinct', icon: 'distinct', transformType: 'distinct', shuffleType: 'wide' },
      { type: 'transform', category: 'transform', label: 'Drop Duplicates', icon: 'dropDuplicates', transformType: 'dropDuplicates', shuffleType: 'wide' },
      { type: 'transform', category: 'transform', label: 'Limit', icon: 'limit', transformType: 'limit', shuffleType: 'narrow' },
      { type: 'transform', category: 'transform', label: 'Sample', icon: 'sample', transformType: 'sample', shuffleType: 'narrow' },
      { type: 'transform', category: 'transform', label: 'Drop NA', icon: 'dropna', transformType: 'dropna', shuffleType: 'narrow' },
      { type: 'transform', category: 'transform', label: 'Fill NA', icon: 'fillna', transformType: 'fillna', shuffleType: 'narrow' },
      { type: 'transform', category: 'transform', label: 'Map', icon: 'map', transformType: 'map', shuffleType: 'narrow' },
      { type: 'transform', category: 'transform', label: 'FlatMap', icon: 'flatMap', transformType: 'flatMap', shuffleType: 'narrow' },
    ],
  },
  {
    name: 'Aggregations',
    icon: <Layers className="w-3 h-3" />,
    nodes: [
      { type: 'transform', category: 'transform', label: 'Group By', icon: 'groupby', transformType: 'groupBy', shuffleType: 'wide' },
      { type: 'transform', category: 'transform', label: 'Cube', icon: 'cube', transformType: 'cube', shuffleType: 'wide' },
      { type: 'transform', category: 'transform', label: 'Rollup', icon: 'rollup', transformType: 'rollup', shuffleType: 'wide' },
      { type: 'transform', category: 'transform', label: 'Crosstab', icon: 'crosstab', transformType: 'crosstab', shuffleType: 'wide' },
      { type: 'transform', category: 'transform', label: 'Freq Items', icon: 'freqItems', transformType: 'freqItems', shuffleType: 'wide' },
      { type: 'transform', category: 'transform', label: 'Collect List', icon: 'collectList', transformType: 'collectList', shuffleType: 'wide' },
      { type: 'transform', category: 'transform', label: 'Collect Set', icon: 'collectSet', transformType: 'collectSet', shuffleType: 'wide' },
    ],
  },
  {
    name: 'Joins & Combines',
    icon: <GitMerge className="w-3 h-3" />,
    nodes: [
      { type: 'transform', category: 'transform', label: 'Join', icon: 'join', transformType: 'join', shuffleType: 'wide' },
      { type: 'transform', category: 'transform', label: 'Union', icon: 'union', transformType: 'union', shuffleType: 'narrow' },
      { type: 'transform', category: 'transform', label: 'Union All', icon: 'unionAll', transformType: 'unionAll', shuffleType: 'narrow' },
      { type: 'transform', category: 'transform', label: 'Intersect', icon: 'intersect', transformType: 'intersect', shuffleType: 'wide' },
      { type: 'transform', category: 'transform', label: 'Subtract', icon: 'subtract', transformType: 'subtract', shuffleType: 'wide' },
      { type: 'transform', category: 'transform', label: 'Intersect All', icon: 'intersectAll', transformType: 'intersectAll', shuffleType: 'wide' },
      { type: 'transform', category: 'transform', label: 'Except All', icon: 'exceptAll', transformType: 'exceptAll', shuffleType: 'wide' },
    ],
  },
  {
    name: 'Sorting',
    icon: <ArrowUpDown className="w-3 h-3" />,
    nodes: [
      { type: 'transform', category: 'transform', label: 'Sort', icon: 'sort', transformType: 'sort', shuffleType: 'wide' },
      { type: 'transform', category: 'transform', label: 'Sort Within Partitions', icon: 'sortWithinPartitions', transformType: 'sortWithinPartitions', shuffleType: 'narrow' },
    ],
  },
  {
    name: 'Window Functions',
    icon: <Server className="w-3 h-3" />,
    nodes: [
      { type: 'transform', category: 'transform', label: 'Window', icon: 'window', transformType: 'window', shuffleType: 'wide' },
    ],
  },
  {
    name: 'Reshaping',
    icon: <Split className="w-3 h-3" />,
    nodes: [
      { type: 'transform', category: 'transform', label: 'Explode', icon: 'explode', transformType: 'explode', shuffleType: 'narrow' },
      { type: 'transform', category: 'transform', label: 'Unpivot', icon: 'unpivot', transformType: 'unpivot', shuffleType: 'narrow' },
      { type: 'transform', category: 'transform', label: 'Pivot', icon: 'pivot', transformType: 'pivot', shuffleType: 'wide' },
      { type: 'transform', category: 'transform', label: 'Replace', icon: 'replace', transformType: 'replace', shuffleType: 'narrow' },
    ],
  },
  {
    name: 'Analytics',
    icon: <FileBarChart className="w-3 h-3" />,
    nodes: [
      { type: 'transform', category: 'transform', label: 'Describe', icon: 'describe', transformType: 'describe', shuffleType: 'wide' },
      { type: 'transform', category: 'transform', label: 'Summary', icon: 'summary', transformType: 'summary', shuffleType: 'wide' },
      { type: 'transform', category: 'transform', label: 'Correlation', icon: 'correlation', transformType: 'correlation', shuffleType: 'wide' },
      { type: 'transform', category: 'transform', label: 'Covariance', icon: 'covariance', transformType: 'covariance', shuffleType: 'wide' },
      { type: 'transform', category: 'transform', label: 'Approx Quantile', icon: 'approxQuantile', transformType: 'approxQuantile', shuffleType: 'wide' },
    ],
  },
];

// Optimization categories (top-level section)
const optimizationCategories: NodeCategory[] = [
  {
    name: 'Caching',
    icon: <HardDrive className="w-3 h-3" />,
    nodes: [
      { type: 'transform', category: 'transform', label: 'Cache', icon: 'cache', transformType: 'cache', shuffleType: 'narrow' },
      { type: 'transform', category: 'transform', label: 'Persist', icon: 'persist', transformType: 'persist', shuffleType: 'narrow' },
      { type: 'transform', category: 'transform', label: 'Checkpoint', icon: 'checkpoint', transformType: 'checkpoint', shuffleType: 'narrow' },
      { type: 'transform', category: 'transform', label: 'Local Checkpoint', icon: 'localCheckpoint', transformType: 'localCheckpoint', shuffleType: 'narrow' },
      { type: 'transform', category: 'transform', label: 'Unpersist', icon: 'unpersist', transformType: 'unpersist', shuffleType: 'narrow' },
    ],
  },
  {
    name: 'Partitioning',
    icon: <Grid3x3 className="w-3 h-3" />,
    nodes: [
      { type: 'transform', category: 'transform', label: 'Repartition', icon: 'repartition', transformType: 'repartition', shuffleType: 'wide' },
      { type: 'transform', category: 'transform', label: 'Coalesce', icon: 'coalesce', transformType: 'coalesce', shuffleType: 'narrow' },
      { type: 'transform', category: 'transform', label: 'Broadcast', icon: 'broadcast', transformType: 'broadcast', shuffleType: 'narrow' },
      { type: 'transform', category: 'transform', label: 'Bucketing', icon: 'bucketing', transformType: 'bucketing', shuffleType: 'wide' },
    ],
  },
  {
    name: 'Skew Handling',
    icon: <BarChart3 className="w-3 h-3" />,
    nodes: [
      { type: 'transform', category: 'transform', label: 'Salt', icon: 'salt', transformType: 'salt', shuffleType: 'narrow' },
    ],
  },
  {
    name: 'Configuration',
    icon: <Settings className="w-3 h-3" />,
    nodes: [
      { type: 'transform', category: 'transform', label: 'Spark Config', icon: 'sparkConfig', transformType: 'sparkConfig' },
      { type: 'transform', category: 'transform', label: 'AQE Config', icon: 'aqe', transformType: 'aqe' },
      { type: 'transform', category: 'transform', label: 'Explain Plan', icon: 'explain', transformType: 'explain' },
    ],
  },
];

// Delta Lake operations (top-level section)
const deltaLakeCategories: NodeCategory[] = [
  {
    name: 'Data Operations',
    icon: <Triangle className="w-3 h-3" />,
    nodes: [
      { type: 'transform', category: 'transform', label: 'Delta Merge', icon: 'deltaMerge', transformType: 'deltaMerge' },
      { type: 'transform', category: 'transform', label: 'Delta Update', icon: 'deltaUpdate', transformType: 'deltaUpdate' },
      { type: 'transform', category: 'transform', label: 'Delta Delete', icon: 'deltaDelete', transformType: 'deltaDelete' },
    ],
  },
  {
    name: 'Maintenance',
    icon: <RefreshCw className="w-3 h-3" />,
    nodes: [
      { type: 'transform', category: 'transform', label: 'Delta Optimize', icon: 'deltaOptimize', transformType: 'deltaOptimize' },
      { type: 'transform', category: 'transform', label: 'Delta Vacuum', icon: 'deltaVacuum', transformType: 'deltaVacuum' },
    ],
  },
  {
    name: 'Time Travel',
    icon: <Clock className="w-3 h-3" />,
    nodes: [
      { type: 'transform', category: 'transform', label: 'Delta History', icon: 'deltaHistory', transformType: 'deltaHistory' },
    ],
  },
];

// Streaming operations (top-level section)
const streamingCategories: NodeCategory[] = [
  {
    name: 'Event Time',
    icon: <Clock className="w-3 h-3" />,
    nodes: [
      { type: 'transform', category: 'transform', label: 'Watermark', icon: 'watermark', transformType: 'watermark' },
      { type: 'transform', category: 'transform', label: 'Window', icon: 'streamingWindow', transformType: 'streamingWindow' },
    ],
  },
  {
    name: 'Triggers',
    icon: <Zap className="w-3 h-3" />,
    nodes: [
      { type: 'transform', category: 'transform', label: 'Trigger', icon: 'streamingTrigger', transformType: 'streamingTrigger' },
    ],
  },
  {
    name: 'Output',
    icon: <Upload className="w-3 h-3" />,
    nodes: [
      { type: 'transform', category: 'transform', label: 'Foreach Batch', icon: 'foreachBatch', transformType: 'foreachBatch' },
    ],
  },
];

// UDF operations (top-level section)
const udfCategories: NodeCategory[] = [
  {
    name: 'Python UDFs',
    icon: <Terminal className="w-3 h-3" />,
    nodes: [
      { type: 'transform', category: 'transform', label: 'Python UDF', icon: 'pythonUdf', transformType: 'pythonUdf' },
    ],
  },
  {
    name: 'Pandas UDFs',
    icon: <Zap className="w-3 h-3" />,
    nodes: [
      { type: 'transform', category: 'transform', label: 'Pandas UDF', icon: 'pandasUdf', transformType: 'pandasUdf' },
      { type: 'transform', category: 'transform', label: 'Grouped Map', icon: 'pandasGroupedUdf', transformType: 'pandasGroupedUdf' },
    ],
  },
];

// Data Quality operations (top-level section)
const dataQualityCategories: NodeCategory[] = [
  {
    name: 'External Tools',
    icon: <CheckCircle2 className="w-3 h-3" />,
    nodes: [
      { type: 'transform', category: 'transform', label: 'Great Expectations', icon: 'greatExpectations', transformType: 'greatExpectations' },
      { type: 'transform', category: 'transform', label: 'Soda Core', icon: 'sodaCore', transformType: 'sodaCore' },
    ],
  },
  {
    name: 'Built-in Checks',
    icon: <AlertTriangle className="w-3 h-3" />,
    nodes: [
      { type: 'transform', category: 'transform', label: 'Data Assertions', icon: 'dataAssertions', transformType: 'dataAssertions' },
      { type: 'transform', category: 'transform', label: 'Schema Validation', icon: 'schemaValidation', transformType: 'schemaValidation' },
    ],
  },
];

// Actions (debugging/inspection operations)
const actionCategories: NodeCategory[] = [
  {
    name: 'Display',
    icon: <Eye className="w-3 h-3" />,
    nodes: [
      { type: 'action', category: 'action', label: 'Show', icon: 'show', actionType: 'show' },
      { type: 'action', category: 'action', label: 'Print Schema', icon: 'printSchema', actionType: 'printSchema' },
    ],
  },
  {
    name: 'Inspection',
    icon: <FileSearch className="w-3 h-3" />,
    nodes: [
      { type: 'action', category: 'action', label: 'Count', icon: 'count', actionType: 'count' },
      { type: 'action', category: 'action', label: 'Take', icon: 'take', actionType: 'take' },
      { type: 'action', category: 'action', label: 'First', icon: 'first', actionType: 'first' },
      { type: 'action', category: 'action', label: 'Head', icon: 'head', actionType: 'head' },
    ],
  },
  {
    name: 'Metadata',
    icon: <Info className="w-3 h-3" />,
    nodes: [
      { type: 'action', category: 'action', label: 'Columns', icon: 'columns', actionType: 'columns' },
      { type: 'action', category: 'action', label: 'dtypes', icon: 'dtypes', actionType: 'dtypes' },
      { type: 'action', category: 'action', label: 'Is Empty', icon: 'isEmpty', actionType: 'isEmpty' },
    ],
  },
];

// Preprocessing categories (top-level section)
const preprocessingCategories: NodeCategory[] = [
  {
    name: 'Data Quality',
    icon: <ScanSearch className="w-3 h-3" />,
    nodes: [
      { type: 'transform', category: 'transform', label: 'Data Profiler', icon: 'profiler', transformType: 'profiler' },
      { type: 'transform', category: 'transform', label: 'Validator', icon: 'dataValidator', transformType: 'dataValidator' },
    ],
  },
  {
    name: 'Data Cleaning',
    icon: <Eraser className="w-3 h-3" />,
    nodes: [
      { type: 'transform', category: 'transform', label: 'Missing Values', icon: 'missingValue', transformType: 'missingValue' },
      { type: 'transform', category: 'transform', label: 'Duplicates', icon: 'duplicateHandler', transformType: 'duplicateHandler' },
      { type: 'transform', category: 'transform', label: 'Outliers', icon: 'outlierHandler', transformType: 'outlierHandler' },
    ],
  },
  {
    name: 'Data Formatting',
    icon: <WrapText className="w-3 h-3" />,
    nodes: [
      { type: 'transform', category: 'transform', label: 'Type Fixer', icon: 'typeFixer', transformType: 'typeFixer' },
      { type: 'transform', category: 'transform', label: 'String Cleaner', icon: 'stringCleaner', transformType: 'stringCleaner' },
      { type: 'transform', category: 'transform', label: 'Format Standardizer', icon: 'formatStandardizer', transformType: 'formatStandardizer' },
    ],
  },
];

// Feature Engineering categories (top-level section) - Hidden for now
// const featureEngineeringCategories: NodeCategory[] = [
//   {
//     name: 'Numeric',
//     icon: <Scale className="w-3 h-3" />,
//     nodes: [
//       { type: 'transform', category: 'transform', label: 'Scaler', icon: 'scaler', transformType: 'scaler' },
//     ],
//   },
//   {
//     name: 'Categorical',
//     icon: <Binary className="w-3 h-3" />,
//     nodes: [
//       { type: 'transform', category: 'transform', label: 'Encoder', icon: 'encoder', transformType: 'encoder' },
//     ],
//   },
//   {
//     name: 'Temporal',
//     icon: <Calendar className="w-3 h-3" />,
//     nodes: [
//       { type: 'transform', category: 'transform', label: 'Date Features', icon: 'dateFeatures', transformType: 'dateFeatures' },
//     ],
//   },
//   {
//     name: 'Text',
//     icon: <TextCursor className="w-3 h-3" />,
//     nodes: [
//       { type: 'transform', category: 'transform', label: 'Text Features', icon: 'textFeatures', transformType: 'textFeatures' },
//     ],
//   },
//   {
//     name: 'Sampling',
//     icon: <Scissors className="w-3 h-3" />,
//     nodes: [
//       { type: 'transform', category: 'transform', label: 'Train/Test Split', icon: 'trainTestSplit', transformType: 'trainTestSplit' },
//     ],
//   },
// ];

// Sink categories
const sinkCategories: NodeCategory[] = [
  {
    name: 'File Formats',
    icon: <FileSpreadsheet className="w-3 h-3" />,
    nodes: [
      { type: 'sink', category: 'sink', label: 'Parquet', icon: 'parquet', sinkType: 'parquet' },
      { type: 'sink', category: 'sink', label: 'CSV', icon: 'csv', sinkType: 'csv' },
      { type: 'sink', category: 'sink', label: 'JSON', icon: 'json', sinkType: 'json' },
      { type: 'sink', category: 'sink', label: 'ORC', icon: 'orc', sinkType: 'orc' },
      { type: 'sink', category: 'sink', label: 'Avro', icon: 'avro', sinkType: 'avro' },
      { type: 'sink', category: 'sink', label: 'Text', icon: 'text', sinkType: 'text' },
      { type: 'sink', category: 'sink', label: 'XML', icon: 'xml', sinkType: 'xml' },
    ],
  },
  {
    name: 'Databases',
    icon: <Database className="w-3 h-3" />,
    nodes: [
      { type: 'sink', category: 'sink', label: 'JDBC', icon: 'jdbc', sinkType: 'jdbc' },
      { type: 'sink', category: 'sink', label: 'MongoDB', icon: 'mongodb', sinkType: 'mongodb' },
      { type: 'sink', category: 'sink', label: 'Cassandra', icon: 'cassandra', sinkType: 'cassandra' },
      { type: 'sink', category: 'sink', label: 'Elasticsearch', icon: 'elasticsearch', sinkType: 'elasticsearch' },
    ],
  },
  {
    name: 'Data Warehouses',
    icon: <Server className="w-3 h-3" />,
    nodes: [
      { type: 'sink', category: 'sink', label: 'Snowflake', icon: 'snowflake', sinkType: 'snowflake' },
      { type: 'sink', category: 'sink', label: 'BigQuery', icon: 'bigquery', sinkType: 'bigquery' },
      { type: 'sink', category: 'sink', label: 'Redshift', icon: 'redshift', sinkType: 'redshift' },
    ],
  },
  {
    name: 'Streaming',
    icon: <Radio className="w-3 h-3" />,
    nodes: [
      { type: 'sink', category: 'sink', label: 'Kafka', icon: 'kafka', sinkType: 'kafka' },
    ],
  },
  {
    name: 'Table Formats',
    icon: <Triangle className="w-3 h-3" />,
    nodes: [
      { type: 'sink', category: 'sink', label: 'Delta', icon: 'delta', sinkType: 'delta' },
      { type: 'sink', category: 'sink', label: 'Iceberg', icon: 'iceberg', sinkType: 'iceberg' },
      { type: 'sink', category: 'sink', label: 'Hudi', icon: 'hudi', sinkType: 'hudi' },
    ],
  },
  {
    name: 'NoSQL/Cache',
    icon: <Database className="w-3 h-3" />,
    nodes: [
      { type: 'sink', category: 'sink', label: 'Redis', icon: 'redis', sinkType: 'redis' },
      { type: 'sink', category: 'sink', label: 'Neo4j', icon: 'neo4j', sinkType: 'neo4j' },
    ],
  },
  {
    name: 'Custom',
    icon: <Wrench className="w-3 h-3" />,
    nodes: [
      { type: 'sink', category: 'sink', label: 'Custom Sink', icon: 'custom', sinkType: 'custom' },
      { type: 'sink', category: 'sink', label: 'Console', icon: 'console', sinkType: 'console' },
    ],
  },
];

// ============================================
// Icon Mapping
// ============================================

const getIcon = (iconName: string, className: string = 'w-4 h-4') => {
  const icons: Record<string, React.ReactNode> = {
    csv: <FileSpreadsheet className={className} />,
    parquet: <HardDrive className={className} />,
    json: <FileJson className={className} />,
    jdbc: <Database className={className} />,
    kafka: <Radio className={className} />,
    s3: <Cloud className={className} />,
    delta: <Triangle className={className} />,
    orc: <HardDrive className={className} />,
    avro: <FileCode className={className} />,
    text: <FileText className={className} />,
    excel: <FileSpreadsheet className={className} />,
    xml: <FileCode className={className} />,
    mongodb: <Database className={className} />,
    cassandra: <Database className={className} />,
    elasticsearch: <Database className={className} />,
    azure: <Cloud className={className} />,
    gcs: <Cloud className={className} />,
    iceberg: <Triangle className={className} />,
    hudi: <Triangle className={className} />,
    snowflake: <Server className={className} />,
    bigquery: <Server className={className} />,
    redshift: <Server className={className} />,
    custom: <Wrench className={className} />,
    console: <Terminal className={className} />,
    select: <Columns className={className} />,
    filter: <Filter className={className} />,
    join: <GitMerge className={className} />,
    groupby: <Layers className={className} />,
    sort: <ArrowUpDown className={className} />,
    union: <Combine className={className} />,
    unionAll: <Combine className={className} />,
    window: <Server className={className} />,
    addColumn: <Plus className={className} />,
    dropColumn: <Minus className={className} />,
    rename: <Type className={className} />,
    distinct: <Hash className={className} />,
    limit: <Slice className={className} />,
    sample: <Percent className={className} />,
    dropna: <Eraser className={className} />,
    fillna: <PaintBucket className={className} />,
    intersect: <CircleDot className={className} />,
    subtract: <MinusCircle className={className} />,
    explode: <Split className={className} />,
    unpivot: <RotateCcw className={className} />,
    pivot: <RotateCw className={className} />,
    repartition: <Grid3x3 className={className} />,
    cache: <HardDrive className={className} />,
    replace: <RefreshCw className={className} />,
    intersectAll: <CircleDot className={className} />,
    exceptAll: <MinusCircle className={className} />,
    flatten: <Ungroup className={className} />,
    cube: <Box className={className} />,
    rollup: <BarChart3 className={className} />,
    crosstab: <TableProperties className={className} />,
    freqItems: <ListChecks className={className} />,
    describe: <FileBarChart className={className} />,
    // Preprocessing icons
    profiler: <ScanSearch className={className} />,
    missingValue: <CircleOff className={className} />,
    duplicateHandler: <Copy className={className} />,
    typeFixer: <FileType className={className} />,
    stringCleaner: <WrapText className={className} />,
    outlierHandler: <AlertTriangle className={className} />,
    dataValidator: <CheckCircle2 className={className} />,
    formatStandardizer: <FileDigit className={className} />,
    // Feature Engineering icons
    scaler: <Scale className={className} />,
    encoder: <Binary className={className} />,
    dateFeatures: <Calendar className={className} />,
    textFeatures: <TextCursor className={className} />,
    trainTestSplit: <Scissors className={className} />,
    // Delta Lake icons
    deltaMerge: <GitMerge className={className} />,
    deltaUpdate: <Pencil className={className} />,
    deltaDelete: <Trash2 className={className} />,
    deltaOptimize: <Zap className={className} />,
    deltaVacuum: <Eraser className={className} />,
    deltaHistory: <Clock className={className} />,
    // Streaming icons
    kinesis: <Radio className={className} />,
    eventHubs: <Radio className={className} />,
    pubsub: <Radio className={className} />,
    pulsar: <Radio className={className} />,
    // NoSQL/Cache icons
    redis: <Database className={className} />,
    neo4j: <Database className={className} />,
    watermark: <Clock className={className} />,
    streamingWindow: <Server className={className} />,
    streamingTrigger: <Zap className={className} />,
    foreachBatch: <Layers className={className} />,
    // UDF icons
    pythonUdf: <Terminal className={className} />,
    pandasUdf: <Zap className={className} />,
    pandasGroupedUdf: <Layers className={className} />,
    // Data Quality icons
    greatExpectations: <CheckCircle2 className={className} />,
    sodaCore: <CheckCircle2 className={className} />,
    dataAssertions: <AlertTriangle className={className} />,
    schemaValidation: <ListChecks className={className} />,
    // Performance & Configuration icons
    sparkConfig: <Settings className={className} />,
    bucketing: <Grid3x3 className={className} />,
    // New transform icons
    cast: <FileType className={className} />,
    dropDuplicates: <Copy className={className} />,
    map: <ArrowRightLeft className={className} />,
    flatMap: <Ungroup className={className} />,
    collectList: <ListChecks className={className} />,
    collectSet: <ListChecks className={className} />,
    sortWithinPartitions: <ArrowUpDown className={className} />,
    summary: <FileBarChart className={className} />,
    correlation: <GitCompare className={className} />,
    covariance: <GitCompare className={className} />,
    approxQuantile: <BarChart3 className={className} />,
    persist: <HardDrive className={className} />,
    localCheckpoint: <GitBranch className={className} />,
    coalesce: <Shrink className={className} />,
    // Action icons
    show: <Eye className={className} />,
    printSchema: <FileSearch className={className} />,
    count: <HashIcon className={className} />,
    take: <List className={className} />,
    first: <List className={className} />,
    head: <List className={className} />,
    columns: <Columns className={className} />,
    dtypes: <Info className={className} />,
    isEmpty: <CircleOff className={className} />,
  };
  return icons[iconName] || <Database className={className} />;
};

// ============================================
// Components
// ============================================

interface NodeItemProps {
  item: DraggableNodeItem;
  isReadOnly?: boolean;
}

const NodeItem = ({ item, isReadOnly = false }: NodeItemProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0 });
  const itemRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setShowTooltip(true);
    if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      setTooltipPos({ top: rect.top });
    }
  };

  const onDragStart = (event: React.DragEvent, nodeData: DraggableNodeItem) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  // Get the type for tips lookup
  const getNodeType = () => {
    return item.sourceType || item.transformType || item.sinkType || item.actionType || '';
  };

  // Get tip for this node
  const tip = getShortTip(item.category, getNodeType());

  // Shuffle type indicator for transforms
  const getShuffleIndicator = () => {
    if (!item.shuffleType) return null;

    if (item.shuffleType === 'narrow') {
      return (
        <span
          className="ml-auto px-1 py-0.5 text-[9px] font-medium rounded bg-green-500/20 text-green-400 flex-shrink-0"
          title="Narrow transform - no shuffle required"
        >
          N
        </span>
      );
    } else {
      return (
        <span
          className="ml-auto px-1 py-0.5 text-[9px] font-medium rounded bg-orange-500/20 text-orange-400 flex-shrink-0"
          title="Wide transform - requires shuffle"
        >
          W
        </span>
      );
    }
  };

  return (
    <div
      ref={itemRef}
      className={`node-item relative group ${isReadOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
      draggable={!isReadOnly}
      onDragStart={(e) => !isReadOnly && onDragStart(e, item)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {getIcon(item.icon)}
      <span className="flex-1 truncate">{item.label}</span>
      {getShuffleIndicator()}

      {/* Tooltip - positioned fixed to avoid overflow clipping */}
      {showTooltip && tip && (
        <div
          className="fixed left-[252px] z-[9999] w-64 p-3 bg-gray-900 border border-accent/50 rounded-lg shadow-2xl text-xs text-gray-200 pointer-events-none ring-1 ring-accent/20"
          style={{ top: tooltipPos.top }}
        >
          <div className="flex items-start gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <span>{tip}</span>
          </div>
          {item.shuffleType && (
            <div className="mt-1.5 pt-1.5 border-t border-gray-700 text-gray-400">
              {item.shuffleType === 'narrow' ? (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Narrow transform - no shuffle
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  Wide transform - causes shuffle
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface CollapsibleCategoryProps {
  category: NodeCategory;
  defaultOpen?: boolean;
  searchTerm?: string;
  isReadOnly?: boolean;
}

const CollapsibleCategory = ({ category, defaultOpen = false, searchTerm = '', isReadOnly = false }: CollapsibleCategoryProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Filter nodes based on search term
  const filteredNodes = searchTerm
    ? category.nodes.filter(node =>
        node.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : category.nodes;

  // Don't render category if no nodes match search
  if (filteredNodes.length === 0) return null;

  // Auto-expand if search matches
  const shouldBeOpen = searchTerm ? true : isOpen;

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400 hover:text-gray-200 hover:bg-panel-light rounded transition-colors"
      >
        {shouldBeOpen ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
        {category.icon}
        <span className="flex-1 text-left">{category.name}</span>
        <span className="text-gray-600 text-[10px]">{filteredNodes.length}</span>
      </button>
      {shouldBeOpen && (
        <div className="ml-3 mt-0.5 space-y-0.5">
          {filteredNodes.map((node) => (
            <NodeItem key={`${node.type}-${node.sourceType || node.transformType || node.sinkType}`} item={node} isReadOnly={isReadOnly} />
          ))}
        </div>
      )}
    </div>
  );
};

interface SchemaItemProps {
  schema: Schema;
  onRemove: () => void;
}

const SchemaItem = ({ schema, onRemove }: SchemaItemProps) => {
  const onDragStart = (event: React.DragEvent) => {
    const nodeData = {
      type: 'source',
      category: 'source' as const,
      label: schema.name,
      icon: schema.source,
      sourceType: schema.source,
      schema: schema,
    };
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="node-item group relative"
      draggable
      onDragStart={onDragStart}
    >
      <Table className="w-4 h-4 text-green-400" />
      <div className="flex-1 min-w-0">
        <div className="truncate">{schema.name}</div>
        <div className="text-xs text-gray-500">{schema.columns.length} cols • {schema.source}</div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-opacity"
        title="Remove schema"
      >
        <X className="w-3 h-3 text-red-400" />
      </button>
    </div>
  );
};

interface MainSectionProps {
  title: string;
  icon: React.ReactNode;
  categories: NodeCategory[];
  searchTerm: string;
  defaultOpenFirst?: boolean;
  sectionKey: string;
  isReadOnly?: boolean;
}

const MainSection = ({ title, icon, categories, searchTerm, defaultOpenFirst = true, sectionKey, isReadOnly = false }: MainSectionProps) => {
  // Initialize from localStorage, default to collapsed (false)
  const [isExpanded, setIsExpanded] = useState(() => {
    const stored = getExpandedSections();
    return stored[sectionKey] ?? false;
  });

  // Handle toggle with localStorage persistence
  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    setExpandedSection(sectionKey, newState);
  };

  // Check if any nodes match the search
  const hasMatchingNodes = searchTerm
    ? categories.some(cat =>
        cat.nodes.some(node =>
          node.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : true;

  if (!hasMatchingNodes) return null;

  // Auto-expand when search matches
  const shouldBeExpanded = searchTerm && hasMatchingNodes ? true : isExpanded;

  return (
    <div className="panel-section">
      <button
        onClick={handleToggle}
        className="panel-title flex items-center gap-2 w-full hover:text-gray-200 transition-colors"
      >
        {shouldBeExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        {icon}
        <span className="flex-1 text-left">{title}</span>
      </button>
      {shouldBeExpanded && (
        <div className="mt-1">
          {categories.map((category, idx) => (
            <CollapsibleCategory
              key={category.name}
              category={category}
              defaultOpen={defaultOpenFirst && idx === 0 && !searchTerm}
              searchTerm={searchTerm}
              isReadOnly={isReadOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// LocalStorage Keys and Helpers
// ============================================

const SIDEBAR_EXPANDED_KEY = 'etlab_sidebar_expanded';

// Get expanded sections from localStorage
const getExpandedSections = (): Record<string, boolean> => {
  try {
    const stored = localStorage.getItem(SIDEBAR_EXPANDED_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Save expanded sections to localStorage
const setExpandedSection = (sectionKey: string, isExpanded: boolean) => {
  try {
    const current = getExpandedSections();
    current[sectionKey] = isExpanded;
    localStorage.setItem(SIDEBAR_EXPANDED_KEY, JSON.stringify(current));
  } catch {
    // Ignore localStorage errors
  }
};

// ============================================
// Main Sidebar Component
// ============================================

export const Sidebar = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { schemas, loadFromYaml, loadFromYamlAndSave, removeSchema, loadFromApi, deleteFromApi, loadDefaultSchemas, isLoading } = useSchemaStore();
  const { getActiveWorkspace, isApiMode, canEdit } = useWorkspaceStore();
  const [searchTerm, setSearchTerm] = useState('');
  const isReadOnly = !canEdit();

  // Load schemas from API when workspace changes
  const workspace = getActiveWorkspace();
  useEffect(() => {
    if (isApiMode && workspace?.id) {
      loadFromApi(workspace.id);
    }
  }, [isApiMode, workspace?.id, loadFromApi]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      try {
        if (isApiMode && workspace?.id) {
          // Save to database in API mode
          await loadFromYamlAndSave(workspace.id, content);
        } else {
          // Load locally in non-API mode
          loadFromYaml(content);
        }
      } catch (error) {
        alert('Failed to parse YAML file. Please check the format.');
      }
    };
    reader.readAsText(file);

    // Reset input so the same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-60 bg-panel border-r border-gray-700 flex flex-col h-full overflow-hidden">
      {/* Read-only Banner */}
      {isReadOnly && (
        <div className="px-3 py-2 bg-yellow-500/10 border-b border-yellow-500/30">
          <div className="flex items-center gap-2 text-yellow-400">
            <Eye className="w-4 h-4" />
            <span className="text-xs font-medium">View Only</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-accent" />
          PySpark Pipeline
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          {isReadOnly ? 'View only mode' : 'Drag nodes to canvas'}
        </p>
      </div>

      {/* Search */}
      <div className="px-3 py-3 border-b border-gray-700">
        <div className="relative">
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-9 py-2.5 bg-canvas border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:border-accent focus:outline-none"
          />
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* Schemas Section */}
        {!searchTerm && (
          <div className="panel-section">
            <div className="flex items-center justify-between mb-2">
              <h3 className="panel-title flex items-center gap-2 mb-0">
                <Table className="w-3 h-3" />
                Schemas
              </h3>
              {isLoading && <Loader2 className="w-3 h-3 animate-spin text-accent" />}
              {isApiMode && workspace && (
                <button
                  onClick={() => loadFromApi(workspace.id)}
                  className="p-1 hover:bg-panel-light rounded text-gray-400 hover:text-gray-200"
                  title="Refresh schemas"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".yaml,.yml"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2
                           bg-accent/20 hover:bg-accent/30 text-accent rounded-md
                           text-sm transition-colors border border-dashed border-accent/50"
              >
                <FileUp className="w-4 h-4" />
                Upload YAML
              </button>
              {isApiMode && workspace && (
                <button
                  onClick={() => loadDefaultSchemas(workspace.id)}
                  className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-md
                             text-sm transition-colors border border-dashed border-green-500/50"
                  title="Load sample schemas"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Schema List */}
            {schemas.length > 0 ? (
              <div className="space-y-1">
                {schemas.map((schema) => (
                  <SchemaItem
                    key={schema.id}
                    schema={schema}
                    onRemove={() => {
                      if (isApiMode) {
                        deleteFromApi(schema.id);
                      } else {
                        removeSchema(schema.id);
                      }
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center py-2">
                {isApiMode ? 'No schemas saved' : 'No schemas uploaded'}
              </p>
            )}
          </div>
        )}

        {/* Sources */}
        <MainSection
          title="Sources"
          icon={<Download className="w-3 h-3" />}
          categories={sourceCategories}
          searchTerm={searchTerm}
          defaultOpenFirst={true}
          sectionKey="sources"
          isReadOnly={isReadOnly}
        />

        {/* Preprocessing */}
        <MainSection
          title="Preprocessing"
          icon={<ScanSearch className="w-3 h-3" />}
          categories={preprocessingCategories}
          searchTerm={searchTerm}
          defaultOpenFirst={true}
          sectionKey="preprocessing"
          isReadOnly={isReadOnly}
        />

        {/* Transforms */}
        <MainSection
          title="Transforms"
          icon={<Settings className="w-3 h-3" />}
          categories={transformCategories}
          searchTerm={searchTerm}
          defaultOpenFirst={true}
          sectionKey="transforms"
          isReadOnly={isReadOnly}
        />

        {/* Optimization */}
        <MainSection
          title="Optimization"
          icon={<Zap className="w-3 h-3" />}
          categories={optimizationCategories}
          searchTerm={searchTerm}
          defaultOpenFirst={true}
          sectionKey="optimization"
          isReadOnly={isReadOnly}
        />

        {/* Delta Lake Operations */}
        <MainSection
          title="Delta Lake"
          icon={<Triangle className="w-3 h-3" />}
          categories={deltaLakeCategories}
          searchTerm={searchTerm}
          defaultOpenFirst={true}
          sectionKey="deltaLake"
          isReadOnly={isReadOnly}
        />

        {/* Streaming */}
        <MainSection
          title="Streaming"
          icon={<Radio className="w-3 h-3" />}
          categories={streamingCategories}
          searchTerm={searchTerm}
          defaultOpenFirst={true}
          sectionKey="streaming"
          isReadOnly={isReadOnly}
        />

        {/* UDFs */}
        <MainSection
          title="User Functions"
          icon={<Terminal className="w-3 h-3" />}
          categories={udfCategories}
          searchTerm={searchTerm}
          defaultOpenFirst={true}
          sectionKey="userFunctions"
          isReadOnly={isReadOnly}
        />

        {/* Data Quality */}
        <MainSection
          title="Data Quality"
          icon={<CheckCircle2 className="w-3 h-3" />}
          categories={dataQualityCategories}
          searchTerm={searchTerm}
          defaultOpenFirst={true}
          sectionKey="dataQuality"
          isReadOnly={isReadOnly}
        />

        {/* Actions (debugging/inspection) */}
        <MainSection
          title="Actions"
          icon={<Eye className="w-3 h-3" />}
          categories={actionCategories}
          searchTerm={searchTerm}
          defaultOpenFirst={true}
          sectionKey="actions"
          isReadOnly={isReadOnly}
        />

        {/* Feature Engineering - Hidden for now
        <MainSection
          title="Feature Engineering"
          icon={<Scale className="w-3 h-3" />}
          categories={featureEngineeringCategories}
          searchTerm={searchTerm}
          defaultOpenFirst={true}
          sectionKey="featureEngineering"
          isReadOnly={isReadOnly}
        />
        */}

        {/* Sinks */}
        <MainSection
          title="Sinks"
          icon={<Upload className="w-3 h-3" />}
          categories={sinkCategories}
          searchTerm={searchTerm}
          defaultOpenFirst={true}
          sectionKey="sinks"
          isReadOnly={isReadOnly}
        />
      </div>
    </div>
  );
};
