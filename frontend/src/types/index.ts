// Node Types
export type NodeCategory = 'source' | 'transform' | 'sink' | 'action';

export type SourceType =
  | 'csv' | 'parquet' | 'json' | 'jdbc' | 'kafka' | 's3' | 'delta'
  | 'orc' | 'avro' | 'text' | 'excel' | 'xml'
  | 'mongodb' | 'cassandra' | 'elasticsearch'
  | 'azure' | 'gcs'
  | 'iceberg' | 'hudi'
  | 'snowflake' | 'bigquery' | 'redshift'
  // Streaming sources
  | 'kinesis' | 'eventHubs' | 'pubsub' | 'pulsar'
  // NoSQL/Cache sources
  | 'redis' | 'neo4j'
  // REST/HTTP sources
  | 'http'
  | 'custom';

// Schema Types
export interface SchemaColumn {
  name: string;
  dataType: string;
  nullable?: boolean;
  description?: string;
}

export interface Schema {
  id: string;
  name: string;
  source: SourceType;
  format?: string;
  path?: string;
  columns: SchemaColumn[];
  config?: Record<string, unknown>;
}
export type TransformType =
  | 'select' | 'filter' | 'join' | 'groupBy' | 'sort' | 'union' | 'unionAll'
  | 'window' | 'addColumn' | 'dropColumn' | 'rename' | 'distinct'
  | 'limit' | 'sample' | 'dropna' | 'fillna' | 'intersect' | 'subtract'
  | 'explode' | 'unpivot' | 'repartition' | 'cache'
  | 'exceptAll' | 'intersectAll' | 'replace'
  | 'flatten' | 'cube' | 'rollup' | 'crosstab' | 'freqItems' | 'describe' | 'pivot'
  // Additional common transforms
  | 'cast' | 'aggregate' | 'dropDuplicates'
  // New narrow transforms
  | 'map' | 'flatMap' | 'mapPartitions' | 'sortWithinPartitions' | 'withColumnRenamed'
  // New wide transforms
  | 'reduceByKey' | 'aggregateByKey' | 'collectList' | 'collectSet'
  | 'correlation' | 'covariance' | 'summary' | 'approxQuantile'
  // Preprocessing transforms
  | 'profiler' | 'missingValue' | 'duplicateHandler'
  | 'typeFixer' | 'stringCleaner' | 'formatStandardizer'
  | 'outlierHandler' | 'dataValidator'
  // Feature Engineering transforms
  | 'scaler' | 'encoder' | 'dateFeatures' | 'textFeatures' | 'trainTestSplit'
  // Optimization transforms
  | 'checkpoint' | 'unpersist' | 'explain' | 'broadcast' | 'coalesce' | 'salt' | 'aqe'
  | 'persist' | 'localCheckpoint'
  // Delta Lake operations
  | 'deltaMerge' | 'deltaDelete' | 'deltaUpdate' | 'deltaOptimize' | 'deltaVacuum' | 'deltaHistory'
  // Streaming transforms
  | 'watermark' | 'streamingWindow' | 'streamingTrigger' | 'foreachBatch'
  // UDF transforms
  | 'pythonUdf' | 'pandasUdf' | 'pandasGroupedUdf'
  // Data Quality transforms
  | 'greatExpectations' | 'sodaCore' | 'dataAssertions' | 'schemaValidation'
  // Performance & Configuration transforms
  | 'sparkConfig' | 'bucketing';
export type SinkType =
  | 'parquet' | 'csv' | 'json' | 'jdbc' | 'delta' | 'kafka'
  | 'orc' | 'avro' | 'text' | 'xml'
  | 'mongodb' | 'cassandra' | 'elasticsearch'
  | 'iceberg' | 'hudi'
  | 'snowflake' | 'bigquery' | 'redshift'
  // NoSQL/Cache sinks
  | 'redis' | 'neo4j'
  | 'custom' | 'console';

// Action Types - debugging/inspection operations
export type ActionType =
  | 'show'        // Display rows
  | 'printSchema' // Display schema structure
  | 'count'       // Count total rows
  | 'take'        // Get first n rows
  | 'first'       // Get first row
  | 'head'        // Get first n rows as list
  | 'columns'     // List column names
  | 'dtypes'      // List column name and type pairs
  | 'isEmpty';    // Check if DataFrame is empty

export interface Position {
  x: number;
  y: number;
}

export interface Column {
  name: string;
  dataType: string;
  nullable: boolean;
}

// ============================================
// Source Configuration Types
// ============================================

export interface CsvSourceConfig {
  path: string;
  header?: boolean;
  inferSchema?: boolean;
  delimiter?: string;
  quote?: string;
  escape?: string;
  nullValue?: string;
  dateFormat?: string;
  timestampFormat?: string;
  multiLine?: boolean;
  encoding?: string;
  mode?: 'PERMISSIVE' | 'DROPMALFORMED' | 'FAILFAST';
}

export interface ParquetSourceConfig {
  path: string;
  mergeSchema?: boolean;
  pathGlobFilter?: string;
  recursiveFileLookup?: boolean;
}

export interface JsonSourceConfig {
  path: string;
  multiLine?: boolean;
  primitivesAsString?: boolean;
  dateFormat?: string;
  timestampFormat?: string;
  mode?: 'PERMISSIVE' | 'DROPMALFORMED' | 'FAILFAST';
}

export interface JdbcSourceConfig {
  url: string;
  dbtable: string;
  user?: string;
  password?: string;
  driver?: string;
  partitionColumn?: string;
  lowerBound?: number;
  upperBound?: number;
  numPartitions?: number;
  fetchsize?: number;
}

export interface DeltaSourceConfig {
  path: string;
  versionAsOf?: number;
  timestampAsOf?: string;
}

export interface KafkaSourceConfig {
  bootstrapServers: string;
  subscribe?: string;
  subscribePattern?: string;
  startingOffsets?: 'earliest' | 'latest' | string;
  endingOffsets?: 'latest' | string;
}

export type SourceConfig =
  | CsvSourceConfig
  | ParquetSourceConfig
  | JsonSourceConfig
  | JdbcSourceConfig
  | DeltaSourceConfig
  | KafkaSourceConfig;

// ============================================
// Transform Configuration Types
// ============================================

// --- Filter Configuration ---
export type FilterOperator =
  | '==' | '!=' | '>' | '>=' | '<' | '<='
  | 'isNull' | 'isNotNull'
  | 'in' | 'notIn'
  | 'like' | 'rlike'
  | 'startsWith' | 'endsWith' | 'contains'
  | 'between'
  // Array operators
  | 'array_contains' | 'array_size' | 'array_size_gt' | 'array_size_lt' | 'array_size_eq'
  // Map operators
  | 'map_contains_key' | 'map_size' | 'map_size_gt' | 'map_size_lt' | 'map_size_eq'
  // Element access
  | 'getItem' | 'getField';

export interface FilterCondition {
  id: string;
  column: string;
  operator: FilterOperator;
  value: string | number | boolean | string[] | [number, number]; // array for IN, tuple for BETWEEN
  value2?: string | number; // For BETWEEN, getItem index, etc.
  dataType?: string;
}

// Nested condition group for complex filters
export interface ConditionGroup {
  id: string;
  type: 'group';
  logicalOperator: 'AND' | 'OR';
  items: (FilterCondition | ConditionGroup)[];
}

export interface FilterConfig {
  mode: 'simple' | 'sql' | 'advanced';
  conditions?: FilterCondition[];
  conditionGroups?: ConditionGroup; // Root group for nested conditions
  logicalOperator?: 'AND' | 'OR';
  sqlExpression?: string;
}

// --- Select Configuration ---
export interface SelectColumn {
  column: string;
  alias?: string;
  expression?: string; // For computed columns
}

export interface SelectConfig {
  mode: 'columns' | 'expressions';
  columns?: SelectColumn[];
  selectAll?: boolean;
}

// --- Join Configuration ---
export type JoinType = 'inner' | 'left' | 'right' | 'full' | 'left_semi' | 'left_anti' | 'cross';

export interface JoinColumnPair {
  leftColumn: string;
  rightColumn: string;
}

export interface JoinConfig {
  joinType: JoinType;
  conditionMode: 'sameColumn' | 'differentColumns' | 'expression';
  sameColumns?: string[]; // When both tables have same column names
  columnPairs?: JoinColumnPair[]; // When columns have different names
  expression?: string; // Custom SQL expression
  broadcast?: 'left' | 'right' | 'none';
}

// --- GroupBy Configuration ---
export type AggregateFunction =
  | 'count' | 'countDistinct' | 'approxCountDistinct'
  | 'sum' | 'sumDistinct'
  | 'avg' | 'mean'
  | 'min' | 'max'
  | 'first' | 'last'
  | 'collect_list' | 'collect_set'
  | 'stddev' | 'stddev_samp' | 'stddev_pop'
  | 'variance' | 'var_samp' | 'var_pop'
  | 'percentile_approx';

export interface Aggregation {
  id: string;
  column: string;
  function: AggregateFunction;
  alias: string;
  params?: Record<string, unknown>; // For functions like percentile_approx
}

export interface GroupByConfig {
  groupColumns: string[];
  aggregations: Aggregation[];
  pivot?: {
    column: string;
    values?: string[];
  };
}

// --- Sort Configuration ---
export type NullsPosition = 'first' | 'last';

export interface SortColumn {
  column: string;
  direction: 'asc' | 'desc';
  nulls?: NullsPosition;
}

export interface SortConfig {
  columns: SortColumn[];
}

// --- Limit Configuration ---
export interface LimitConfig {
  limit: number;
}

// --- Sample Configuration ---
export interface SampleConfig {
  fraction: number;
  withReplacement?: boolean;
  seed?: number;
}

// --- Union Configuration ---
export interface UnionConfig {
  byName?: boolean;
  allowMissingColumns?: boolean;
}

// --- AddColumn Configuration ---
export type ExpressionType =
  | 'literal' | 'column' | 'arithmetic'
  | 'string' | 'date' | 'numeric' | 'conditional' | 'cast' | 'sql';

export interface AddColumnConfig {
  columnName: string;
  expressionType: ExpressionType;
  expression: string;
  // Structured expression for UI building
  literalValue?: string | number | boolean;
  sourceColumn?: string;
  function?: string;
  functionParams?: Record<string, unknown>;
  castType?: string;
}

// --- DropColumn Configuration ---
export interface DropColumnConfig {
  columns: string[];
}

// --- Rename Configuration ---
export interface RenameMapping {
  oldName: string;
  newName: string;
}

export interface RenameConfig {
  mappings: RenameMapping[];
}

// --- DropNA Configuration ---
export interface DropNaConfig {
  how: 'any' | 'all';
  thresh?: number;
  subset?: string[];
}

// --- FillNA Configuration ---
export interface FillNaConfig {
  mode: 'value' | 'columnValues';
  value?: string | number;
  columnValues?: Record<string, string | number>;
  subset?: string[];
}

// --- Window Configuration ---
export type WindowFunction =
  | 'row_number' | 'rank' | 'dense_rank' | 'ntile' | 'percent_rank' | 'cume_dist'
  | 'lag' | 'lead' | 'first' | 'last' | 'nth_value'
  | 'sum' | 'avg' | 'count' | 'min' | 'max';

export type FrameType = 'rows' | 'range';
export type FrameBound = 'unboundedPreceding' | 'unboundedFollowing' | 'currentRow' | number;

export interface WindowConfig {
  partitionBy: string[];
  orderBy: SortColumn[];
  function: WindowFunction;
  functionColumn?: string;
  functionParams?: Record<string, unknown>; // For lag offset, ntile buckets, etc.
  outputColumn: string;
  frame?: {
    type: FrameType;
    start: FrameBound;
    end: FrameBound;
  };
}

// ============================================
// Preprocessing Configuration Types
// ============================================

// --- Data Profiler Configuration ---
export interface ProfilerConfig {
  columns?: string[];  // Columns to profile, empty = all
  includeStats: boolean;
  includeDistribution: boolean;
  includeCorrelation: boolean;
  includeMissing: boolean;
  includeUnique: boolean;
  sampleSize?: number;  // Sample for large datasets
}

// --- Missing Value Handler Configuration ---
export type ImputationMethod =
  | 'drop' | 'mean' | 'median' | 'mode'
  | 'constant' | 'forward' | 'backward' | 'interpolate';

export interface MissingValueColumnConfig {
  column: string;
  method: ImputationMethod;
  constantValue?: string | number;
}

export interface MissingValueConfig {
  mode: 'global' | 'perColumn';
  globalMethod?: ImputationMethod;
  globalConstant?: string | number;
  columnConfigs?: MissingValueColumnConfig[];
  subset?: string[];  // Only apply to these columns
}

// --- Duplicate Handler Configuration ---
export type DuplicateAction = 'drop' | 'flag' | 'keep_first' | 'keep_last';

export interface DuplicateConfig {
  mode: 'exact' | 'fuzzy';
  columns?: string[];  // Columns to check, empty = all
  action: DuplicateAction;
  flagColumn?: string;  // Column name when action = 'flag'
  // Fuzzy matching options
  fuzzyThreshold?: number;  // 0-1 similarity threshold
  fuzzyAlgorithm?: 'levenshtein' | 'soundex' | 'jaccard';
}

// --- Type Fixer Configuration ---
export interface TypeFixerColumnConfig {
  column: string;
  targetType: string;
  dateFormat?: string;
  nullOnError?: boolean;
}

export interface TypeFixerConfig {
  autoDetect?: boolean;
  columnConfigs: TypeFixerColumnConfig[];
}

// --- String Cleaner Configuration ---
export type StringOperation =
  | 'trim' | 'lower' | 'upper' | 'title'
  | 'removeWhitespace' | 'removeNonAlpha' | 'removeNonNumeric'
  | 'removeSpecialChars' | 'regex';

export interface StringCleanerConfig {
  columns: string[];
  operations: StringOperation[];
  regexPattern?: string;
  regexReplacement?: string;
}

// --- Outlier Handler Configuration ---
export type OutlierMethod = 'iqr' | 'zscore' | 'percentile' | 'mad';
export type OutlierAction = 'remove' | 'cap' | 'null' | 'flag';

export interface OutlierColumnConfig {
  column: string;
  method: OutlierMethod;
  threshold?: number;  // 1.5 for IQR, 3 for zscore
  action: OutlierAction;
  capMin?: number;
  capMax?: number;
}

export interface OutlierConfig {
  mode: 'global' | 'perColumn';
  globalMethod?: OutlierMethod;
  globalThreshold?: number;
  globalAction?: OutlierAction;
  columnConfigs?: OutlierColumnConfig[];
  flagColumn?: string;
}

// --- Data Validator Configuration ---
export type ValidationRuleType =
  | 'notNull' | 'unique' | 'range' | 'pattern'
  | 'inList' | 'custom' | 'referential';

export interface ValidationRule {
  id: string;
  column: string;
  ruleType: ValidationRuleType;
  params?: {
    min?: number;
    max?: number;
    pattern?: string;
    values?: string[];
    expression?: string;
  };
  errorMessage?: string;
}

export interface DataValidatorConfig {
  rules: ValidationRule[];
  failAction: 'reject' | 'flag' | 'log';
  flagColumn?: string;
  stopOnFirstError?: boolean;
}

// --- Format Standardizer Configuration ---
export type FormatType = 'phone' | 'email' | 'date' | 'address' | 'currency' | 'ssn';

export interface FormatStandardizerConfig {
  columns: Array<{
    column: string;
    formatType: FormatType;
    targetFormat?: string;  // Output format pattern
    countryCode?: string;   // For phone numbers
  }>;
}

// --- Scaler Configuration ---
export type ScalerMethod = 'minmax' | 'standard' | 'robust' | 'maxabs';

export interface ScalerConfig {
  columns: string[];
  method: ScalerMethod;
  featureRange?: [number, number];  // For minmax
  withMean?: boolean;  // For standard
  withStd?: boolean;   // For standard
}

// --- Encoder Configuration ---
export type EncoderMethod =
  | 'onehot' | 'label' | 'ordinal' | 'target'
  | 'frequency' | 'binary' | 'hashing';

export interface EncoderConfig {
  columns: string[];
  method: EncoderMethod;
  handleUnknown?: 'error' | 'ignore' | 'infrequent';
  dropFirst?: boolean;  // For onehot to avoid multicollinearity
  targetColumn?: string;  // For target encoding
}

// --- Date Features Configuration ---
export interface DateFeaturesConfig {
  column: string;
  features: Array<'year' | 'month' | 'day' | 'dayOfWeek' | 'quarter' | 'weekOfYear' | 'hour' | 'minute' | 'isWeekend' | 'isMonthStart' | 'isMonthEnd'>;
  cyclical?: boolean;  // Use sin/cos encoding for cyclical features
  dropOriginal?: boolean;
}

// --- Text Features Configuration ---
export interface TextFeaturesConfig {
  column: string;
  features: Array<'length' | 'wordCount' | 'avgWordLength' | 'upperRatio' | 'digitRatio' | 'specialCharRatio'>;
  outputPrefix?: string;
}

// --- Train Test Split Configuration ---
export type SplitMethod = 'random' | 'stratified' | 'timeBased' | 'group';

export interface TrainTestSplitConfig {
  method: SplitMethod;
  trainRatio: number;
  validationRatio?: number;
  testRatio: number;
  seed?: number;
  stratifyColumn?: string;  // For stratified
  timeColumn?: string;      // For time-based
  groupColumn?: string;     // For group split
  trainEndDate?: string;    // For time-based
  validationEndDate?: string;
}

// ============================================
// Optimization Configuration Types
// ============================================

// --- Checkpoint Configuration ---
export type CheckpointType = 'reliable' | 'local';

export interface CheckpointConfig {
  checkpointType: CheckpointType;
  eager: boolean;  // Materialize immediately
}

// --- Unpersist Configuration ---
export interface UnpersistConfig {
  blocking: boolean;  // Wait for completion
}

// --- Explain Configuration ---
export type ExplainMode = 'simple' | 'extended' | 'codegen' | 'cost' | 'formatted';

export interface ExplainConfig {
  mode: ExplainMode;
}

// --- Broadcast Hint Configuration ---
export interface BroadcastHintConfig {
  // Standalone broadcast hint - marks DataFrame for broadcasting
  enabled: boolean;
}

// --- Coalesce Configuration ---
export interface CoalesceConfig {
  numPartitions: number;
}

// --- Salt Configuration (Skew Handling) ---
export interface SaltConfig {
  column: string;
  saltBuckets: number;
  saltColumnName: string;
  includeOriginal: boolean;
}

// --- AQE Configuration (Adaptive Query Execution) ---
export interface AQEConfig {
  enabled: boolean;
  coalescePartitions: boolean;
  skewJoin: boolean;
  skewedPartitionFactor: number;
  skewedPartitionThreshold: string;
  broadcastThreshold: number;
  localShuffleReader: boolean;
}

// Combined Transform Config Type
export type TransformConfig =
  | FilterConfig
  | SelectConfig
  | JoinConfig
  | GroupByConfig
  | SortConfig
  | LimitConfig
  | SampleConfig
  | UnionConfig
  | AddColumnConfig
  | DropColumnConfig
  | RenameConfig
  | DropNaConfig
  | FillNaConfig
  | WindowConfig
  // Preprocessing configs
  | ProfilerConfig
  | MissingValueConfig
  | DuplicateConfig
  | TypeFixerConfig
  | StringCleanerConfig
  | OutlierConfig
  | DataValidatorConfig
  | FormatStandardizerConfig
  // Feature Engineering configs
  | ScalerConfig
  | EncoderConfig
  | DateFeaturesConfig
  | TextFeaturesConfig
  | TrainTestSplitConfig
  // Optimization configs
  | CheckpointConfig
  | UnpersistConfig
  | ExplainConfig
  | BroadcastHintConfig
  | CoalesceConfig
  | SaltConfig
  | AQEConfig;

// ============================================
// Sink Configuration Types
// ============================================

export type WriteMode = 'overwrite' | 'append' | 'ignore' | 'error';
export type CompressionCodec = 'none' | 'snappy' | 'gzip' | 'lz4' | 'zstd' | 'brotli';

export interface BaseSinkConfig {
  path: string;
  mode: WriteMode;
  partitionBy?: string[];
}

export interface CsvSinkConfig extends BaseSinkConfig {
  header?: boolean;
  delimiter?: string;
  quote?: string;
  escape?: string;
  nullValue?: string;
  compression?: 'none' | 'gzip' | 'bzip2';
  dateFormat?: string;
  timestampFormat?: string;
}

export interface ParquetSinkConfig extends BaseSinkConfig {
  compression?: CompressionCodec;
}

export interface JsonSinkConfig extends BaseSinkConfig {
  compression?: 'none' | 'gzip' | 'bzip2';
  dateFormat?: string;
  timestampFormat?: string;
}

export interface JdbcSinkConfig {
  url: string;
  dbtable: string;
  mode: WriteMode;
  user?: string;
  password?: string;
  driver?: string;
  batchsize?: number;
  truncate?: boolean;
  createTableOptions?: string;
}

export interface DeltaSinkConfig extends BaseSinkConfig {
  mergeSchema?: boolean;
  overwriteSchema?: boolean;
  replaceWhere?: string;
}

export interface KafkaSinkConfig {
  bootstrapServers: string;
  topic: string;
}

export type SinkConfig =
  | CsvSinkConfig
  | ParquetSinkConfig
  | JsonSinkConfig
  | JdbcSinkConfig
  | DeltaSinkConfig
  | KafkaSinkConfig;

// Base node data interface - includes index signature for React Flow compatibility
export interface BaseNodeData {
  label: string;
  category: NodeCategory;
  configured: boolean;
  [key: string]: unknown;
}

// Source node data
export interface SourceNodeData extends BaseNodeData {
  category: 'source';
  sourceType: SourceType;
  config?: Record<string, unknown>;
  schema?: Column[];
}

// Transform node data
export interface TransformNodeData extends BaseNodeData {
  category: 'transform';
  transformType: TransformType;
  config?: Record<string, unknown>;
}

// Sink node data
export interface SinkNodeData extends BaseNodeData {
  category: 'sink';
  sinkType: SinkType;
  config?: Record<string, unknown>;
}

// Action node data
export interface ActionNodeData extends BaseNodeData {
  category: 'action';
  actionType: ActionType;
  config?: ActionConfig;
}

// Action Configuration Types
export interface ShowConfig {
  numRows: number;
  truncate: boolean;
  vertical: boolean;
}

export interface TakeConfig {
  numRows: number;
}

export interface HeadConfig {
  numRows: number;
}

export type ActionConfig =
  | ShowConfig
  | TakeConfig
  | HeadConfig
  | Record<string, unknown>;

export type ETLNodeData = SourceNodeData | TransformNodeData | SinkNodeData | ActionNodeData;

// Shuffle type for transform classification
export type ShuffleType = 'narrow' | 'wide';

// Sidebar draggable item
export interface DraggableNodeItem {
  type: string;
  category: NodeCategory;
  label: string;
  icon: string;
  sourceType?: SourceType;
  transformType?: TransformType;
  sinkType?: SinkType;
  actionType?: ActionType;
  shuffleType?: ShuffleType; // For transforms: narrow (no shuffle) or wide (shuffle)
}

// ============================================
// Workspace & Page Types
// ============================================

// Workflow page - visual canvas with nodes and edges
export interface WorkflowPage {
  id: string;
  name: string;
  type: 'workflow';
  nodes: import('@xyflow/react').Node<ETLNodeData>[];
  edges: import('@xyflow/react').Edge[];
  createdAt: string;
  updatedAt: string;
}

// Code page - editable code editor (no canvas)
export interface CodePage {
  id: string;
  name: string;
  type: 'code';
  code: string;
  language: 'python' | 'scala';
  sourceWorkflowId?: string;  // Reference to original workflow if duplicated
  sourceWorkflowName?: string;
  sourceType?: 'workflow' | 'dag';  // Type of source page (workflow=PySpark, dag=Airflow)
  createdAt: string;
  updatedAt: string;
}

// ============================================
// DAG (Airflow) Types
// ============================================

// DAG Node Types
export type DagNodeType =
  | 'etl_task'        // Reference to ETL workflow page
  | 'spark_submit'    // Direct SparkSubmitOperator
  | 'python'          // PythonOperator
  | 'bash'            // BashOperator
  | 'file_sensor'     // FileSensor
  | 's3_sensor'       // S3KeySensor
  | 'sql_sensor'      // SqlSensor
  | 'http_sensor'     // HttpSensor
  | 'external_sensor' // ExternalTaskSensor
  | 'branch'          // BranchPythonOperator
  | 'trigger_dag'     // TriggerDagRunOperator
  | 'dummy'           // EmptyOperator
  | 'email'           // EmailOperator
  | 'slack'           // SlackWebhookOperator
  | 'sql_execute'     // SQLExecuteQueryOperator
  | 'task_group'      // TaskGroup (container)
  // Phase 2: Cloud Storage & Data
  | 'gcs_sensor'      // Google Cloud Storage sensor
  | 'azure_blob_sensor' // Azure Blob Storage sensor
  | 'snowflake'       // Snowflake operator
  | 'delta_sensor'    // Delta Lake sensor
  // Phase 3: Cloud Compute
  | 'kubernetes_pod'  // KubernetesPodOperator
  | 'emr'             // AWS EMR operator
  | 'dataproc'        // GCP Dataproc operator
  | 'databricks'      // Databricks operator
  // Phase 4: Data Warehouse
  | 'bigquery'        // Google BigQuery operator
  | 'redshift'        // AWS Redshift operator
  | 'synapse'         // Azure Synapse operator
  // AWS Services
  | 'athena'          // AWS Athena
  | 'glue_job'        // AWS Glue Job
  | 'glue_crawler'    // AWS Glue Crawler
  | 'glue_databrew'   // AWS Glue DataBrew
  | 'lambda'          // AWS Lambda
  | 'step_function'   // AWS Step Functions
  | 'ecs'             // AWS ECS
  | 'eks'             // AWS EKS
  | 'batch'           // AWS Batch
  | 'sagemaker'       // AWS SageMaker
  | 'sns'             // AWS SNS
  | 'sqs'             // AWS SQS
  | 'eventbridge'     // AWS EventBridge
  | 'dynamodb'        // AWS DynamoDB
  | 'rds'             // AWS RDS
  | 'cloudformation'  // AWS CloudFormation
  | 'bedrock'         // AWS Bedrock
  | 's3'              // AWS S3
  | 'kinesis'         // AWS Kinesis
  | 'appflow'         // AWS AppFlow
  | 'comprehend'      // AWS Comprehend
  | 'datasync'        // AWS DataSync
  | 'dms'             // AWS DMS
  | 'ec2'             // AWS EC2
  | 'ssm'             // AWS Systems Manager
  | 'secrets_manager' // AWS Secrets Manager
  | 'cloudwatch'      // AWS CloudWatch
  // GCP Services - Compute & Containers
  | 'gcs'             // GCS operations
  | 'cloud_run'       // GCP Cloud Run
  | 'cloud_function'  // GCP Cloud Functions
  | 'gke'             // GCP GKE
  | 'compute_engine'  // GCP Compute Engine
  // GCP Services - Data & Analytics
  | 'dataflow'        // GCP Dataflow
  | 'cloud_sql'       // GCP Cloud SQL
  | 'pubsub'          // GCP Pub/Sub
  | 'datafusion'      // GCP DataFusion
  | 'dataplex'        // GCP Dataplex
  | 'dataform'        // GCP Dataform
  | 'bigquery_data_transfer' // GCP BigQuery Data Transfer
  // GCP Services - AI/ML
  | 'vertex_ai'       // GCP Vertex AI
  | 'vision_ai'       // GCP Vision AI
  | 'natural_language' // GCP Natural Language
  | 'translate'       // GCP Translate
  | 'speech'          // GCP Speech-to-Text / Text-to-Speech
  // GCP Services - Database & Storage
  | 'spanner'         // GCP Cloud Spanner
  | 'bigtable'        // GCP Cloud Bigtable
  | 'firestore'       // GCP Firestore
  | 'memorystore'     // GCP Memorystore (Redis)
  | 'alloydb'         // GCP AlloyDB
  // GCP Services - DevOps & Infrastructure
  | 'cloud_build'     // GCP Cloud Build
  | 'cloud_tasks'     // GCP Cloud Tasks
  | 'workflows'       // GCP Workflows
  // GCP Services - BI & Monitoring
  | 'looker'          // GCP Looker
  | 'cloud_dlp'       // GCP Data Loss Prevention
  // Azure Services - Storage & Data
  | 'adf'             // Azure Data Factory
  | 'adls'            // Azure Data Lake Storage
  | 'data_explorer'   // Azure Data Explorer
  // Azure Services - Compute
  | 'aci'             // Azure Container Instances
  | 'azure_batch'     // Azure Batch
  // Azure Services - Database & Messaging
  | 'cosmos_db'       // Azure Cosmos DB
  | 'service_bus'     // Azure Service Bus
  // Azure Services - Analytics & BI
  | 'power_bi'        // Power BI
  // Data Quality & Transformation
  | 'dbt_cloud'       // dbt Cloud
  | 'dbt_core'        // dbt Core (local)
  | 'great_expectations' // Great Expectations data quality
  | 'soda_core'       // Soda Core data observability
  // ELT Integration Platforms
  | 'airbyte'         // Airbyte ELT
  | 'fivetran'        // Fivetran ELT
  // File Transfer & Messaging
  | 'sftp'            // SFTP file transfer
  | 'ssh'             // SSH command execution
  | 'kafka_produce'   // Kafka producer
  | 'kafka_consume'   // Kafka consumer
  | 'trino'           // Trino/Presto SQL
  // Additional Notifications
  | 'ms_teams'        // Microsoft Teams
  | 'pagerduty'       // PagerDuty alerts
  | 'opsgenie';       // Opsgenie alerts

// DAG Node Category for sidebar grouping - simplified cloud provider grouping
export type DagNodeCategory =
  | 'etl'       // ETL workflow tasks
  | 'action'    // Operators (Spark, Python, Bash)
  | 'sensor'    // Generic sensors (File, SQL, HTTP, External)
  | 'control'   // Control flow (Branch, Trigger, Dummy)
  | 'notify'    // Notifications (Email, Slack, Teams, PagerDuty)
  | 'quality'   // Data quality & testing (dbt, Great Expectations, Soda)
  | 'integration' // ELT platforms (Airbyte, Fivetran)
  | 'aws'       // All AWS services
  | 'gcp'       // GCP services (BigQuery, Dataproc, GCS)
  | 'azure'     // Azure services (Synapse, Azure Blob)
  | 'other';    // Multi-cloud (K8s, Databricks, Snowflake, Delta, SFTP, Kafka, Trino)

// Schedule configuration
export interface DagScheduleConfig {
  type: 'cron' | 'preset' | 'manual';
  cron?: string;
  preset?: '@hourly' | '@daily' | '@weekly' | '@monthly' | '@yearly' | '@once';
}

// Default args for DAG tasks
export interface DagDefaultArgs {
  owner: string;
  retries: number;
  retryDelayMinutes: number;
  executionTimeoutMinutes: number;
  email?: string;
  emailOnFailure: boolean;
  emailOnRetry: boolean;
}

// DAG-level configuration
export interface DagConfig {
  dagId: string;
  description: string;
  schedule: DagScheduleConfig;
  defaultArgs: DagDefaultArgs;
  startDate: string;
  catchup: boolean;
  maxActiveRuns: number;
  tags: string[];
}

// Base task configuration
export interface BaseDagTaskConfig {
  taskId: string;
  // Advanced task settings
  pool?: string;
  poolSlots?: number;
  priorityWeight?: number;
  queue?: string;
  dependsOnPast?: boolean;
  waitForDownstream?: boolean;
  // Trigger rule for task execution
  triggerRule?: 'all_success' | 'all_failed' | 'all_done' | 'one_success' | 'one_failed' | 'none_failed' | 'none_skipped' | 'dummy';
  // Task-level retries (overrides DAG default)
  retries?: number;
  retryDelaySeconds?: number;
  retryExponentialBackoff?: boolean;
  maxRetryDelay?: number;
}

// ETL Task - references a workflow page
export interface EtlTaskConfig extends BaseDagTaskConfig {
  pageId: string;
  pageName?: string;
  sparkConfig?: {
    driverMemory?: string;
    executorMemory?: string;
    executorCores?: number;
    numExecutors?: number;
    conf?: Record<string, string>;
  };
}

// SparkSubmit Task
export interface SparkSubmitTaskConfig extends BaseDagTaskConfig {
  application: string;
  applicationArgs?: string[];
  sparkConfig?: {
    driverMemory?: string;
    executorMemory?: string;
    executorCores?: number;
    numExecutors?: number;
    conf?: Record<string, string>;
  };
}

// Python Task
export interface PythonTaskConfig extends BaseDagTaskConfig {
  pythonCode: string;
}

// Bash Task
export interface BashTaskConfig extends BaseDagTaskConfig {
  bashCommand: string;
  env?: Record<string, string>;
}

// File Sensor Task
export interface FileSensorTaskConfig extends BaseDagTaskConfig {
  filepath: string;
  pokeIntervalSeconds: number;
  timeoutSeconds: number;
  mode: 'poke' | 'reschedule';
  softFail: boolean;
}

// S3 Sensor Task
export interface S3SensorTaskConfig extends BaseDagTaskConfig {
  bucketName: string;
  bucketKey: string;
  wildcardMatch: boolean;
  pokeIntervalSeconds: number;
  timeoutSeconds: number;
}

// SQL Sensor Task
export interface SqlSensorTaskConfig extends BaseDagTaskConfig {
  connId: string;
  sql: string;
  pokeIntervalSeconds: number;
  timeoutSeconds: number;
}

// HTTP Sensor Task
export interface HttpSensorTaskConfig extends BaseDagTaskConfig {
  endpoint: string;
  method: 'GET' | 'POST';
  pokeIntervalSeconds: number;
  timeoutSeconds: number;
}

// External Task Sensor
export interface ExternalSensorTaskConfig extends BaseDagTaskConfig {
  externalDagId: string;
  externalTaskId?: string;
  executionDeltaMinutes?: number;
  pokeIntervalSeconds: number;
  timeoutSeconds: number;
}

// Branch Task
export interface BranchTaskConfig extends BaseDagTaskConfig {
  conditions: Array<{
    id: string;
    expression: string;
    targetTaskId: string;
  }>;
  defaultTaskId: string;
}

// Trigger DAG Task
export interface TriggerDagTaskConfig extends BaseDagTaskConfig {
  triggerDagId: string;
  conf?: Record<string, unknown>;
  waitForCompletion: boolean;
}

// Dummy Task
export interface DummyTaskConfig extends BaseDagTaskConfig {
  // No additional config needed
}

// Email Task
export interface EmailTaskConfig extends BaseDagTaskConfig {
  to: string;
  subject: string;
  htmlContent: string;
}

// Slack Task
export interface SlackTaskConfig extends BaseDagTaskConfig {
  channel: string;
  message: string;
}

// SQL Execute Task
export interface SqlExecuteTaskConfig extends BaseDagTaskConfig {
  connId: string;
  sql: string;
}

// Union type for all DAG task configs
export type DagTaskConfig =
  | EtlTaskConfig
  | SparkSubmitTaskConfig
  | PythonTaskConfig
  | BashTaskConfig
  | FileSensorTaskConfig
  | S3SensorTaskConfig
  | SqlSensorTaskConfig
  | HttpSensorTaskConfig
  | ExternalSensorTaskConfig
  | BranchTaskConfig
  | TriggerDagTaskConfig
  | DummyTaskConfig
  | EmailTaskConfig
  | SlackTaskConfig
  | SqlExecuteTaskConfig;

// DAG Task (node in DAG canvas)
export interface DagTask {
  id: string;
  type: DagNodeType;
  label: string;
  config: DagTaskConfig;
  position: Position;
  // Task-level overrides
  retries?: number;
  retryDelayMinutes?: number;
  executionTimeoutMinutes?: number;
  triggerRule?: 'all_success' | 'all_failed' | 'all_done' | 'one_success' | 'one_failed' | 'none_failed' | 'none_skipped' | 'always';
}

// DAG Task Node Data (for React Flow)
export interface DagTaskNodeData {
  label: string;
  type: DagNodeType;
  category: DagNodeCategory;
  config: DagTaskConfig;
  configured: boolean;
  [key: string]: unknown;
}

// DAG Edge (dependency between tasks)
export interface DagEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

// DAG Page - Airflow DAG designer
export interface DagPage {
  id: string;
  name: string;
  type: 'dag';
  dagConfig: DagConfig;
  tasks: import('@xyflow/react').Node<DagTaskNodeData>[];
  edges: import('@xyflow/react').Edge[];
  createdAt: string;
  updatedAt: string;
}

// Draggable DAG node item for sidebar
export interface DraggableDagNodeItem {
  type: DagNodeType;
  category: DagNodeCategory;
  label: string;
  icon: string;
  description: string;
}

// Union type for all page types
export type Page = WorkflowPage | CodePage | DagPage;

// Type guard helpers
export const isWorkflowPage = (page: Page): page is WorkflowPage =>
  page.type === 'workflow' || !('type' in page);  // Legacy pages without type are workflows

export const isCodePage = (page: Page): page is CodePage =>
  page.type === 'code';

export const isDagPage = (page: Page): page is DagPage =>
  page.type === 'dag';

export interface WorkspaceOwnerInfo {
  id: string;
  name: string;
  email: string;
}

export interface Workspace {
  id: string;
  name: string;
  pages: Page[];
  activePageId: string;
  createdAt: string;
  updatedAt: string;
  myRole?: 'owner' | 'editor' | 'viewer';
  owner?: WorkspaceOwnerInfo;  // Present when shared with you
}

export interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
}
