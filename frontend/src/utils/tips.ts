/**
 * ETLab - Tips & Best Practices
 *
 * Provides helpful tips, performance hints, and best practices for all node types.
 */

export interface NodeTip {
  shortTip: string;           // Brief tip for sidebar tooltip
  detailedTips: string[];     // Detailed tips for properties panel
  performanceNote?: string;   // Performance-specific guidance
  commonPitfall?: string;     // Common mistake to avoid
  bestPractice?: string;      // Recommended approach
  relatedNodes?: string[];    // Suggested related transforms
}

// ============================================
// Transform Tips
// ============================================

export const transformTips: Record<string, NodeTip> = {
  // Column Operations
  select: {
    shortTip: 'Select only needed columns early to reduce memory',
    detailedTips: [
      'Select columns as early as possible in your pipeline to reduce data shuffled',
      'Use column expressions for computed columns instead of separate addColumn',
      'Selecting fewer columns improves serialization and network transfer performance',
    ],
    performanceNote: 'Reduces memory footprint and speeds up downstream operations',
    bestPractice: 'Always select only the columns you need before expensive operations like joins',
    relatedNodes: ['dropColumn', 'addColumn'],
  },

  addColumn: {
    shortTip: 'Use withColumn for single columns, select for multiple',
    detailedTips: [
      'For adding multiple columns, use a single select() instead of chained withColumn()',
      'Chained withColumn calls create separate projection steps in the execution plan',
      'Use built-in functions (F.col, F.lit) instead of UDFs when possible',
    ],
    performanceNote: 'Chained withColumn is inefficient - use select for multiple columns',
    commonPitfall: 'Avoid chaining many withColumn calls - consolidate into one select',
    relatedNodes: ['select', 'cast'],
  },

  dropColumn: {
    shortTip: 'Drop unused columns early to save memory',
    detailedTips: [
      'Drop columns you don\'t need as early as possible',
      'Especially useful after joins that create duplicate columns',
      'Consider using select() to keep only needed columns instead',
    ],
    bestPractice: 'Drop unnecessary columns before shuffles (joins, groupBy)',
    relatedNodes: ['select'],
  },

  rename: {
    shortTip: 'Rename columns to avoid conflicts in joins',
    detailedTips: [
      'Rename columns before joins to avoid ambiguous column references',
      'Use consistent naming conventions across your pipeline',
      'withColumnRenamed is more efficient for single column renames',
    ],
    commonPitfall: 'Forgetting to rename duplicate columns before/after joins',
    relatedNodes: ['join', 'select'],
  },

  cast: {
    shortTip: 'Cast types early to catch errors and optimize storage',
    detailedTips: [
      'Cast to appropriate types early to catch data quality issues',
      'Use smaller numeric types (IntegerType vs LongType) when possible',
      'String to numeric casts can fail - handle nulls appropriately',
    ],
    performanceNote: 'Proper types improve memory usage and enable better optimizations',
    commonPitfall: 'Casting to wrong type silently produces nulls',
    relatedNodes: ['addColumn', 'fillna'],
  },

  flatten: {
    shortTip: 'Flatten nested structs for easier processing',
    detailedTips: [
      'Use to convert nested JSON/struct columns to flat structure',
      'Consider if you need all nested fields or just specific ones',
      'Can significantly increase column count - select needed columns after',
    ],
    relatedNodes: ['explode', 'select'],
  },

  // Row Operations
  filter: {
    shortTip: 'Filter early! Reduces data volume for all downstream operations',
    detailedTips: [
      'Apply filters as early as possible in your pipeline - this is the #1 optimization',
      'Use partition pruning by filtering on partition columns first',
      'Combine multiple conditions in a single filter when possible',
      'Use isNotNull() checks before operations that can fail on nulls',
    ],
    performanceNote: 'Early filtering dramatically reduces shuffle and processing time',
    bestPractice: 'Filter before joins, groupBy, and other expensive operations',
    relatedNodes: ['dropna', 'distinct'],
  },

  distinct: {
    shortTip: 'Wide transform - consider dropDuplicates for specific columns',
    detailedTips: [
      'Distinct requires a full shuffle - expensive on large datasets',
      'Use dropDuplicates with subset for partial uniqueness',
      'Consider if you really need global uniqueness or just within groups',
    ],
    performanceNote: 'Causes full shuffle - O(n) network transfer',
    commonPitfall: 'Using distinct when dropDuplicates(subset) would suffice',
    relatedNodes: ['dropDuplicates', 'groupBy'],
  },

  dropDuplicates: {
    shortTip: 'More flexible than distinct - can dedupe on specific columns',
    detailedTips: [
      'Use subset parameter to specify which columns determine uniqueness',
      'First occurrence is kept by default',
      'Combine with orderBy if you need to control which duplicate is kept',
    ],
    performanceNote: 'Still requires shuffle, but may process less data than distinct',
    bestPractice: 'Specify subset columns when you don\'t need full-row uniqueness',
    relatedNodes: ['distinct', 'groupBy'],
  },

  limit: {
    shortTip: 'Use for sampling during development, not for production pagination',
    detailedTips: [
      'Limit still processes all partitions to get N rows',
      'For true sampling, use sample() which is more efficient',
      'Useful for debugging and development, less so for production',
    ],
    commonPitfall: 'Thinking limit is efficient - it still scans data',
    relatedNodes: ['sample', 'filter'],
  },

  sample: {
    shortTip: 'Efficient random sampling - great for development and testing',
    detailedTips: [
      'Sample is a narrow transform - very efficient',
      'Use withReplacement=false for typical sampling',
      'Set seed for reproducible samples',
      'Great for testing pipelines on subset of data',
    ],
    performanceNote: 'Narrow transform - no shuffle required',
    bestPractice: 'Use during development to test on smaller datasets',
    relatedNodes: ['limit', 'filter'],
  },

  dropna: {
    shortTip: 'Remove null rows - filter early for better performance',
    detailedTips: [
      'Use "any" to drop rows with any null, "all" for all nulls',
      'Specify subset to only check specific columns',
      'Consider fillna if you want to keep rows with defaults',
    ],
    bestPractice: 'Drop nulls early if they\'re not needed downstream',
    relatedNodes: ['fillna', 'filter'],
  },

  fillna: {
    shortTip: 'Replace nulls with defaults - prevents null-related errors',
    detailedTips: [
      'Can specify different values for different columns',
      'Consider using coalesce() for column-specific logic',
      'Fill nulls before operations that don\'t handle nulls well',
    ],
    bestPractice: 'Fill nulls before aggregations to get accurate counts/sums',
    relatedNodes: ['dropna', 'filter'],
  },

  map: {
    shortTip: 'Apply function to each row - prefer built-in functions',
    detailedTips: [
      'Map is a narrow transform - efficient',
      'Prefer built-in Spark functions over Python UDFs',
      'Python UDFs serialize data to Python - slow!',
    ],
    performanceNote: 'Python UDFs are 10-100x slower than built-in functions',
    commonPitfall: 'Using Python UDFs when built-in functions exist',
    relatedNodes: ['flatMap', 'addColumn'],
  },

  flatMap: {
    shortTip: 'Map + flatten - useful for one-to-many transformations',
    detailedTips: [
      'Returns zero or more output rows per input row',
      'Useful for tokenizing, splitting records, etc.',
      'Consider explode for array columns instead',
    ],
    relatedNodes: ['map', 'explode'],
  },

  // Aggregations
  groupBy: {
    shortTip: 'Wide transform - filter and select before grouping',
    detailedTips: [
      'GroupBy triggers a shuffle - one of the most expensive operations',
      'Filter data before groupBy to reduce shuffle volume',
      'Select only needed columns before grouping',
      'Consider approximate functions (approx_count_distinct) for large datasets',
    ],
    performanceNote: 'Causes full shuffle - minimize data before grouping',
    bestPractice: 'Filter and select columns before groupBy, not after',
    commonPitfall: 'Grouping on high-cardinality columns causes data skew',
    relatedNodes: ['filter', 'select', 'cube', 'rollup'],
  },

  cube: {
    shortTip: 'Multi-dimensional aggregation - more expensive than groupBy',
    detailedTips: [
      'Creates aggregations for all combinations of grouping columns',
      'Output size grows exponentially with number of columns',
      'Useful for OLAP-style analysis',
    ],
    performanceNote: '2^n combinations for n grouping columns',
    relatedNodes: ['groupBy', 'rollup'],
  },

  rollup: {
    shortTip: 'Hierarchical aggregation - subtotals and grand totals',
    detailedTips: [
      'Creates hierarchical subtotals (like Excel subtotals)',
      'Less combinations than cube - more efficient',
      'Order of columns matters - first column is highest level',
    ],
    performanceNote: 'n+1 combinations for n columns (more efficient than cube)',
    relatedNodes: ['groupBy', 'cube'],
  },

  collectList: {
    shortTip: 'Collect values into array - beware of memory on large groups',
    detailedTips: [
      'Collects all values in a group into an array',
      'Can cause OOM if groups are very large',
      'Consider using first/last if you only need one value',
    ],
    performanceNote: 'Large arrays can cause memory issues',
    commonPitfall: 'Collecting millions of values into single array',
    relatedNodes: ['collectSet', 'groupBy'],
  },

  collectSet: {
    shortTip: 'Collect unique values into array - deduplicates automatically',
    detailedTips: [
      'Like collectList but removes duplicates',
      'Slightly more expensive due to deduplication',
      'Same memory concerns as collectList',
    ],
    relatedNodes: ['collectList', 'groupBy'],
  },

  // Joins
  join: {
    shortTip: 'Wide transform - broadcast small tables, filter before joining',
    detailedTips: [
      'Joins are expensive - require shuffling both datasets',
      'Use broadcast hint for small tables (<10MB by default)',
      'Filter both sides before joining to reduce shuffle',
      'Avoid Cartesian joins (cross join) on large datasets',
      'Consider salting for skewed join keys',
    ],
    performanceNote: 'Shuffles both datasets - O(n+m) network transfer',
    bestPractice: 'Broadcast smaller table, filter both sides, salt skewed keys',
    commonPitfall: 'Joining on skewed keys causes stragglers',
    relatedNodes: ['broadcast', 'filter', 'salt'],
  },

  union: {
    shortTip: 'Narrow transform - combines DataFrames without shuffle',
    detailedTips: [
      'Union is efficient - just combines partitions',
      'Schemas must match exactly',
      'Use unionByName if column order differs',
      'Does not remove duplicates - use distinct after if needed',
    ],
    performanceNote: 'Narrow transform - no shuffle, very efficient',
    bestPractice: 'Use unionByName for robustness against column reordering',
    relatedNodes: ['distinct', 'intersect'],
  },

  intersect: {
    shortTip: 'Wide transform - finds common rows between DataFrames',
    detailedTips: [
      'Returns rows that exist in both DataFrames',
      'Requires shuffle of both datasets',
      'Removes duplicates automatically',
    ],
    performanceNote: 'Causes shuffle - expensive on large datasets',
    relatedNodes: ['union', 'subtract', 'intersectAll'],
  },

  subtract: {
    shortTip: 'Wide transform - removes rows that exist in other DataFrame',
    detailedTips: [
      'Returns rows in first DataFrame not in second',
      'Requires shuffle of both datasets',
      'Useful for finding deleted/changed records',
    ],
    performanceNote: 'Causes shuffle - consider filter alternative if possible',
    relatedNodes: ['intersect', 'exceptAll'],
  },

  // Sorting
  sort: {
    shortTip: 'Wide transform - global sort is expensive, consider alternatives',
    detailedTips: [
      'Global sort requires shuffling all data',
      'Use sortWithinPartitions if global order not needed',
      'Limit after sort is still expensive - sort happens first',
      'Consider if you really need sorted output',
    ],
    performanceNote: 'Full shuffle + sort - one of the most expensive operations',
    commonPitfall: 'Sorting when order doesn\'t matter downstream',
    relatedNodes: ['sortWithinPartitions', 'repartition'],
  },

  sortWithinPartitions: {
    shortTip: 'Narrow transform - sorts within each partition only',
    detailedTips: [
      'Much more efficient than global sort',
      'Each partition is sorted independently',
      'Useful when downstream operations only need local order',
      'Great before writing partitioned data',
    ],
    performanceNote: 'No shuffle - sorts in parallel within partitions',
    bestPractice: 'Use instead of sort when global order not required',
    relatedNodes: ['sort', 'repartition'],
  },

  // Window Functions
  window: {
    shortTip: 'Wide transform - ensure proper partitioning to avoid skew',
    detailedTips: [
      'Window functions process data within partitions',
      'Partition by columns with reasonable cardinality',
      'High-cardinality partitions = more parallelism but more overhead',
      'Low-cardinality partitions = potential skew',
    ],
    performanceNote: 'Requires shuffle to co-locate window partitions',
    commonPitfall: 'Single partition window = all data on one node',
    bestPractice: 'Partition by columns with medium cardinality',
    relatedNodes: ['groupBy', 'sort'],
  },

  // Reshaping
  explode: {
    shortTip: 'Narrow transform - but can multiply row count significantly',
    detailedTips: [
      'Creates one row per array element',
      'Can dramatically increase data volume',
      'Filter before exploding if possible',
      'Use posexplode to get index along with value',
    ],
    performanceNote: 'Narrow but may create data explosion',
    commonPitfall: 'Exploding before filter multiplies unnecessary data',
    relatedNodes: ['flatten', 'filter'],
  },

  pivot: {
    shortTip: 'Wide transform - expensive, specify values if known',
    detailedTips: [
      'Pivot requires two shuffles - one to find unique values, one to pivot',
      'Specify pivot values explicitly to avoid first shuffle',
      'Limit number of pivot columns for performance',
    ],
    performanceNote: 'Two shuffles if values not specified',
    bestPractice: 'Always specify pivot values: pivot("col", ["val1", "val2"])',
    relatedNodes: ['unpivot', 'groupBy'],
  },

  unpivot: {
    shortTip: 'Narrow transform - converts columns to rows',
    detailedTips: [
      'Opposite of pivot - columns become rows',
      'Useful for normalizing wide tables',
      'More efficient than pivot (no shuffle)',
    ],
    relatedNodes: ['pivot', 'explode'],
  },

  // Analytics
  describe: {
    shortTip: 'Computes statistics - triggers multiple passes over data',
    detailedTips: [
      'Computes count, mean, stddev, min, max',
      'Requires multiple passes over the data',
      'Use summary() for more statistics',
    ],
    relatedNodes: ['summary', 'approxQuantile'],
  },

  summary: {
    shortTip: 'Extended statistics - includes percentiles',
    detailedTips: [
      'More comprehensive than describe()',
      'Includes 25%, 50%, 75% percentiles',
      'Expensive on large datasets',
    ],
    relatedNodes: ['describe', 'approxQuantile'],
  },

  correlation: {
    shortTip: 'Computes correlation between two columns',
    detailedTips: [
      'Pearson correlation coefficient',
      'Requires numeric columns',
      'Use for feature selection in ML pipelines',
    ],
    relatedNodes: ['covariance', 'describe'],
  },

  approxQuantile: {
    shortTip: 'Approximate percentiles - more efficient than exact',
    detailedTips: [
      'Uses Greenwald-Khanna algorithm',
      'Accuracy controlled by relativeError parameter',
      'Much faster than exact percentiles on large data',
    ],
    performanceNote: 'O(1/epsilon) memory, much faster than exact',
    bestPractice: 'Use relativeError=0.01 for 1% accuracy',
    relatedNodes: ['describe', 'summary'],
  },

  // Caching & Persistence
  cache: {
    shortTip: 'Cache before multiple actions - unpersist when done',
    detailedTips: [
      'Caches DataFrame in memory (MEMORY_AND_DISK by default)',
      'Use before multiple actions on same DataFrame',
      'Remember to unpersist when no longer needed',
      'Cache is lazy - only cached when action is called',
    ],
    performanceNote: 'Trades memory for computation',
    bestPractice: 'Cache after expensive transforms, before multiple actions',
    commonPitfall: 'Forgetting to unpersist - causes memory pressure',
    relatedNodes: ['persist', 'unpersist', 'checkpoint'],
  },

  persist: {
    shortTip: 'More control than cache - choose storage level',
    detailedTips: [
      'Choose storage level: MEMORY_ONLY, MEMORY_AND_DISK, DISK_ONLY, etc.',
      'MEMORY_AND_DISK is usually the best choice',
      'Use MEMORY_ONLY_SER for memory-constrained environments',
    ],
    performanceNote: 'Different levels trade off speed vs. reliability',
    relatedNodes: ['cache', 'unpersist'],
  },

  checkpoint: {
    shortTip: 'Breaks lineage - useful for very long pipelines',
    detailedTips: [
      'Writes data to disk and truncates lineage',
      'Useful for iterative algorithms and very long pipelines',
      'More reliable than cache (survives executor failure)',
      'Requires checkpoint directory to be set',
    ],
    performanceNote: 'Adds disk I/O but reduces recomputation risk',
    bestPractice: 'Checkpoint every 10-20 stages in long pipelines',
    relatedNodes: ['cache', 'localCheckpoint'],
  },

  localCheckpoint: {
    shortTip: 'Fast checkpoint - trades reliability for speed',
    detailedTips: [
      'Checkpoints to executor local storage',
      'Faster than reliable checkpoint',
      'Data lost if executor fails',
    ],
    performanceNote: 'Faster than checkpoint but less reliable',
    relatedNodes: ['checkpoint', 'cache'],
  },

  unpersist: {
    shortTip: 'Free cached memory - always unpersist when done',
    detailedTips: [
      'Removes DataFrame from cache/memory',
      'Essential for memory management',
      'Use blocking=true if you need synchronous unpersist',
    ],
    bestPractice: 'Always pair cache/persist with unpersist',
    relatedNodes: ['cache', 'persist'],
  },

  // Partitioning
  repartition: {
    shortTip: 'Wide transform - use coalesce to reduce partitions instead',
    detailedTips: [
      'Repartition always causes a full shuffle',
      'Use to increase partitions or repartition by column',
      'Use coalesce instead when reducing partitions',
      'Repartition by join key before join can improve performance',
    ],
    performanceNote: 'Full shuffle - expensive operation',
    bestPractice: 'Use coalesce for reducing, repartition for increasing/rebalancing',
    relatedNodes: ['coalesce', 'salt'],
  },

  coalesce: {
    shortTip: 'Narrow transform - efficient partition reduction',
    detailedTips: [
      'Reduces partitions without full shuffle',
      'Combines existing partitions',
      'Cannot increase number of partitions',
      'Use before writing to reduce small files',
    ],
    performanceNote: 'No shuffle - much more efficient than repartition for reducing',
    bestPractice: 'Always use coalesce instead of repartition for reducing partitions',
    relatedNodes: ['repartition'],
  },

  broadcast: {
    shortTip: 'Mark DataFrame for broadcast - use for small lookup tables',
    detailedTips: [
      'Broadcasts small DataFrame to all executors',
      'Enables broadcast hash join (very efficient)',
      'Default threshold is 10MB (configurable)',
      'Great for dimension tables and lookup tables',
    ],
    performanceNote: 'Avoids shuffle in joins - massive speedup for small tables',
    bestPractice: 'Broadcast dimension tables, filter facts',
    commonPitfall: 'Broadcasting large tables causes OOM on executors',
    relatedNodes: ['join'],
  },

  salt: {
    shortTip: 'Handle skewed join keys by adding random salt',
    detailedTips: [
      'Adds random salt to skewed keys to distribute data evenly',
      'Requires salting both sides of join and exploding',
      'Trades computation for better parallelism',
    ],
    performanceNote: 'Fixes skew but increases data volume',
    bestPractice: 'Use when join key distribution is highly skewed',
    relatedNodes: ['join', 'repartition'],
  },

  bucketing: {
    shortTip: 'Pre-partition data on disk for efficient joins',
    detailedTips: [
      'Writes data pre-partitioned by bucket columns',
      'Enables sort-merge join without shuffle',
      'Both tables must be bucketed on same columns',
      'Great for repeatedly joined tables',
    ],
    performanceNote: 'Upfront cost, but joins become shuffle-free',
    bestPractice: 'Bucket frequently joined dimension tables',
    relatedNodes: ['join', 'repartition'],
  },
};

// ============================================
// Source Tips
// ============================================

export const sourceTips: Record<string, NodeTip> = {
  csv: {
    shortTip: 'Set schema explicitly for better performance and reliability',
    detailedTips: [
      'Always provide explicit schema instead of inferSchema=true',
      'Schema inference reads file twice - slow on large files',
      'Use mode="DROPMALFORMED" to handle bad records gracefully',
      'Set appropriate delimiter, quote, and escape characters',
    ],
    performanceNote: 'Explicit schema avoids extra file scan',
    bestPractice: 'Define schema, set header=true, use PERMISSIVE mode',
  },

  parquet: {
    shortTip: 'Columnar format - great for analytics, use partition pruning',
    detailedTips: [
      'Parquet is columnar - only reads needed columns',
      'Filter on partition columns first for partition pruning',
      'Enable predicate pushdown (enabled by default)',
      'Use mergeSchema=false if schema is consistent',
    ],
    performanceNote: 'Columnar + compression = very efficient for analytics',
    bestPractice: 'Partition by date/region, filter on partition columns',
  },

  json: {
    shortTip: 'Provide schema for nested JSON - inference is expensive',
    detailedTips: [
      'Schema inference on JSON is very slow',
      'Multiline JSON requires multiLine=true',
      'Use flatten/explode for nested structures',
    ],
    performanceNote: 'Schema inference scans entire file - very slow',
    bestPractice: 'Always provide explicit schema for JSON',
  },

  delta: {
    shortTip: 'ACID transactions + time travel - use for lakehouse',
    detailedTips: [
      'Supports ACID transactions and time travel',
      'Use versionAsOf or timestampAsOf for time travel',
      'Optimize and vacuum regularly for performance',
      'Z-order by commonly filtered columns',
    ],
    bestPractice: 'Use Delta for production data lakes',
  },

  jdbc: {
    shortTip: 'Use partitioning for parallel reads from database',
    detailedTips: [
      'Set partitionColumn, lowerBound, upperBound, numPartitions for parallel reads',
      'Without partitioning, entire table read by single task',
      'Use fetchsize to control memory usage',
      'Push down filters when possible',
    ],
    performanceNote: 'Parallel reads require partitioning configuration',
    commonPitfall: 'Not setting partition parameters = single-threaded read',
  },
};

// ============================================
// Sink Tips
// ============================================

export const sinkTips: Record<string, NodeTip> = {
  parquet: {
    shortTip: 'Partition by date/key, coalesce to avoid small files',
    detailedTips: [
      'Partition by commonly filtered columns (date, region)',
      'Coalesce before writing to control file count',
      'Use snappy compression (default) for balanced speed/size',
      'Consider bucketing for frequently joined tables',
    ],
    performanceNote: 'Small files = poor read performance',
    bestPractice: 'Coalesce to ~128MB-1GB files, partition wisely',
  },

  delta: {
    shortTip: 'Use merge for upserts, optimize after large writes',
    detailedTips: [
      'Use merge for UPSERT operations',
      'Run OPTIMIZE after large batch writes',
      'VACUUM to remove old files (respects retention)',
      'Z-ORDER by commonly filtered columns',
    ],
    bestPractice: 'Optimize weekly, vacuum monthly, z-order by filter columns',
  },

  jdbc: {
    shortTip: 'Use batch size and truncate for performance',
    detailedTips: [
      'Set batchsize for efficient writes',
      'Use truncate=true with overwrite for faster truncate',
      'Consider staging table + merge for production',
    ],
    performanceNote: 'Larger batch size = fewer round trips',
  },
};

// ============================================
// Action Tips
// ============================================

export const actionTips: Record<string, NodeTip> = {
  show: {
    shortTip: 'Use for debugging - triggers computation of entire pipeline',
    detailedTips: [
      'Triggers action - computes entire upstream pipeline',
      'Use n parameter to limit rows displayed',
      'truncate=false shows full column content',
    ],
    commonPitfall: 'Calling show multiple times re-computes pipeline each time',
  },

  count: {
    shortTip: 'Triggers full computation - cache if counting multiple times',
    detailedTips: [
      'Counts all rows - triggers full pipeline execution',
      'Cache before count if you\'ll do more actions',
      'Consider approx_count_distinct for estimates',
    ],
    performanceNote: 'Full scan required - O(n) operation',
  },

  collect: {
    shortTip: 'Dangerous! Brings all data to driver - can cause OOM',
    detailedTips: [
      'Collects ALL data to driver memory',
      'Will crash driver on large datasets',
      'Use take(), first(), or show() instead',
      'Only use when you\'re sure data is small',
    ],
    performanceNote: 'O(n) data transfer to driver',
    commonPitfall: 'Collecting large DataFrame = driver OOM crash',
  },

  printSchema: {
    shortTip: 'Shows schema structure - useful for debugging nested data',
    detailedTips: [
      'Displays schema tree structure',
      'No computation triggered (schema is metadata)',
      'Useful for understanding nested/complex schemas',
    ],
    performanceNote: 'No computation - instant',
  },
};

// ============================================
// Helper Functions
// ============================================

export const getTip = (category: string, type: string): NodeTip | undefined => {
  switch (category) {
    case 'source':
      return sourceTips[type];
    case 'transform':
      return transformTips[type];
    case 'sink':
      return sinkTips[type];
    case 'action':
      return actionTips[type];
    default:
      return undefined;
  }
};

export const getShortTip = (category: string, type: string): string => {
  const tip = getTip(category, type);
  return tip?.shortTip || '';
};

export const getDetailedTips = (category: string, type: string): string[] => {
  const tip = getTip(category, type);
  return tip?.detailedTips || [];
};
