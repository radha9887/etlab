/**
 * Preprocessing Code Generator
 * Generates PySpark code for preprocessing transforms
 */

import type { Node } from '@xyflow/react';
import type { ETLNodeData, TransformNodeData } from '../types';

// Generate code for preprocessing transforms
export const generatePreprocessingCode = (
  node: Node<ETLNodeData>,
  varName: string,
  inputVarName: string
): string[] => {
  const data = node.data as TransformNodeData;
  const config = data.config || {};
  const lines: string[] = [];

  switch (data.transformType) {
    case 'profiler':
      return generateProfilerCode(varName, inputVarName, config);

    case 'missingValue':
      return generateMissingValueCode(varName, inputVarName, config);

    case 'duplicateHandler':
      return generateDuplicateHandlerCode(varName, inputVarName, config);

    case 'typeFixer':
      return generateTypeFixerCode(varName, inputVarName, config);

    case 'stringCleaner':
      return generateStringCleanerCode(varName, inputVarName, config);

    case 'outlierHandler':
      return generateOutlierHandlerCode(varName, inputVarName, config);

    case 'dataValidator':
      return generateDataValidatorCode(varName, inputVarName, config);

    case 'formatStandardizer':
      return generateFormatStandardizerCode(varName, inputVarName, config);

    case 'scaler':
      return generateScalerCode(varName, inputVarName, config);

    case 'encoder':
      return generateEncoderCode(varName, inputVarName, config);

    case 'dateFeatures':
      return generateDateFeaturesCode(varName, inputVarName, config);

    case 'textFeatures':
      return generateTextFeaturesCode(varName, inputVarName, config);

    case 'trainTestSplit':
      return generateTrainTestSplitCode(varName, inputVarName, config);

    default:
      lines.push(`${varName} = ${inputVarName}  # Configure ${data.transformType} transformation`);
      return lines;
  }
};

// Check if a transform type is a preprocessing transform
export const isPreprocessingTransform = (transformType: string): boolean => {
  const preprocessingTypes = [
    'profiler', 'missingValue', 'duplicateHandler',
    'typeFixer', 'stringCleaner', 'outlierHandler',
    'dataValidator', 'formatStandardizer',
    'scaler', 'encoder', 'dateFeatures', 'textFeatures', 'trainTestSplit'
  ];
  return preprocessingTypes.includes(transformType);
};

// ============================================
// Data Profiler
// ============================================
const generateProfilerCode = (
  varName: string,
  inputVarName: string,
  config: Record<string, unknown>
): string[] => {
  const lines: string[] = [];
  const columns = config.columns as string[] | undefined;
  const includeStats = config.includeStats !== false;
  const includeMissing = config.includeMissing !== false;
  const includeUnique = config.includeUnique !== false;
  const includeDistribution = config.includeDistribution === true;
  const includeCorrelation = config.includeCorrelation === true;
  const sampleSize = config.sampleSize as number | undefined;

  lines.push(`# Data Profiler`);

  // Sample if needed
  if (sampleSize) {
    lines.push(`${varName}_sample = ${inputVarName}.limit(${sampleSize})`);
    lines.push(`_profile_df = ${varName}_sample`);
  } else {
    lines.push(`_profile_df = ${inputVarName}`);
  }

  // Column subset
  const colFilter = columns && columns.length > 0
    ? `[${columns.map(c => `"${c}"`).join(', ')}]`
    : '_profile_df.columns';

  lines.push(`_profile_cols = ${colFilter}`);
  lines.push(``);

  if (includeStats) {
    lines.push(`# Basic Statistics`);
    lines.push(`print("=== Basic Statistics ===")`);
    lines.push(`_profile_df.select(_profile_cols).describe().show()`);
    lines.push(``);
  }

  if (includeMissing) {
    lines.push(`# Missing Value Analysis`);
    lines.push(`print("=== Missing Values ===")`);
    lines.push(`_null_counts = _profile_df.select([`);
    lines.push(`    F.sum(F.when(F.col(c).isNull(), 1).otherwise(0)).alias(c)`);
    lines.push(`    for c in _profile_cols`);
    lines.push(`])`);
    lines.push(`_null_counts.show()`);
    lines.push(``);
  }

  if (includeUnique) {
    lines.push(`# Cardinality Analysis`);
    lines.push(`print("=== Unique Values ===")`);
    lines.push(`_unique_counts = _profile_df.select([`);
    lines.push(`    F.countDistinct(F.col(c)).alias(c)`);
    lines.push(`    for c in _profile_cols`);
    lines.push(`])`);
    lines.push(`_unique_counts.show()`);
    lines.push(``);
  }

  if (includeDistribution) {
    lines.push(`# Value Distribution (Top 10 per column)`);
    lines.push(`print("=== Value Distribution ===")`);
    lines.push(`for col_name in _profile_cols:`);
    lines.push(`    print(f"Column: {col_name}")`);
    lines.push(`    _profile_df.groupBy(col_name).count().orderBy(F.desc("count")).limit(10).show()`);
    lines.push(``);
  }

  if (includeCorrelation) {
    lines.push(`# Correlation Matrix (numeric columns only)`);
    lines.push(`print("=== Correlation Matrix ===")`);
    lines.push(`from pyspark.ml.stat import Correlation`);
    lines.push(`from pyspark.ml.feature import VectorAssembler`);
    lines.push(`_numeric_cols = [c for c in _profile_cols if str(_profile_df.schema[c].dataType) in ['IntegerType()', 'LongType()', 'FloatType()', 'DoubleType()']]`);
    lines.push(`if _numeric_cols:`);
    lines.push(`    _assembler = VectorAssembler(inputCols=_numeric_cols, outputCol="features", handleInvalid="skip")`);
    lines.push(`    _vector_df = _assembler.transform(_profile_df).select("features")`);
    lines.push(`    _corr_matrix = Correlation.corr(_vector_df, "features").head()[0]`);
    lines.push(`    print("Columns:", _numeric_cols)`);
    lines.push(`    print(_corr_matrix.toArray())`);
    lines.push(``);
  }

  // Pass through the data
  lines.push(`${varName} = ${inputVarName}  # Profiler passes data through unchanged`);

  return lines;
};

// ============================================
// Missing Value Handler
// ============================================
const generateMissingValueCode = (
  varName: string,
  inputVarName: string,
  config: Record<string, unknown>
): string[] => {
  const lines: string[] = [];
  const mode = config.mode as string || 'global';
  const globalMethod = config.globalMethod as string || 'drop';
  const globalConstant = config.globalConstant;
  const subset = config.subset as string[] | undefined;
  const columnConfigs = config.columnConfigs as Array<{
    column: string;
    method: string;
    constantValue?: string | number;
  }> | undefined;

  lines.push(`# Missing Value Handler`);

  if (mode === 'global') {
    const subsetStr = subset && subset.length > 0
      ? `, subset=[${subset.map(c => `"${c}"`).join(', ')}]`
      : '';

    switch (globalMethod) {
      case 'drop':
        lines.push(`${varName} = ${inputVarName}.dropna(how="any"${subsetStr})`);
        break;

      case 'mean':
        lines.push(`# Fill with mean values`);
        if (subset && subset.length > 0) {
          lines.push(`_cols_to_fill = [${subset.map(c => `"${c}"`).join(', ')}]`);
        } else {
          lines.push(`_cols_to_fill = [c for c in ${inputVarName}.columns if str(${inputVarName}.schema[c].dataType) in ['IntegerType()', 'LongType()', 'FloatType()', 'DoubleType()']]`);
        }
        lines.push(`_means = ${inputVarName}.select([F.mean(c).alias(c) for c in _cols_to_fill]).first().asDict()`);
        lines.push(`${varName} = ${inputVarName}.fillna(_means)`);
        break;

      case 'median':
        lines.push(`# Fill with median values`);
        if (subset && subset.length > 0) {
          lines.push(`_cols_to_fill = [${subset.map(c => `"${c}"`).join(', ')}]`);
        } else {
          lines.push(`_cols_to_fill = [c for c in ${inputVarName}.columns if str(${inputVarName}.schema[c].dataType) in ['IntegerType()', 'LongType()', 'FloatType()', 'DoubleType()']]`);
        }
        lines.push(`_medians = {c: ${inputVarName}.approxQuantile(c, [0.5], 0.01)[0] for c in _cols_to_fill}`);
        lines.push(`${varName} = ${inputVarName}.fillna(_medians)`);
        break;

      case 'mode':
        lines.push(`# Fill with mode (most frequent value)`);
        if (subset && subset.length > 0) {
          lines.push(`_cols_to_fill = [${subset.map(c => `"${c}"`).join(', ')}]`);
        } else {
          lines.push(`_cols_to_fill = ${inputVarName}.columns`);
        }
        lines.push(`_modes = {}`);
        lines.push(`for c in _cols_to_fill:`);
        lines.push(`    _mode_val = ${inputVarName}.groupBy(c).count().orderBy(F.desc("count")).first()`);
        lines.push(`    if _mode_val:`);
        lines.push(`        _modes[c] = _mode_val[0]`);
        lines.push(`${varName} = ${inputVarName}.fillna(_modes)`);
        break;

      case 'constant':
        const constVal = typeof globalConstant === 'number' ? globalConstant : `"${globalConstant}"`;
        lines.push(`${varName} = ${inputVarName}.fillna(${constVal}${subsetStr})`);
        break;

      case 'forward':
        lines.push(`# Forward fill (using Window)`);
        lines.push(`from pyspark.sql.window import Window`);
        lines.push(`_window = Window.orderBy(F.monotonically_increasing_id()).rowsBetween(Window.unboundedPreceding, 0)`);
        lines.push(`${varName} = ${inputVarName}`);
        if (subset && subset.length > 0) {
          lines.push(`_cols_to_fill = [${subset.map(c => `"${c}"`).join(', ')}]`);
        } else {
          lines.push(`_cols_to_fill = ${inputVarName}.columns`);
        }
        lines.push(`for c in _cols_to_fill:`);
        lines.push(`    ${varName} = ${varName}.withColumn(c, F.last(c, ignorenulls=True).over(_window))`);
        break;

      case 'backward':
        lines.push(`# Backward fill (using Window)`);
        lines.push(`from pyspark.sql.window import Window`);
        lines.push(`_window = Window.orderBy(F.monotonically_increasing_id()).rowsBetween(0, Window.unboundedFollowing)`);
        lines.push(`${varName} = ${inputVarName}`);
        if (subset && subset.length > 0) {
          lines.push(`_cols_to_fill = [${subset.map(c => `"${c}"`).join(', ')}]`);
        } else {
          lines.push(`_cols_to_fill = ${inputVarName}.columns`);
        }
        lines.push(`for c in _cols_to_fill:`);
        lines.push(`    ${varName} = ${varName}.withColumn(c, F.first(c, ignorenulls=True).over(_window))`);
        break;

      case 'interpolate':
        lines.push(`# Linear interpolation`);
        lines.push(`# Note: PySpark doesn't have native interpolation, using pandas UDF for simplicity`);
        lines.push(`${varName} = ${inputVarName}  # TODO: Implement interpolation with pandas_udf`);
        break;

      default:
        lines.push(`${varName} = ${inputVarName}.dropna()`);
    }
  } else if (mode === 'perColumn' && columnConfigs) {
    lines.push(`${varName} = ${inputVarName}`);

    for (const cc of columnConfigs) {
      if (!cc.column) continue;

      switch (cc.method) {
        case 'drop':
          lines.push(`${varName} = ${varName}.dropna(subset=["${cc.column}"])`);
          break;

        case 'mean':
          lines.push(`_mean_${cc.column} = ${varName}.select(F.mean("${cc.column}")).first()[0]`);
          lines.push(`${varName} = ${varName}.fillna(_mean_${cc.column}, subset=["${cc.column}"])`);
          break;

        case 'median':
          lines.push(`_median_${cc.column} = ${varName}.approxQuantile("${cc.column}", [0.5], 0.01)[0]`);
          lines.push(`${varName} = ${varName}.fillna(_median_${cc.column}, subset=["${cc.column}"])`);
          break;

        case 'mode':
          lines.push(`_mode_${cc.column} = ${varName}.groupBy("${cc.column}").count().orderBy(F.desc("count")).first()[0]`);
          lines.push(`${varName} = ${varName}.fillna(_mode_${cc.column}, subset=["${cc.column}"])`);
          break;

        case 'constant':
          const constVal = typeof cc.constantValue === 'number' ? cc.constantValue : `"${cc.constantValue}"`;
          lines.push(`${varName} = ${varName}.fillna(${constVal}, subset=["${cc.column}"])`);
          break;

        default:
          lines.push(`# Unknown method for ${cc.column}: ${cc.method}`);
      }
    }
  } else {
    lines.push(`${varName} = ${inputVarName}  # Configure missing value handling`);
  }

  return lines;
};

// ============================================
// Duplicate Handler
// ============================================
const generateDuplicateHandlerCode = (
  varName: string,
  inputVarName: string,
  config: Record<string, unknown>
): string[] => {
  const lines: string[] = [];
  const mode = config.mode as string || 'exact';
  const columns = config.columns as string[] | undefined;
  const action = config.action as string || 'drop';
  const flagColumn = config.flagColumn as string || 'is_duplicate';
  const fuzzyThreshold = config.fuzzyThreshold as number || 0.8;
  const fuzzyAlgorithm = config.fuzzyAlgorithm as string || 'levenshtein';

  lines.push(`# Duplicate Handler`);

  const colsArg = columns && columns.length > 0
    ? `[${columns.map(c => `"${c}"`).join(', ')}]`
    : null;

  if (mode === 'exact') {
    switch (action) {
      case 'drop':
      case 'keep_first':
        if (colsArg) {
          lines.push(`${varName} = ${inputVarName}.dropDuplicates(${colsArg})`);
        } else {
          lines.push(`${varName} = ${inputVarName}.dropDuplicates()`);
        }
        break;

      case 'keep_last':
        lines.push(`# Keep last occurrence`);
        lines.push(`from pyspark.sql.window import Window`);
        lines.push(`_row_num_col = "_row_num"`);
        lines.push(`${varName} = ${inputVarName}.withColumn(_row_num_col, F.monotonically_increasing_id())`);
        if (colsArg) {
          lines.push(`_window = Window.partitionBy(${colsArg}).orderBy(F.desc(_row_num_col))`);
        } else {
          lines.push(`_window = Window.partitionBy(${inputVarName}.columns).orderBy(F.desc(_row_num_col))`);
        }
        lines.push(`${varName} = ${varName}.withColumn("_rank", F.row_number().over(_window))`);
        lines.push(`${varName} = ${varName}.filter(F.col("_rank") == 1).drop("_rank", _row_num_col)`);
        break;

      case 'flag':
        lines.push(`# Flag duplicates`);
        lines.push(`from pyspark.sql.window import Window`);
        if (colsArg) {
          lines.push(`_window = Window.partitionBy(${colsArg}).orderBy(F.monotonically_increasing_id())`);
        } else {
          lines.push(`_window = Window.partitionBy(${inputVarName}.columns).orderBy(F.monotonically_increasing_id())`);
        }
        lines.push(`${varName} = ${inputVarName}.withColumn("_rank", F.row_number().over(_window))`);
        lines.push(`${varName} = ${varName}.withColumn("${flagColumn}", F.when(F.col("_rank") > 1, True).otherwise(False)).drop("_rank")`);
        break;

      default:
        lines.push(`${varName} = ${inputVarName}.dropDuplicates()`);
    }
  } else if (mode === 'fuzzy') {
    lines.push(`# Fuzzy duplicate detection`);
    lines.push(`# Note: This is computationally expensive for large datasets`);
    lines.push(`from pyspark.sql.functions import udf`);
    lines.push(`from pyspark.sql.types import DoubleType, BooleanType`);
    lines.push(``);

    if (fuzzyAlgorithm === 'levenshtein') {
      lines.push(`# Levenshtein distance based similarity`);
      lines.push(`def levenshtein_similarity(s1, s2):`);
      lines.push(`    if s1 is None or s2 is None:`);
      lines.push(`        return 0.0`);
      lines.push(`    from difflib import SequenceMatcher`);
      lines.push(`    return SequenceMatcher(None, str(s1), str(s2)).ratio()`);
      lines.push(`levenshtein_udf = udf(levenshtein_similarity, DoubleType())`);
    } else if (fuzzyAlgorithm === 'soundex') {
      lines.push(`# Soundex phonetic matching`);
      lines.push(`${varName} = ${inputVarName}  # TODO: Implement Soundex matching`);
    } else if (fuzzyAlgorithm === 'jaccard') {
      lines.push(`# Jaccard similarity`);
      lines.push(`def jaccard_similarity(s1, s2):`);
      lines.push(`    if s1 is None or s2 is None:`);
      lines.push(`        return 0.0`);
      lines.push(`    set1, set2 = set(str(s1).lower().split()), set(str(s2).lower().split())`);
      lines.push(`    intersection = len(set1 & set2)`);
      lines.push(`    union = len(set1 | set2)`);
      lines.push(`    return intersection / union if union > 0 else 0.0`);
      lines.push(`jaccard_udf = udf(jaccard_similarity, DoubleType())`);
    }

    lines.push(``);
    lines.push(`# Fuzzy matching requires self-join which is expensive`);
    lines.push(`# Consider using approximate methods or sampling for large datasets`);
    lines.push(`${varName} = ${inputVarName}  # Fuzzy matching placeholder - implement based on specific needs`);
    lines.push(`# Threshold: ${fuzzyThreshold}`);
  } else {
    lines.push(`${varName} = ${inputVarName}  # Configure duplicate handling`);
  }

  return lines;
};

// ============================================
// Type Fixer (Placeholder)
// ============================================
const generateTypeFixerCode = (
  varName: string,
  inputVarName: string,
  config: Record<string, unknown>
): string[] => {
  const lines: string[] = [];
  const columnConfigs = config.columnConfigs as Array<{
    column: string;
    targetType: string;
    dateFormat?: string;
    nullOnError?: boolean;
  }> | undefined;

  lines.push(`# Type Fixer`);

  if (columnConfigs && columnConfigs.length > 0) {
    lines.push(`${varName} = ${inputVarName}`);

    for (const cc of columnConfigs) {
      // Note: nullOnError can be used for try_cast in future Spark versions
      // const nullOnError = cc.nullOnError !== false;

      if (cc.targetType === 'date' && cc.dateFormat) {
        lines.push(`${varName} = ${varName}.withColumn("${cc.column}", F.to_date(F.col("${cc.column}"), "${cc.dateFormat}"))`);
      } else if (cc.targetType === 'timestamp' && cc.dateFormat) {
        lines.push(`${varName} = ${varName}.withColumn("${cc.column}", F.to_timestamp(F.col("${cc.column}"), "${cc.dateFormat}"))`);
      } else {
        lines.push(`${varName} = ${varName}.withColumn("${cc.column}", F.col("${cc.column}").cast("${cc.targetType}"))`);
      }
    }
  } else {
    lines.push(`${varName} = ${inputVarName}  # Configure type conversions`);
  }

  return lines;
};

// ============================================
// String Cleaner (Placeholder)
// ============================================
const generateStringCleanerCode = (
  varName: string,
  inputVarName: string,
  config: Record<string, unknown>
): string[] => {
  const lines: string[] = [];
  const columns = config.columns as string[] | undefined;
  const operations = config.operations as string[] | undefined;
  const regexPattern = config.regexPattern as string | undefined;
  const regexReplacement = config.regexReplacement as string || '';

  lines.push(`# String Cleaner`);

  if (columns && columns.length > 0 && operations && operations.length > 0) {
    lines.push(`${varName} = ${inputVarName}`);

    for (const col of columns) {
      for (const op of operations) {
        switch (op) {
          case 'trim':
            lines.push(`${varName} = ${varName}.withColumn("${col}", F.trim(F.col("${col}")))`);
            break;
          case 'lower':
            lines.push(`${varName} = ${varName}.withColumn("${col}", F.lower(F.col("${col}")))`);
            break;
          case 'upper':
            lines.push(`${varName} = ${varName}.withColumn("${col}", F.upper(F.col("${col}")))`);
            break;
          case 'title':
            lines.push(`${varName} = ${varName}.withColumn("${col}", F.initcap(F.col("${col}")))`);
            break;
          case 'removeWhitespace':
            lines.push(`${varName} = ${varName}.withColumn("${col}", F.regexp_replace(F.col("${col}"), r"\\s+", " "))`);
            break;
          case 'removeNonAlpha':
            lines.push(`${varName} = ${varName}.withColumn("${col}", F.regexp_replace(F.col("${col}"), r"[^a-zA-Z\\s]", ""))`);
            break;
          case 'removeNonNumeric':
            lines.push(`${varName} = ${varName}.withColumn("${col}", F.regexp_replace(F.col("${col}"), r"[^0-9]", ""))`);
            break;
          case 'removeSpecialChars':
            lines.push(`${varName} = ${varName}.withColumn("${col}", F.regexp_replace(F.col("${col}"), r"[^a-zA-Z0-9\\s]", ""))`);
            break;
          case 'regex':
            if (regexPattern) {
              lines.push(`${varName} = ${varName}.withColumn("${col}", F.regexp_replace(F.col("${col}"), r"${regexPattern}", "${regexReplacement}"))`);
            }
            break;
        }
      }
    }
  } else {
    lines.push(`${varName} = ${inputVarName}  # Configure string cleaning`);
  }

  return lines;
};

// ============================================
// Outlier Handler
// ============================================
const generateOutlierHandlerCode = (
  varName: string,
  inputVarName: string,
  config: Record<string, unknown>
): string[] => {
  const lines: string[] = [];
  const mode = config.mode as string || 'global';
  const globalMethod = config.globalMethod as string || 'iqr';
  const globalThreshold = config.globalThreshold as number || 1.5;
  const globalAction = config.globalAction as string || 'cap';
  const flagColumn = config.flagColumn as string || 'is_outlier';
  const columnConfigs = config.columnConfigs as Array<{
    column: string;
    method: string;
    threshold: number;
    action: string;
    capMin?: number;
    capMax?: number;
  }> | undefined;

  lines.push(`# Outlier Handler`);
  lines.push(`${varName} = ${inputVarName}`);

  const generateOutlierLogic = (
    column: string,
    method: string,
    threshold: number,
    action: string,
    capMin?: number,
    capMax?: number
  ) => {
    const result: string[] = [];
    const lowerBound = `_${column}_lower`;
    const upperBound = `_${column}_upper`;

    // Calculate bounds based on method
    switch (method) {
      case 'iqr':
        result.push(``);
        result.push(`# IQR method for ${column}`);
        result.push(`_quantiles_${column} = ${varName}.approxQuantile("${column}", [0.25, 0.75], 0.01)`);
        result.push(`_q1_${column}, _q3_${column} = _quantiles_${column}[0], _quantiles_${column}[1]`);
        result.push(`_iqr_${column} = _q3_${column} - _q1_${column}`);
        result.push(`${lowerBound} = _q1_${column} - ${threshold} * _iqr_${column}`);
        result.push(`${upperBound} = _q3_${column} + ${threshold} * _iqr_${column}`);
        break;

      case 'zscore':
        result.push(``);
        result.push(`# Z-score method for ${column}`);
        result.push(`_stats_${column} = ${varName}.select(F.mean("${column}").alias("mean"), F.stddev("${column}").alias("std")).collect()[0]`);
        result.push(`_mean_${column}, _std_${column} = _stats_${column}["mean"], _stats_${column}["std"]`);
        result.push(`${lowerBound} = _mean_${column} - ${threshold} * _std_${column}`);
        result.push(`${upperBound} = _mean_${column} + ${threshold} * _std_${column}`);
        break;

      case 'percentile':
        result.push(``);
        result.push(`# Percentile method for ${column}`);
        const lowerPct = threshold / 100;
        const upperPct = 1 - threshold / 100;
        result.push(`_percentiles_${column} = ${varName}.approxQuantile("${column}", [${lowerPct}, ${upperPct}], 0.01)`);
        result.push(`${lowerBound} = _percentiles_${column}[0]`);
        result.push(`${upperBound} = _percentiles_${column}[1]`);
        break;

      case 'mad':
        result.push(``);
        result.push(`# MAD (Median Absolute Deviation) method for ${column}`);
        result.push(`_median_${column} = ${varName}.approxQuantile("${column}", [0.5], 0.01)[0]`);
        result.push(`_mad_${column} = ${varName}.select(F.median(F.abs(F.col("${column}") - _median_${column}))).collect()[0][0]`);
        result.push(`${lowerBound} = _median_${column} - ${threshold} * _mad_${column}`);
        result.push(`${upperBound} = _median_${column} + ${threshold} * _mad_${column}`);
        break;

      default:
        result.push(`# Unknown method: ${method}`);
        return result;
    }

    // Apply action
    const outlierCondition = `(F.col("${column}") < ${lowerBound}) | (F.col("${column}") > ${upperBound})`;

    switch (action) {
      case 'remove':
        result.push(`# Remove outliers`);
        result.push(`${varName} = ${varName}.filter(~(${outlierCondition}))`);
        break;

      case 'cap':
        result.push(`# Cap/Winsorize outliers`);
        if (capMin !== undefined && capMax !== undefined) {
          result.push(`${varName} = ${varName}.withColumn("${column}", F.when(F.col("${column}") < ${capMin}, ${capMin}).when(F.col("${column}") > ${capMax}, ${capMax}).otherwise(F.col("${column}")))`);
        } else {
          result.push(`${varName} = ${varName}.withColumn("${column}", F.when(F.col("${column}") < ${lowerBound}, ${lowerBound}).when(F.col("${column}") > ${upperBound}, ${upperBound}).otherwise(F.col("${column}")))`);
        }
        break;

      case 'null':
        result.push(`# Set outliers to NULL`);
        result.push(`${varName} = ${varName}.withColumn("${column}", F.when(${outlierCondition}, None).otherwise(F.col("${column}")))`);
        break;

      case 'flag':
        result.push(`# Flag outliers`);
        result.push(`${varName} = ${varName}.withColumn("${flagColumn}_${column}", F.when(${outlierCondition}, True).otherwise(False))`);
        break;
    }

    return result;
  };

  if (mode === 'global') {
    // Apply to all numeric columns with global settings
    lines.push(`# Apply global outlier detection to all numeric columns`);
    lines.push(`_numeric_cols = [f.name for f in ${varName}.schema.fields if str(f.dataType) in ['IntegerType()', 'LongType()', 'FloatType()', 'DoubleType()', 'DecimalType()']]`);
    lines.push(`for _col in _numeric_cols:`);
    lines.push(`    # Note: In production, extract this logic to a function`);
    lines.push(`    pass  # Apply outlier detection per column`);
    lines.push(``);
    lines.push(`# Example for single column (customize as needed):`);
    lines.push(`# ${generateOutlierLogic('column_name', globalMethod, globalThreshold, globalAction).join('\n# ')}`);
  } else if (mode === 'perColumn' && columnConfigs && columnConfigs.length > 0) {
    for (const cc of columnConfigs) {
      if (!cc.column) continue;
      const colLines = generateOutlierLogic(
        cc.column,
        cc.method,
        cc.threshold,
        cc.action,
        cc.capMin,
        cc.capMax
      );
      lines.push(...colLines);
    }
  }

  return lines;
};

// ============================================
// Data Validator
// ============================================
const generateDataValidatorCode = (
  varName: string,
  inputVarName: string,
  config: Record<string, unknown>
): string[] => {
  const lines: string[] = [];
  const rules = config.rules as Array<{
    id: string;
    column: string;
    ruleType: string;
    params?: {
      min?: number;
      max?: number;
      pattern?: string;
      values?: string[];
      expression?: string;
    };
    errorMessage?: string;
  }> | undefined;
  const failAction = config.failAction as string || 'flag';
  const flagColumn = config.flagColumn as string || 'validation_errors';
  const stopOnFirstError = config.stopOnFirstError === true;

  lines.push(`# Data Validator`);
  lines.push(`${varName} = ${inputVarName}`);

  if (!rules || rules.length === 0) {
    lines.push(`# No validation rules configured`);
    return lines;
  }

  lines.push(`from pyspark.sql.types import ArrayType, StringType`);
  lines.push(``);

  // Generate validation conditions for each rule
  const validationConditions: string[] = [];

  for (const rule of rules) {
    if (!rule.column || !rule.ruleType) continue;

    const errorMsg = rule.errorMessage || `${rule.column} failed ${rule.ruleType} validation`;
    let condition = '';

    switch (rule.ruleType) {
      case 'notNull':
        condition = `F.col("${rule.column}").isNull()`;
        break;

      case 'unique':
        // Unique requires window function
        lines.push(`# Unique validation for ${rule.column}`);
        lines.push(`from pyspark.sql.window import Window`);
        lines.push(`_dup_window_${rule.column} = Window.partitionBy("${rule.column}")`);
        lines.push(`${varName} = ${varName}.withColumn("_dup_count_${rule.column}", F.count("*").over(_dup_window_${rule.column}))`);
        condition = `F.col("_dup_count_${rule.column}") > 1`;
        break;

      case 'range':
        const minVal = rule.params?.min;
        const maxVal = rule.params?.max;
        const rangeConds: string[] = [];
        if (minVal !== undefined) {
          rangeConds.push(`F.col("${rule.column}") < ${minVal}`);
        }
        if (maxVal !== undefined) {
          rangeConds.push(`F.col("${rule.column}") > ${maxVal}`);
        }
        condition = rangeConds.length > 0 ? `(${rangeConds.join(' | ')})` : 'F.lit(False)';
        break;

      case 'pattern':
        const pattern = rule.params?.pattern || '.*';
        condition = `~F.col("${rule.column}").rlike(r"${pattern}")`;
        break;

      case 'inList':
        const values = rule.params?.values || [];
        const valuesStr = values.map(v => `"${v}"`).join(', ');
        condition = `~F.col("${rule.column}").isin([${valuesStr}])`;
        break;

      case 'custom':
        const expression = rule.params?.expression || 'True';
        condition = `~(${expression})`;
        break;

      default:
        continue;
    }

    validationConditions.push({
      condition,
      errorMsg,
      column: rule.column,
      ruleType: rule.ruleType,
    } as unknown as string);
  }

  lines.push(``);

  // Apply validation based on fail action
  if (failAction === 'flag') {
    lines.push(`# Flag validation failures`);
    lines.push(`_validation_errors = F.array()`);

    for (const vc of validationConditions) {
      const { condition, errorMsg } = vc as unknown as { condition: string; errorMsg: string };
      lines.push(`_validation_errors = F.when(${condition}, F.concat(_validation_errors, F.array(F.lit("${errorMsg}")))).otherwise(_validation_errors)`);
    }

    lines.push(`${varName} = ${varName}.withColumn("${flagColumn}", _validation_errors)`);

    // Clean up temp columns
    lines.push(`# Clean up temporary columns`);
    lines.push(`_temp_cols = [c for c in ${varName}.columns if c.startswith("_dup_count_")]`);
    lines.push(`for _col in _temp_cols:`);
    lines.push(`    ${varName} = ${varName}.drop(_col)`);

  } else if (failAction === 'reject') {
    lines.push(`# Reject rows that fail validation`);
    const allConditions = validationConditions.map((vc: unknown) => (vc as { condition: string }).condition);

    if (stopOnFirstError) {
      // Reject on first error
      lines.push(`_is_valid = ~(${allConditions[0] || 'F.lit(False)'})`);
    } else {
      // Reject if any validation fails
      lines.push(`_is_valid = ~(${allConditions.join(' | ') || 'F.lit(False)'})`);
    }
    lines.push(`${varName} = ${varName}.filter(_is_valid)`);

    // Clean up temp columns
    lines.push(`_temp_cols = [c for c in ${varName}.columns if c.startswith("_dup_count_")]`);
    lines.push(`for _col in _temp_cols:`);
    lines.push(`    ${varName} = ${varName}.drop(_col)`);

  } else if (failAction === 'log') {
    lines.push(`# Log validation failures (rows are kept)`);
    lines.push(`_validation_errors = F.array()`);

    for (const vc of validationConditions) {
      const { condition, errorMsg } = vc as unknown as { condition: string; errorMsg: string };
      lines.push(`_validation_errors = F.when(${condition}, F.concat(_validation_errors, F.array(F.lit("${errorMsg}")))).otherwise(_validation_errors)`);
    }

    lines.push(`# Log errors (print count)`);
    lines.push(`_error_count = ${varName}.withColumn("_errors", _validation_errors).filter(F.size(F.col("_errors")) > 0).count()`);
    lines.push(`print(f"Validation errors found in {_error_count} rows")`);
  }

  return lines;
};

// ============================================
// Format Standardizer
// ============================================
const generateFormatStandardizerCode = (
  varName: string,
  inputVarName: string,
  config: Record<string, unknown>
): string[] => {
  const lines: string[] = [];
  const columns = config.columns as Array<{
    column: string;
    formatType: string;
    targetFormat?: string;
    countryCode?: string;
  }> | undefined;

  lines.push(`# Format Standardizer`);

  if (columns && columns.length > 0) {
    lines.push(`${varName} = ${inputVarName}`);

    for (const cc of columns) {
      if (!cc.column || !cc.formatType) continue;

      switch (cc.formatType) {
        case 'phone':
          lines.push(``);
          lines.push(`# Standardize phone number: ${cc.column}`);
          const phoneFormat = cc.targetFormat || 'E164';
          const countryCode = cc.countryCode || 'US';

          if (phoneFormat === 'DIGITS_ONLY') {
            lines.push(`${varName} = ${varName}.withColumn("${cc.column}", F.regexp_replace(F.col("${cc.column}"), r"[^0-9]", ""))`);
          } else if (phoneFormat === 'E164') {
            lines.push(`# Remove non-digits and format as E.164`);
            lines.push(`${varName} = ${varName}.withColumn("${cc.column}", F.regexp_replace(F.col("${cc.column}"), r"[^0-9]", ""))`);
            lines.push(`${varName} = ${varName}.withColumn("${cc.column}",`);
            lines.push(`    F.when(F.length(F.col("${cc.column}")) == 10, F.concat(F.lit("+1"), F.col("${cc.column}")))`);
            lines.push(`    .otherwise(F.concat(F.lit("+"), F.col("${cc.column}"))))`);
          } else if (phoneFormat === 'NATIONAL') {
            lines.push(`# Format as national: (XXX) XXX-XXXX`);
            lines.push(`${varName} = ${varName}.withColumn("_phone_digits", F.regexp_replace(F.col("${cc.column}"), r"[^0-9]", ""))`);
            lines.push(`${varName} = ${varName}.withColumn("_phone_digits", F.expr("right(_phone_digits, 10)"))`);
            lines.push(`${varName} = ${varName}.withColumn("${cc.column}",`);
            lines.push(`    F.concat(F.lit("("), F.expr("substring(_phone_digits, 1, 3)"), F.lit(") "),`);
            lines.push(`            F.expr("substring(_phone_digits, 4, 3)"), F.lit("-"), F.expr("substring(_phone_digits, 7, 4)")))`);
            lines.push(`${varName} = ${varName}.drop("_phone_digits")`);
          } else if (phoneFormat === 'INTERNATIONAL') {
            const countryPrefix = countryCode === 'US' || countryCode === 'CA' ? '+1' :
                                  countryCode === 'UK' ? '+44' :
                                  countryCode === 'AU' ? '+61' :
                                  countryCode === 'IN' ? '+91' : '+1';
            lines.push(`# Format as international: ${countryPrefix} XXX-XXX-XXXX`);
            lines.push(`${varName} = ${varName}.withColumn("_phone_digits", F.regexp_replace(F.col("${cc.column}"), r"[^0-9]", ""))`);
            lines.push(`${varName} = ${varName}.withColumn("_phone_digits", F.expr("right(_phone_digits, 10)"))`);
            lines.push(`${varName} = ${varName}.withColumn("${cc.column}",`);
            lines.push(`    F.concat(F.lit("${countryPrefix} "), F.expr("substring(_phone_digits, 1, 3)"), F.lit("-"),`);
            lines.push(`            F.expr("substring(_phone_digits, 4, 3)"), F.lit("-"), F.expr("substring(_phone_digits, 7, 4)")))`);
            lines.push(`${varName} = ${varName}.drop("_phone_digits")`);
          }
          break;

        case 'email':
          lines.push(``);
          lines.push(`# Standardize email: ${cc.column} (lowercase)`);
          lines.push(`${varName} = ${varName}.withColumn("${cc.column}", F.lower(F.trim(F.col("${cc.column}"))))`);
          break;

        case 'date':
          lines.push(``);
          lines.push(`# Standardize date format: ${cc.column}`);
          const dateFormat = cc.targetFormat || 'yyyy-MM-dd';
          lines.push(`# Parse common date formats and convert to: ${dateFormat}`);
          lines.push(`${varName} = ${varName}.withColumn("${cc.column}",`);
          lines.push(`    F.coalesce(`);
          lines.push(`        F.to_date(F.col("${cc.column}"), "yyyy-MM-dd"),`);
          lines.push(`        F.to_date(F.col("${cc.column}"), "MM/dd/yyyy"),`);
          lines.push(`        F.to_date(F.col("${cc.column}"), "dd/MM/yyyy"),`);
          lines.push(`        F.to_date(F.col("${cc.column}"), "yyyyMMdd"),`);
          lines.push(`        F.to_date(F.col("${cc.column}"), "MMM dd, yyyy")`);
          lines.push(`    ))`);
          if (dateFormat !== 'yyyy-MM-dd') {
            lines.push(`${varName} = ${varName}.withColumn("${cc.column}", F.date_format(F.col("${cc.column}"), "${dateFormat}"))`);
          }
          break;

        case 'currency':
          lines.push(``);
          lines.push(`# Standardize currency: ${cc.column} (remove symbols, keep numeric)`);
          lines.push(`${varName} = ${varName}.withColumn("${cc.column}",`);
          lines.push(`    F.regexp_replace(F.col("${cc.column}"), r"[\\$€£¥,\\s]", "").cast("double"))`);
          break;

        case 'address':
          lines.push(``);
          lines.push(`# Standardize address: ${cc.column}`);
          lines.push(`${varName} = ${varName}.withColumn("${cc.column}", F.trim(F.col("${cc.column}")))`);
          lines.push(`# Common abbreviation expansions`);
          lines.push(`${varName} = ${varName}.withColumn("${cc.column}", F.regexp_replace(F.col("${cc.column}"), r"(?i)\\bst\\.?\\b", "Street"))`);
          lines.push(`${varName} = ${varName}.withColumn("${cc.column}", F.regexp_replace(F.col("${cc.column}"), r"(?i)\\bave\\.?\\b", "Avenue"))`);
          lines.push(`${varName} = ${varName}.withColumn("${cc.column}", F.regexp_replace(F.col("${cc.column}"), r"(?i)\\bblvd\\.?\\b", "Boulevard"))`);
          lines.push(`${varName} = ${varName}.withColumn("${cc.column}", F.regexp_replace(F.col("${cc.column}"), r"(?i)\\bdr\\.?\\b", "Drive"))`);
          lines.push(`${varName} = ${varName}.withColumn("${cc.column}", F.regexp_replace(F.col("${cc.column}"), r"(?i)\\bln\\.?\\b", "Lane"))`);
          lines.push(`${varName} = ${varName}.withColumn("${cc.column}", F.regexp_replace(F.col("${cc.column}"), r"(?i)\\brd\\.?\\b", "Road"))`);
          lines.push(`${varName} = ${varName}.withColumn("${cc.column}", F.regexp_replace(F.col("${cc.column}"), r"(?i)\\bapt\\.?\\b", "Apartment"))`);
          break;

        case 'ssn':
          lines.push(``);
          lines.push(`# Standardize SSN: ${cc.column} (format: XXX-XX-XXXX)`);
          lines.push(`${varName} = ${varName}.withColumn("_ssn_digits", F.regexp_replace(F.col("${cc.column}"), r"[^0-9]", ""))`);
          lines.push(`${varName} = ${varName}.withColumn("${cc.column}",`);
          lines.push(`    F.concat(F.expr("substring(_ssn_digits, 1, 3)"), F.lit("-"),`);
          lines.push(`            F.expr("substring(_ssn_digits, 4, 2)"), F.lit("-"),`);
          lines.push(`            F.expr("substring(_ssn_digits, 6, 4)")))`);
          lines.push(`${varName} = ${varName}.drop("_ssn_digits")`);
          break;

        default:
          lines.push(`# Unknown format type: ${cc.formatType} for column ${cc.column}`);
      }
    }
  } else {
    lines.push(`${varName} = ${inputVarName}  # Configure format standardization`);
  }

  return lines;
};

// ============================================
// Scaler (Placeholder)
// ============================================
const generateScalerCode = (
  varName: string,
  inputVarName: string,
  _config: Record<string, unknown>
): string[] => {
  const lines: string[] = [];
  lines.push(`# Scaler`);
  lines.push(`${varName} = ${inputVarName}  # Configure numeric scaling`);
  return lines;
};

// ============================================
// Encoder (Placeholder)
// ============================================
const generateEncoderCode = (
  varName: string,
  inputVarName: string,
  _config: Record<string, unknown>
): string[] => {
  const lines: string[] = [];
  lines.push(`# Encoder`);
  lines.push(`${varName} = ${inputVarName}  # Configure categorical encoding`);
  return lines;
};

// ============================================
// Date Features (Placeholder)
// ============================================
const generateDateFeaturesCode = (
  varName: string,
  inputVarName: string,
  _config: Record<string, unknown>
): string[] => {
  const lines: string[] = [];
  lines.push(`# Date Features`);
  lines.push(`${varName} = ${inputVarName}  # Configure date feature extraction`);
  return lines;
};

// ============================================
// Text Features (Placeholder)
// ============================================
const generateTextFeaturesCode = (
  varName: string,
  inputVarName: string,
  _config: Record<string, unknown>
): string[] => {
  const lines: string[] = [];
  lines.push(`# Text Features`);
  lines.push(`${varName} = ${inputVarName}  # Configure text feature extraction`);
  return lines;
};

// ============================================
// Train/Test Split (Placeholder)
// ============================================
const generateTrainTestSplitCode = (
  varName: string,
  inputVarName: string,
  _config: Record<string, unknown>
): string[] => {
  const lines: string[] = [];
  lines.push(`# Train/Test Split`);
  lines.push(`${varName} = ${inputVarName}  # Configure train/test split`);
  return lines;
};
