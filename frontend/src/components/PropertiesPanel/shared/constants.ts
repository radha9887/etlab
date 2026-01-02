import type { SelectOption } from './SelectField';

/**
 * Data Types - Used in schema editor, UDFs, type casting
 */
export const DATA_TYPES = {
  primitive: ['string', 'integer', 'long', 'double', 'float', 'boolean', 'binary'],
  numeric: ['decimal', 'short', 'byte'],
  datetime: ['date', 'timestamp', 'timestamp_ntz'],
  complex: ['array', 'map', 'struct']
} as const;

export const DATA_TYPE_OPTIONS: SelectOption[] = [
  // Primitive types
  { value: 'string', label: 'String', group: 'Primitive' },
  { value: 'integer', label: 'Integer', group: 'Primitive' },
  { value: 'long', label: 'Long', group: 'Primitive' },
  { value: 'double', label: 'Double', group: 'Primitive' },
  { value: 'float', label: 'Float', group: 'Primitive' },
  { value: 'boolean', label: 'Boolean', group: 'Primitive' },
  { value: 'binary', label: 'Binary', group: 'Primitive' },
  // Numeric
  { value: 'decimal', label: 'Decimal', group: 'Numeric', description: 'Use decimal(precision, scale)' },
  { value: 'short', label: 'Short', group: 'Numeric' },
  { value: 'byte', label: 'Byte', group: 'Numeric' },
  // Date/Time
  { value: 'date', label: 'Date', group: 'Date/Time' },
  { value: 'timestamp', label: 'Timestamp', group: 'Date/Time' },
  { value: 'timestamp_ntz', label: 'Timestamp (no timezone)', group: 'Date/Time' },
  // Complex
  { value: 'array', label: 'Array', group: 'Complex', description: 'Use array<element_type>' },
  { value: 'map', label: 'Map', group: 'Complex', description: 'Use map<key_type, value_type>' },
  { value: 'struct', label: 'Struct', group: 'Complex', description: 'Use struct<field:type, ...>' },
];

/**
 * Filter Operators
 */
export const FILTER_OPERATORS = {
  comparison: [
    { value: '==', label: 'Equals (==)' },
    { value: '!=', label: 'Not Equals (!=)' },
    { value: '>', label: 'Greater Than (>)' },
    { value: '>=', label: 'Greater or Equal (>=)' },
    { value: '<', label: 'Less Than (<)' },
    { value: '<=', label: 'Less or Equal (<=)' },
    { value: 'between', label: 'Between' },
  ],
  null: [
    { value: 'isNull', label: 'Is Null' },
    { value: 'isNotNull', label: 'Is Not Null' },
  ],
  string: [
    { value: 'like', label: 'Like (pattern)' },
    { value: 'rlike', label: 'Regex Like' },
    { value: 'startsWith', label: 'Starts With' },
    { value: 'endsWith', label: 'Ends With' },
    { value: 'contains', label: 'Contains' },
  ],
  list: [
    { value: 'in', label: 'In List' },
    { value: 'notIn', label: 'Not In List' },
  ],
  array: [
    { value: 'array_contains', label: 'Array Contains' },
    { value: 'array_size_eq', label: 'Array Size Equals' },
    { value: 'array_size_gt', label: 'Array Size Greater Than' },
    { value: 'array_size_lt', label: 'Array Size Less Than' },
  ],
  map: [
    { value: 'map_contains_key', label: 'Map Contains Key' },
    { value: 'map_size_eq', label: 'Map Size Equals' },
  ],
} as const;

export const FILTER_OPERATOR_OPTIONS: SelectOption[] = [
  // Comparison
  { value: '==', label: 'Equals (==)', group: 'Comparison' },
  { value: '!=', label: 'Not Equals (!=)', group: 'Comparison' },
  { value: '>', label: 'Greater Than (>)', group: 'Comparison' },
  { value: '>=', label: 'Greater or Equal (>=)', group: 'Comparison' },
  { value: '<', label: 'Less Than (<)', group: 'Comparison' },
  { value: '<=', label: 'Less or Equal (<=)', group: 'Comparison' },
  { value: 'between', label: 'Between', group: 'Comparison' },
  // Null checks
  { value: 'isNull', label: 'Is Null', group: 'Null' },
  { value: 'isNotNull', label: 'Is Not Null', group: 'Null' },
  // String
  { value: 'like', label: 'Like (pattern)', group: 'String' },
  { value: 'rlike', label: 'Regex Like', group: 'String' },
  { value: 'startsWith', label: 'Starts With', group: 'String' },
  { value: 'endsWith', label: 'Ends With', group: 'String' },
  { value: 'contains', label: 'Contains', group: 'String' },
  // List
  { value: 'in', label: 'In List', group: 'List' },
  { value: 'notIn', label: 'Not In List', group: 'List' },
];

/**
 * Aggregation Functions
 */
export const AGG_FUNCTIONS = {
  count: ['count', 'countDistinct', 'approxCountDistinct'],
  math: ['sum', 'sumDistinct', 'avg', 'mean', 'min', 'max'],
  collect: ['collect_list', 'collect_set', 'first', 'last'],
  stats: ['stddev', 'stddev_pop', 'stddev_samp', 'variance', 'var_pop', 'var_samp', 'percentile_approx', 'skewness', 'kurtosis'],
} as const;

export const AGG_FUNCTION_OPTIONS: SelectOption[] = [
  // Count
  { value: 'count', label: 'Count', group: 'Count' },
  { value: 'countDistinct', label: 'Count Distinct', group: 'Count' },
  { value: 'approxCountDistinct', label: 'Approx Count Distinct', group: 'Count', description: 'Faster but approximate' },
  // Math
  { value: 'sum', label: 'Sum', group: 'Math' },
  { value: 'sumDistinct', label: 'Sum Distinct', group: 'Math' },
  { value: 'avg', label: 'Average', group: 'Math' },
  { value: 'mean', label: 'Mean', group: 'Math' },
  { value: 'min', label: 'Minimum', group: 'Math' },
  { value: 'max', label: 'Maximum', group: 'Math' },
  // Collect
  { value: 'collect_list', label: 'Collect List', group: 'Collect', description: 'Collect all values (with duplicates)' },
  { value: 'collect_set', label: 'Collect Set', group: 'Collect', description: 'Collect unique values' },
  { value: 'first', label: 'First', group: 'Collect' },
  { value: 'last', label: 'Last', group: 'Collect' },
  // Statistics
  { value: 'stddev', label: 'Std Deviation', group: 'Statistics' },
  { value: 'stddev_pop', label: 'Std Dev (Population)', group: 'Statistics' },
  { value: 'variance', label: 'Variance', group: 'Statistics' },
  { value: 'var_pop', label: 'Variance (Population)', group: 'Statistics' },
  { value: 'percentile_approx', label: 'Percentile (Approx)', group: 'Statistics' },
];

/**
 * Join Types
 */
export const JOIN_TYPES = [
  { value: 'inner', label: 'Inner', description: 'Only matching rows from both sides' },
  { value: 'left', label: 'Left', description: 'All rows from left, matching from right' },
  { value: 'right', label: 'Right', description: 'All rows from right, matching from left' },
  { value: 'full', label: 'Full Outer', description: 'All rows from both sides' },
  { value: 'left_semi', label: 'Left Semi', description: 'Left rows that have a match' },
  { value: 'left_anti', label: 'Left Anti', description: 'Left rows that have no match' },
  { value: 'cross', label: 'Cross', description: 'Cartesian product (every combination)' },
] as const;

export const JOIN_TYPE_OPTIONS: SelectOption[] = JOIN_TYPES.map(j => ({
  value: j.value,
  label: j.label,
  description: j.description,
}));

/**
 * Write Modes
 */
export const WRITE_MODES = [
  { value: 'overwrite', label: 'Overwrite', description: 'Replace existing data' },
  { value: 'append', label: 'Append', description: 'Add to existing data' },
  { value: 'ignore', label: 'Ignore', description: 'Skip if data exists' },
  { value: 'error', label: 'Error', description: 'Fail if data exists' },
] as const;

export const WRITE_MODE_OPTIONS: SelectOption[] = WRITE_MODES.map(m => ({
  value: m.value,
  label: m.label,
  description: m.description,
}));

/**
 * Sort Directions
 */
export const SORT_DIRECTIONS = [
  { value: 'asc', label: 'Ascending' },
  { value: 'desc', label: 'Descending' },
] as const;

export const SORT_DIRECTION_OPTIONS: SelectOption[] = SORT_DIRECTIONS.map(d => ({
  value: d.value,
  label: d.label,
}));

/**
 * Null Handling for Sort
 */
export const NULL_HANDLING = [
  { value: 'default', label: 'Default' },
  { value: 'first', label: 'Nulls First' },
  { value: 'last', label: 'Nulls Last' },
] as const;

export const NULL_HANDLING_OPTIONS: SelectOption[] = NULL_HANDLING.map(n => ({
  value: n.value,
  label: n.label,
}));

/**
 * Window Functions
 */
export const WINDOW_FUNCTIONS = {
  ranking: ['row_number', 'rank', 'dense_rank', 'percent_rank', 'cume_dist', 'ntile'],
  value: ['lag', 'lead', 'first', 'last', 'nth_value'],
  aggregate: ['sum', 'avg', 'count', 'min', 'max'],
} as const;

export const WINDOW_FUNCTION_OPTIONS: SelectOption[] = [
  // Ranking
  { value: 'row_number', label: 'Row Number', group: 'Ranking' },
  { value: 'rank', label: 'Rank', group: 'Ranking', description: 'Gaps after ties' },
  { value: 'dense_rank', label: 'Dense Rank', group: 'Ranking', description: 'No gaps after ties' },
  { value: 'percent_rank', label: 'Percent Rank', group: 'Ranking' },
  { value: 'cume_dist', label: 'Cumulative Distribution', group: 'Ranking' },
  { value: 'ntile', label: 'N-tile', group: 'Ranking', description: 'Divide into N buckets' },
  // Value
  { value: 'lag', label: 'Lag', group: 'Value', description: 'Previous row value' },
  { value: 'lead', label: 'Lead', group: 'Value', description: 'Next row value' },
  { value: 'first', label: 'First Value', group: 'Value' },
  { value: 'last', label: 'Last Value', group: 'Value' },
  { value: 'nth_value', label: 'Nth Value', group: 'Value' },
  // Aggregate
  { value: 'sum', label: 'Running Sum', group: 'Aggregate' },
  { value: 'avg', label: 'Running Average', group: 'Aggregate' },
  { value: 'count', label: 'Running Count', group: 'Aggregate' },
  { value: 'min', label: 'Running Min', group: 'Aggregate' },
  { value: 'max', label: 'Running Max', group: 'Aggregate' },
];

/**
 * Compression Types
 */
export const COMPRESSION_TYPES = [
  { value: 'none', label: 'None' },
  { value: 'snappy', label: 'Snappy', description: 'Fast, moderate compression' },
  { value: 'gzip', label: 'GZIP', description: 'Higher compression, slower' },
  { value: 'lz4', label: 'LZ4', description: 'Very fast, low compression' },
  { value: 'zstd', label: 'ZSTD', description: 'Good balance of speed and ratio' },
] as const;

export const COMPRESSION_OPTIONS: SelectOption[] = COMPRESSION_TYPES.map(c => ({
  value: c.value,
  label: c.label,
  description: 'description' in c ? c.description : undefined,
}));

/**
 * File Formats
 */
export const FILE_FORMATS = {
  source: ['csv', 'parquet', 'json', 'orc', 'avro', 'text', 'delta'],
  sink: ['csv', 'parquet', 'json', 'orc', 'avro', 'delta'],
} as const;

export const FILE_FORMAT_OPTIONS: SelectOption[] = [
  { value: 'csv', label: 'CSV', description: 'Comma-separated values' },
  { value: 'parquet', label: 'Parquet', description: 'Columnar format, recommended' },
  { value: 'json', label: 'JSON', description: 'JSON lines format' },
  { value: 'orc', label: 'ORC', description: 'Optimized Row Columnar' },
  { value: 'avro', label: 'Avro', description: 'Row-based, schema evolution' },
  { value: 'delta', label: 'Delta', description: 'Delta Lake format' },
  { value: 'text', label: 'Text', description: 'Plain text files' },
];

/**
 * Logical Operators
 */
export const LOGICAL_OPERATORS = [
  { value: 'AND', label: 'AND', description: 'All conditions must be true' },
  { value: 'OR', label: 'OR', description: 'Any condition must be true' },
] as const;

export const LOGICAL_OPERATOR_OPTIONS: SelectOption[] = LOGICAL_OPERATORS.map(o => ({
  value: o.value,
  label: o.label,
  description: o.description,
}));

/**
 * Expression Types
 */
export const EXPRESSION_TYPES = [
  { value: 'sql', label: 'SQL Expression', description: 'e.g., col1 + col2' },
  { value: 'column', label: 'Column Reference', description: 'Reference existing column' },
  { value: 'literal', label: 'Literal Value', description: 'Fixed value' },
] as const;

export const EXPRESSION_TYPE_OPTIONS: SelectOption[] = EXPRESSION_TYPES.map(e => ({
  value: e.value,
  label: e.label,
  description: e.description,
}));
