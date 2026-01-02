/**
 * Code Generators for SQL Preview
 *
 * These functions generate PySpark code snippets for preview purposes.
 * They mirror the actual code generation logic but are simplified for UI display.
 */

// ============================================
// FILTER
// ============================================

export interface FilterCondition {
  id: string;
  column: string;
  operator: string;
  value: string | number | boolean | string[];
  value2?: string | number; // For BETWEEN
  dataType?: string;
}

export interface FilterConfig {
  mode: 'simple' | 'sql' | 'advanced';
  conditions?: FilterCondition[];
  logicalOperator?: 'AND' | 'OR';
  sqlExpression?: string;
}

export const generateFilterPreview = (
  config: FilterConfig,
  inputVar: string = 'df'
): string => {
  if (!config) return '';

  // SQL mode
  if (config.mode === 'sql' && config.sqlExpression) {
    return `${inputVar}.filter("${config.sqlExpression}")`;
  }

  // Simple/Advanced mode with conditions
  if (config.conditions && config.conditions.length > 0) {
    const conditions = config.conditions
      .filter(c => c.column && c.operator)
      .map(c => generateConditionCode(c));

    if (conditions.length === 0) return '';

    const operator = config.logicalOperator === 'OR' ? ' | ' : ' & ';
    const conditionStr = conditions.length === 1
      ? conditions[0]
      : `(${conditions.join(`)${operator}(`)})`;

    return `${inputVar}.filter(${conditionStr})`;
  }

  return '';
};

const generateConditionCode = (condition: FilterCondition): string => {
  const { column, operator, value, value2 } = condition;
  const colRef = `col("${column}")`;

  switch (operator) {
    case '==':
      return `${colRef} == ${formatValue(value)}`;
    case '!=':
      return `${colRef} != ${formatValue(value)}`;
    case '>':
      return `${colRef} > ${formatValue(value)}`;
    case '>=':
      return `${colRef} >= ${formatValue(value)}`;
    case '<':
      return `${colRef} < ${formatValue(value)}`;
    case '<=':
      return `${colRef} <= ${formatValue(value)}`;
    case 'between':
      return `${colRef}.between(${formatValue(value)}, ${formatValue(value2)})`;
    case 'isNull':
      return `${colRef}.isNull()`;
    case 'isNotNull':
      return `${colRef}.isNotNull()`;
    case 'like':
      return `${colRef}.like(${formatValue(value)})`;
    case 'rlike':
      return `${colRef}.rlike(${formatValue(value)})`;
    case 'startsWith':
      return `${colRef}.startswith(${formatValue(value)})`;
    case 'endsWith':
      return `${colRef}.endswith(${formatValue(value)})`;
    case 'contains':
      return `${colRef}.contains(${formatValue(value)})`;
    case 'in':
      const inValues = Array.isArray(value) ? value : String(value).split(',').map(v => v.trim());
      return `${colRef}.isin([${inValues.map(v => formatValue(v)).join(', ')}])`;
    case 'notIn':
      const notInValues = Array.isArray(value) ? value : String(value).split(',').map(v => v.trim());
      return `~${colRef}.isin([${notInValues.map(v => formatValue(v)).join(', ')}])`;
    default:
      return `${colRef} ${operator} ${formatValue(value)}`;
  }
};

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return 'None';
  if (typeof value === 'string') {
    // Check if it's a number
    if (!isNaN(Number(value)) && value.trim() !== '') {
      return value;
    }
    return `"${value}"`;
  }
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  return String(value);
};

// ============================================
// SELECT
// ============================================

export interface DerivedColumn {
  id: string;
  expression: string;
  alias: string;
  expressionType: 'sql' | 'column' | 'literal';
}

export interface SelectConfig {
  mode: 'columns' | 'expressions';
  columns?: string;
  derivedColumns?: DerivedColumn[];
}

export const generateSelectPreview = (
  config: SelectConfig,
  inputVar: string = 'df'
): string => {
  if (!config) return '';

  const parts: string[] = [];

  // Basic columns
  if (config.columns) {
    const cols = config.columns.split(',').map(c => c.trim()).filter(Boolean);
    cols.forEach(col => parts.push(`"${col}"`));
  }

  // Derived columns
  if (config.derivedColumns && config.derivedColumns.length > 0) {
    config.derivedColumns.forEach(dc => {
      if (!dc.expression || !dc.alias) return;

      if (dc.expressionType === 'sql') {
        parts.push(`F.expr("${dc.expression}").alias("${dc.alias}")`);
      } else if (dc.expressionType === 'column') {
        parts.push(`col("${dc.expression}").alias("${dc.alias}")`);
      } else {
        parts.push(`lit(${formatValue(dc.expression)}).alias("${dc.alias}")`);
      }
    });
  }

  if (parts.length === 0) return '';

  if (parts.length <= 3) {
    return `${inputVar}.select(${parts.join(', ')})`;
  }

  return `${inputVar}.select(\n    ${parts.join(',\n    ')}\n)`;
};

// ============================================
// GROUP BY
// ============================================

export interface Aggregation {
  id: string;
  column: string;
  function: string;
  alias: string;
}

export interface GroupByConfig {
  groupByColumns: string;
  aggregations: Aggregation[];
  pivot?: {
    enabled: boolean;
    column: string;
    values?: string[];
  };
}

export const generateGroupByPreview = (
  config: GroupByConfig,
  inputVar: string = 'df'
): string => {
  if (!config || !config.groupByColumns) return '';

  const groupCols = config.groupByColumns
    .split(',')
    .map(c => c.trim())
    .filter(Boolean)
    .map(c => `"${c}"`)
    .join(', ');

  if (!groupCols) return '';

  let code = `${inputVar}.groupBy(${groupCols})`;

  // Pivot
  if (config.pivot?.enabled && config.pivot.column) {
    code += `\n    .pivot("${config.pivot.column}")`;
  }

  // Aggregations
  if (config.aggregations && config.aggregations.length > 0) {
    const aggs = config.aggregations
      .filter(a => a.column && a.function && a.alias)
      .map(a => {
        if (a.function === 'count' && a.column === '*') {
          return `F.count("*").alias("${a.alias}")`;
        }
        return `F.${a.function}("${a.column}").alias("${a.alias}")`;
      });

    if (aggs.length > 0) {
      if (aggs.length === 1) {
        code += `\n    .agg(${aggs[0]})`;
      } else {
        code += `\n    .agg(\n        ${aggs.join(',\n        ')}\n    )`;
      }
    }
  }

  return code;
};

// ============================================
// JOIN
// ============================================

export interface JoinColumnPair {
  leftColumn: string;
  rightColumn: string;
}

export interface JoinConfig {
  joinType: string;
  conditionMode: 'sameColumn' | 'differentColumns' | 'expression';
  joinColumn?: string;
  columnPairs?: JoinColumnPair[];
  joinExpression?: string;
  broadcastHint?: 'none' | 'left' | 'right';
}

export const generateJoinPreview = (
  config: JoinConfig,
  leftVar: string = 'df_left',
  rightVar: string = 'df_right'
): string => {
  if (!config || !config.joinType) return '';

  let rightRef = rightVar;

  // Broadcast hint
  if (config.broadcastHint === 'right') {
    rightRef = `broadcast(${rightVar})`;
  }

  let joinCondition = '';

  // Same column
  if (config.conditionMode === 'sameColumn' && config.joinColumn) {
    joinCondition = `"${config.joinColumn}"`;
  }
  // Different columns
  else if (config.conditionMode === 'differentColumns' && config.columnPairs?.length) {
    const pairs = config.columnPairs
      .filter(p => p.leftColumn && p.rightColumn)
      .map(p => `${leftVar}["${p.leftColumn}"] == ${rightVar}["${p.rightColumn}"]`);

    if (pairs.length === 1) {
      joinCondition = pairs[0];
    } else if (pairs.length > 1) {
      joinCondition = `(${pairs.join(') & (')})`;
    }
  }
  // Expression
  else if (config.conditionMode === 'expression' && config.joinExpression) {
    joinCondition = config.joinExpression;
  }

  if (!joinCondition) return '';

  let code = '';
  if (config.broadcastHint === 'left') {
    code = `broadcast(${leftVar}).join(\n    ${rightRef},\n    ${joinCondition},\n    "${config.joinType}"\n)`;
  } else {
    code = `${leftVar}.join(\n    ${rightRef},\n    ${joinCondition},\n    "${config.joinType}"\n)`;
  }

  return code;
};

// ============================================
// SORT
// ============================================

export interface SortColumn {
  column: string;
  direction: 'asc' | 'desc';
  nulls?: 'default' | 'first' | 'last';
}

export interface SortConfig {
  sortColumns: SortColumn[];
}

export const generateSortPreview = (
  config: SortConfig,
  inputVar: string = 'df'
): string => {
  if (!config || !config.sortColumns?.length) return '';

  const sortExprs = config.sortColumns
    .filter(s => s.column)
    .map(s => {
      let expr = `col("${s.column}")`;

      if (s.direction === 'desc') {
        expr += '.desc()';
      } else {
        expr += '.asc()';
      }

      if (s.nulls === 'first') {
        expr += '.nullsFirst()';
      } else if (s.nulls === 'last') {
        expr += '.nullsLast()';
      }

      return expr;
    });

  if (sortExprs.length === 0) return '';

  if (sortExprs.length <= 2) {
    return `${inputVar}.orderBy(${sortExprs.join(', ')})`;
  }

  return `${inputVar}.orderBy(\n    ${sortExprs.join(',\n    ')}\n)`;
};

// ============================================
// WINDOW
// ============================================

export interface WindowConfig {
  partitionBy: string;
  orderBy: { column: string; direction: 'asc' | 'desc' }[];
  function: string;
  column?: string;
  alias: string;
  frameType?: 'rows' | 'range';
  frameStart?: string;
  frameEnd?: string;
}

export const generateWindowPreview = (
  config: WindowConfig,
  inputVar: string = 'df'
): string => {
  if (!config || !config.function || !config.alias) return '';

  // Build window spec
  const partitionCols = config.partitionBy
    ? config.partitionBy.split(',').map(c => `"${c.trim()}"`).join(', ')
    : '';

  let windowSpec = 'Window';

  if (partitionCols) {
    windowSpec += `.partitionBy(${partitionCols})`;
  }

  if (config.orderBy?.length) {
    const orderExprs = config.orderBy
      .filter(o => o.column)
      .map(o => o.direction === 'desc' ? `col("${o.column}").desc()` : `col("${o.column}")`);

    if (orderExprs.length) {
      windowSpec += `.orderBy(${orderExprs.join(', ')})`;
    }
  }

  // Frame specification
  if (config.frameType && config.frameStart && config.frameEnd) {
    const start = config.frameStart === 'unbounded' ? 'Window.unboundedPreceding' : config.frameStart;
    const end = config.frameEnd === 'unbounded' ? 'Window.unboundedFollowing' :
                config.frameEnd === 'current' ? 'Window.currentRow' : config.frameEnd;

    if (config.frameType === 'rows') {
      windowSpec += `.rowsBetween(${start}, ${end})`;
    } else {
      windowSpec += `.rangeBetween(${start}, ${end})`;
    }
  }

  // Build function call
  let funcCall = '';
  const rankingFuncs = ['row_number', 'rank', 'dense_rank', 'percent_rank', 'cume_dist'];

  if (rankingFuncs.includes(config.function)) {
    funcCall = `F.${config.function}()`;
  } else if (config.function === 'ntile') {
    funcCall = `F.ntile(4)`; // Default to 4 buckets
  } else if (config.function === 'lag' || config.function === 'lead') {
    funcCall = `F.${config.function}("${config.column || 'column'}", 1)`;
  } else if (config.column) {
    funcCall = `F.${config.function}("${config.column}")`;
  } else {
    funcCall = `F.${config.function}()`;
  }

  return `${inputVar}.withColumn(\n    "${config.alias}",\n    ${funcCall}.over(${windowSpec})\n)`;
};

// ============================================
// ADD COLUMNS
// ============================================

export interface AddColumnConfig {
  columns: {
    id: string;
    name: string;
    expression: string;
    expressionType: 'sql' | 'column' | 'literal';
  }[];
}

export const generateAddColumnsPreview = (
  config: AddColumnConfig,
  inputVar: string = 'df'
): string => {
  if (!config || !config.columns?.length) return '';

  const validCols = config.columns.filter(c => c.name && c.expression);
  if (validCols.length === 0) return '';

  const lines = validCols.map(c => {
    let expr = '';
    if (c.expressionType === 'sql') {
      expr = `F.expr("${c.expression}")`;
    } else if (c.expressionType === 'column') {
      expr = `col("${c.expression}")`;
    } else {
      expr = `lit(${formatValue(c.expression)})`;
    }
    return `.withColumn("${c.name}", ${expr})`;
  });

  return `${inputVar}${lines.join('\n    ')}`;
};

// ============================================
// SOURCE
// ============================================

export interface SourceConfig {
  sourceType: string;
  path?: string;
  format?: string;
  options?: Record<string, unknown>;
}

export const generateSourcePreview = (
  config: SourceConfig,
  varName: string = 'df'
): string => {
  if (!config) return '';

  const format = config.format || config.sourceType || 'parquet';
  const path = config.path || '/path/to/data';

  let code = `${varName} = spark.read.format("${format}")`;

  // Add common options
  if (config.options) {
    Object.entries(config.options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        code += `\n    .option("${key}", ${formatValue(value)})`;
      }
    });
  }

  code += `\n    .load("${path}")`;

  return code;
};

// ============================================
// SINK
// ============================================

export interface SinkConfig {
  sinkType: string;
  path?: string;
  format?: string;
  mode?: string;
  partitionBy?: string;
  options?: Record<string, unknown>;
}

export const generateSinkPreview = (
  config: SinkConfig,
  inputVar: string = 'df'
): string => {
  if (!config) return '';

  const format = config.format || config.sinkType || 'parquet';
  const path = config.path || '/path/to/output';
  const mode = config.mode || 'overwrite';

  let code = `${inputVar}.write.format("${format}")`;
  code += `\n    .mode("${mode}")`;

  // Partition by
  if (config.partitionBy) {
    const partCols = config.partitionBy.split(',').map(c => `"${c.trim()}"`).join(', ');
    code += `\n    .partitionBy(${partCols})`;
  }

  // Add options
  if (config.options) {
    Object.entries(config.options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        code += `\n    .option("${key}", ${formatValue(value)})`;
      }
    });
  }

  code += `\n    .save("${path}")`;

  return code;
};

// ============================================
// SIMPLE TRANSFORMS
// ============================================

export const generateDistinctPreview = (inputVar: string = 'df'): string => {
  return `${inputVar}.distinct()`;
};

export const generateDropDuplicatesPreview = (
  columns: string | undefined,
  inputVar: string = 'df'
): string => {
  if (columns) {
    const cols = columns.split(',').map(c => `"${c.trim()}"`).join(', ');
    return `${inputVar}.dropDuplicates([${cols}])`;
  }
  return `${inputVar}.dropDuplicates()`;
};

export const generateLimitPreview = (
  limit: number,
  inputVar: string = 'df'
): string => {
  return `${inputVar}.limit(${limit})`;
};

export const generateSamplePreview = (
  fraction: number,
  withReplacement: boolean = false,
  seed?: number,
  inputVar: string = 'df'
): string => {
  let code = `${inputVar}.sample(${withReplacement ? 'True' : 'False'}, ${fraction}`;
  if (seed !== undefined) {
    code += `, ${seed}`;
  }
  code += ')';
  return code;
};

export const generateDropNaPreview = (
  how: 'any' | 'all',
  subset: string | undefined,
  threshold?: number,
  inputVar: string = 'df'
): string => {
  const parts: string[] = [];

  if (how) parts.push(`how="${how}"`);
  if (threshold !== undefined) parts.push(`thresh=${threshold}`);
  if (subset) {
    const cols = subset.split(',').map(c => `"${c.trim()}"`).join(', ');
    parts.push(`subset=[${cols}]`);
  }

  if (parts.length === 0) {
    return `${inputVar}.dropna()`;
  }

  return `${inputVar}.dropna(${parts.join(', ')})`;
};

export const generateFillNaPreview = (
  value: unknown,
  subset: string | undefined,
  inputVar: string = 'df'
): string => {
  if (subset) {
    const cols = subset.split(',').map(c => `"${c.trim()}"`).join(', ');
    return `${inputVar}.fillna(${formatValue(value)}, subset=[${cols}])`;
  }
  return `${inputVar}.fillna(${formatValue(value)})`;
};

export const generateRenamePreview = (
  renames: { from: string; to: string }[],
  inputVar: string = 'df'
): string => {
  if (!renames?.length) return '';

  const lines = renames
    .filter(r => r.from && r.to)
    .map(r => `.withColumnRenamed("${r.from}", "${r.to}")`);

  if (lines.length === 0) return '';

  return `${inputVar}${lines.join('\n    ')}`;
};

export const generateDropColumnsPreview = (
  columns: string,
  inputVar: string = 'df'
): string => {
  if (!columns) return '';

  const cols = columns.split(',').map(c => `"${c.trim()}"`).join(', ');
  return `${inputVar}.drop(${cols})`;
};

export const generateCachePreview = (inputVar: string = 'df'): string => {
  return `${inputVar}.cache()`;
};

export const generateRepartitionPreview = (
  numPartitions: number,
  columns?: string,
  inputVar: string = 'df'
): string => {
  if (columns) {
    const cols = columns.split(',').map(c => `"${c.trim()}"`).join(', ');
    return `${inputVar}.repartition(${numPartitions}, ${cols})`;
  }
  return `${inputVar}.repartition(${numPartitions})`;
};

export const generateCoalescePreview = (
  numPartitions: number,
  inputVar: string = 'df'
): string => {
  return `${inputVar}.coalesce(${numPartitions})`;
};
