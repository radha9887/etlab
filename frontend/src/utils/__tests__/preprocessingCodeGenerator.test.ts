/**
 * Tests for Preprocessing Code Generator
 */
import { describe, it, expect } from 'vitest'
import type { Node } from '@xyflow/react'
import type { TransformNodeData, ETLNodeData } from '../../types'
import {
  generatePreprocessingCode,
  isPreprocessingTransform,
} from '../preprocessingCodeGenerator'

// Helper to create transform node
const createTransformNode = (
  transformType: string,
  config: Record<string, unknown> = {}
): Node<ETLNodeData> => ({
  id: 'node-1',
  type: 'transform',
  position: { x: 0, y: 0 },
  data: {
    label: `Test ${transformType}`,
    category: 'transform',
    transformType,
    config,
  } as TransformNodeData,
})

describe('Preprocessing Code Generator', () => {
  describe('isPreprocessingTransform', () => {
    it('identifies profiler as preprocessing', () => {
      expect(isPreprocessingTransform('profiler')).toBe(true)
    })

    it('identifies missingValue as preprocessing', () => {
      expect(isPreprocessingTransform('missingValue')).toBe(true)
    })

    it('identifies duplicateHandler as preprocessing', () => {
      expect(isPreprocessingTransform('duplicateHandler')).toBe(true)
    })

    it('identifies typeFixer as preprocessing', () => {
      expect(isPreprocessingTransform('typeFixer')).toBe(true)
    })

    it('identifies stringCleaner as preprocessing', () => {
      expect(isPreprocessingTransform('stringCleaner')).toBe(true)
    })

    it('identifies outlierHandler as preprocessing', () => {
      expect(isPreprocessingTransform('outlierHandler')).toBe(true)
    })

    it('identifies dataValidator as preprocessing', () => {
      expect(isPreprocessingTransform('dataValidator')).toBe(true)
    })

    it('identifies formatStandardizer as preprocessing', () => {
      expect(isPreprocessingTransform('formatStandardizer')).toBe(true)
    })

    it('identifies scaler as preprocessing', () => {
      expect(isPreprocessingTransform('scaler')).toBe(true)
    })

    it('identifies encoder as preprocessing', () => {
      expect(isPreprocessingTransform('encoder')).toBe(true)
    })

    it('identifies dateFeatures as preprocessing', () => {
      expect(isPreprocessingTransform('dateFeatures')).toBe(true)
    })

    it('identifies textFeatures as preprocessing', () => {
      expect(isPreprocessingTransform('textFeatures')).toBe(true)
    })

    it('identifies trainTestSplit as preprocessing', () => {
      expect(isPreprocessingTransform('trainTestSplit')).toBe(true)
    })

    it('returns false for non-preprocessing transforms', () => {
      expect(isPreprocessingTransform('filter')).toBe(false)
      expect(isPreprocessingTransform('select')).toBe(false)
      expect(isPreprocessingTransform('join')).toBe(false)
      expect(isPreprocessingTransform('groupBy')).toBe(false)
    })
  })

  describe('generatePreprocessingCode - profiler', () => {
    it('generates basic profiler code', () => {
      const node = createTransformNode('profiler', {})
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Data Profiler')
      expect(code.join('\n')).toContain('_profile_df = df_in')
      expect(code.join('\n')).toContain('df_out = df_in')
    })

    it('generates profiler with sample size', () => {
      const node = createTransformNode('profiler', { sampleSize: 1000 })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('df_out_sample = df_in.limit(1000)')
      expect(code.join('\n')).toContain('_profile_df = df_out_sample')
    })

    it('generates profiler with specific columns', () => {
      const node = createTransformNode('profiler', {
        columns: ['col1', 'col2'],
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('_profile_cols = ["col1", "col2"]')
    })

    it('includes basic statistics by default', () => {
      const node = createTransformNode('profiler', {})
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Basic Statistics')
      expect(code.join('\n')).toContain('.describe().show()')
    })

    it('includes missing value analysis by default', () => {
      const node = createTransformNode('profiler', {})
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Missing Value Analysis')
      expect(code.join('\n')).toContain('_null_counts')
    })

    it('includes correlation analysis when enabled', () => {
      const node = createTransformNode('profiler', {
        includeCorrelation: true,
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Correlation Matrix')
      expect(code.join('\n')).toContain('from pyspark.ml.stat import Correlation')
    })

    it('includes distribution analysis when enabled', () => {
      const node = createTransformNode('profiler', {
        includeDistribution: true,
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Value Distribution')
    })
  })

  describe('generatePreprocessingCode - missingValue', () => {
    it('generates drop method code', () => {
      const node = createTransformNode('missingValue', {
        mode: 'global',
        globalMethod: 'drop',
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('df_out = df_in.dropna(how="any")')
    })

    it('generates drop with subset', () => {
      const node = createTransformNode('missingValue', {
        mode: 'global',
        globalMethod: 'drop',
        subset: ['col1', 'col2'],
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('subset=["col1", "col2"]')
    })

    it('generates mean fill code', () => {
      const node = createTransformNode('missingValue', {
        mode: 'global',
        globalMethod: 'mean',
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Fill with mean values')
      expect(code.join('\n')).toContain('F.mean(c)')
      expect(code.join('\n')).toContain('.fillna(_means)')
    })

    it('generates median fill code', () => {
      const node = createTransformNode('missingValue', {
        mode: 'global',
        globalMethod: 'median',
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Fill with median values')
      expect(code.join('\n')).toContain('approxQuantile')
    })

    it('generates mode fill code', () => {
      const node = createTransformNode('missingValue', {
        mode: 'global',
        globalMethod: 'mode',
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Fill with mode')
      expect(code.join('\n')).toContain('groupBy(c).count()')
    })

    it('generates constant fill code', () => {
      const node = createTransformNode('missingValue', {
        mode: 'global',
        globalMethod: 'constant',
        globalConstant: 'N/A',
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('.fillna("N/A")')
    })

    it('generates forward fill code', () => {
      const node = createTransformNode('missingValue', {
        mode: 'global',
        globalMethod: 'forward',
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Forward fill')
      expect(code.join('\n')).toContain('from pyspark.sql.window import Window')
    })

    it('generates backward fill code', () => {
      const node = createTransformNode('missingValue', {
        mode: 'global',
        globalMethod: 'backward',
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Backward fill')
    })

    it('generates per-column missing value handling', () => {
      const node = createTransformNode('missingValue', {
        mode: 'perColumn',
        columnConfigs: [
          { column: 'age', method: 'mean' },
          { column: 'name', method: 'constant', constantValue: 'Unknown' },
        ],
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('_mean_age')
      expect(code.join('\n')).toContain('.fillna("Unknown"')
    })
  })

  describe('generatePreprocessingCode - duplicateHandler', () => {
    it('generates exact duplicate drop code', () => {
      const node = createTransformNode('duplicateHandler', {
        mode: 'exact',
        action: 'drop',
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('.dropDuplicates()')
    })

    it('generates duplicate drop with columns', () => {
      const node = createTransformNode('duplicateHandler', {
        mode: 'exact',
        action: 'drop',
        columns: ['id', 'email'],
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('.dropDuplicates(["id", "email"])')
    })

    it('generates keep last code', () => {
      const node = createTransformNode('duplicateHandler', {
        mode: 'exact',
        action: 'keep_last',
        columns: ['id'],
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Keep last occurrence')
      expect(code.join('\n')).toContain('orderBy(F.desc(_row_num_col))')
    })

    it('generates flag duplicates code', () => {
      const node = createTransformNode('duplicateHandler', {
        mode: 'exact',
        action: 'flag',
        flagColumn: 'is_dup',
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Flag duplicates')
      expect(code.join('\n')).toContain('"is_dup"')
    })

    it('generates fuzzy duplicate detection code', () => {
      const node = createTransformNode('duplicateHandler', {
        mode: 'fuzzy',
        fuzzyAlgorithm: 'levenshtein',
        fuzzyThreshold: 0.9,
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Fuzzy duplicate detection')
      expect(code.join('\n')).toContain('Levenshtein')
    })

    it('generates jaccard similarity code', () => {
      const node = createTransformNode('duplicateHandler', {
        mode: 'fuzzy',
        fuzzyAlgorithm: 'jaccard',
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Jaccard similarity')
    })
  })

  describe('generatePreprocessingCode - typeFixer', () => {
    it('generates basic type cast code', () => {
      const node = createTransformNode('typeFixer', {
        columnConfigs: [{ column: 'price', targetType: 'double' }],
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('.cast("double")')
    })

    it('generates date conversion with format', () => {
      const node = createTransformNode('typeFixer', {
        columnConfigs: [
          { column: 'created_at', targetType: 'date', dateFormat: 'yyyy-MM-dd' },
        ],
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('F.to_date')
      expect(code.join('\n')).toContain('yyyy-MM-dd')
    })

    it('generates timestamp conversion with format', () => {
      const node = createTransformNode('typeFixer', {
        columnConfigs: [
          {
            column: 'updated_at',
            targetType: 'timestamp',
            dateFormat: 'yyyy-MM-dd HH:mm:ss',
          },
        ],
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('F.to_timestamp')
    })

    it('generates multiple type conversions', () => {
      const node = createTransformNode('typeFixer', {
        columnConfigs: [
          { column: 'amount', targetType: 'double' },
          { column: 'count', targetType: 'integer' },
        ],
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('.cast("double")')
      expect(code.join('\n')).toContain('.cast("integer")')
    })
  })

  describe('generatePreprocessingCode - stringCleaner', () => {
    it('generates trim operation', () => {
      const node = createTransformNode('stringCleaner', {
        columns: ['name'],
        operations: ['trim'],
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('F.trim(')
    })

    it('generates lowercase operation', () => {
      const node = createTransformNode('stringCleaner', {
        columns: ['email'],
        operations: ['lower'],
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('F.lower(')
    })

    it('generates uppercase operation', () => {
      const node = createTransformNode('stringCleaner', {
        columns: ['code'],
        operations: ['upper'],
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('F.upper(')
    })

    it('generates title case operation', () => {
      const node = createTransformNode('stringCleaner', {
        columns: ['name'],
        operations: ['title'],
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('F.initcap(')
    })

    it('generates remove whitespace operation', () => {
      const node = createTransformNode('stringCleaner', {
        columns: ['text'],
        operations: ['removeWhitespace'],
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('regexp_replace')
    })

    it('generates custom regex operation', () => {
      const node = createTransformNode('stringCleaner', {
        columns: ['text'],
        operations: ['regex'],
        regexPattern: '\\d+',
        regexReplacement: '',
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('regexp_replace')
    })

    it('generates multiple operations', () => {
      const node = createTransformNode('stringCleaner', {
        columns: ['name'],
        operations: ['trim', 'lower'],
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('F.trim(')
      expect(code.join('\n')).toContain('F.lower(')
    })
  })

  describe('generatePreprocessingCode - outlierHandler', () => {
    it('generates IQR outlier detection', () => {
      const node = createTransformNode('outlierHandler', {
        mode: 'perColumn',
        columnConfigs: [
          { column: 'price', method: 'iqr', threshold: 1.5, action: 'cap' },
        ],
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# IQR method for price')
      expect(code.join('\n')).toContain('approxQuantile')
    })

    it('generates Z-score outlier detection', () => {
      const node = createTransformNode('outlierHandler', {
        mode: 'perColumn',
        columnConfigs: [
          { column: 'score', method: 'zscore', threshold: 3, action: 'remove' },
        ],
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Z-score method for score')
      expect(code.join('\n')).toContain('F.mean(')
      expect(code.join('\n')).toContain('F.stddev(')
    })

    it('generates percentile outlier detection', () => {
      const node = createTransformNode('outlierHandler', {
        mode: 'perColumn',
        columnConfigs: [
          { column: 'value', method: 'percentile', threshold: 5, action: 'cap' },
        ],
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Percentile method for value')
    })

    it('generates remove outliers action', () => {
      const node = createTransformNode('outlierHandler', {
        mode: 'perColumn',
        columnConfigs: [
          { column: 'amount', method: 'iqr', threshold: 1.5, action: 'remove' },
        ],
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Remove outliers')
      expect(code.join('\n')).toContain('.filter(')
    })

    it('generates cap outliers action', () => {
      const node = createTransformNode('outlierHandler', {
        mode: 'perColumn',
        columnConfigs: [
          { column: 'qty', method: 'iqr', threshold: 1.5, action: 'cap' },
        ],
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Cap/Winsorize outliers')
    })

    it('generates flag outliers action', () => {
      const node = createTransformNode('outlierHandler', {
        mode: 'perColumn',
        columnConfigs: [
          { column: 'val', method: 'iqr', threshold: 1.5, action: 'flag' },
        ],
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Flag outliers')
    })
  })

  describe('generatePreprocessingCode - formatStandardizer', () => {
    it('generates phone number standardization', () => {
      const node = createTransformNode('formatStandardizer', {
        columns: [{ column: 'phone', formatType: 'phone', targetFormat: 'E164' }],
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Standardize phone number')
      expect(code.join('\n')).toContain('E.164')
    })

    it('generates email standardization', () => {
      const node = createTransformNode('formatStandardizer', {
        columns: [{ column: 'email', formatType: 'email' }],
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Standardize email')
      expect(code.join('\n')).toContain('F.lower(F.trim(')
    })

    it('generates date standardization', () => {
      const node = createTransformNode('formatStandardizer', {
        columns: [
          { column: 'created', formatType: 'date', targetFormat: 'yyyy-MM-dd' },
        ],
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Standardize date format')
      expect(code.join('\n')).toContain('F.coalesce')
      expect(code.join('\n')).toContain('F.to_date')
    })

    it('generates currency standardization', () => {
      const node = createTransformNode('formatStandardizer', {
        columns: [{ column: 'price', formatType: 'currency' }],
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Standardize currency')
      expect(code.join('\n')).toContain('.cast("double")')
    })

    it('generates address standardization', () => {
      const node = createTransformNode('formatStandardizer', {
        columns: [{ column: 'street', formatType: 'address' }],
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Standardize address')
      expect(code.join('\n')).toContain('Street')
      expect(code.join('\n')).toContain('Avenue')
    })

    it('generates SSN standardization', () => {
      const node = createTransformNode('formatStandardizer', {
        columns: [{ column: 'ssn', formatType: 'ssn' }],
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Standardize SSN')
      expect(code.join('\n')).toContain('XXX-XX-XXXX')
    })
  })

  describe('generatePreprocessingCode - dataValidator', () => {
    it('generates notNull validation', () => {
      const node = createTransformNode('dataValidator', {
        rules: [{ id: '1', column: 'id', ruleType: 'notNull' }],
        failAction: 'flag',
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('.isNull()')
    })

    it('generates range validation', () => {
      const node = createTransformNode('dataValidator', {
        rules: [
          { id: '1', column: 'age', ruleType: 'range', params: { min: 0, max: 120 } },
        ],
        failAction: 'flag',
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('F.col("age") <')
      expect(code.join('\n')).toContain('F.col("age") >')
    })

    it('generates pattern validation', () => {
      const node = createTransformNode('dataValidator', {
        rules: [
          {
            id: '1',
            column: 'email',
            ruleType: 'pattern',
            params: { pattern: '^[^@]+@[^@]+$' },
          },
        ],
        failAction: 'flag',
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('.rlike(')
    })

    it('generates inList validation', () => {
      const node = createTransformNode('dataValidator', {
        rules: [
          {
            id: '1',
            column: 'status',
            ruleType: 'inList',
            params: { values: ['active', 'inactive'] },
          },
        ],
        failAction: 'flag',
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('.isin(')
    })

    it('generates reject action', () => {
      const node = createTransformNode('dataValidator', {
        rules: [{ id: '1', column: 'id', ruleType: 'notNull' }],
        failAction: 'reject',
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Reject rows that fail validation')
    })

    it('generates log action', () => {
      const node = createTransformNode('dataValidator', {
        rules: [{ id: '1', column: 'id', ruleType: 'notNull' }],
        failAction: 'log',
      })
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Log validation failures')
    })
  })

  describe('generatePreprocessingCode - placeholder transforms', () => {
    it('generates scaler placeholder', () => {
      const node = createTransformNode('scaler', {})
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Scaler')
      expect(code.join('\n')).toContain('Configure numeric scaling')
    })

    it('generates encoder placeholder', () => {
      const node = createTransformNode('encoder', {})
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Encoder')
      expect(code.join('\n')).toContain('Configure categorical encoding')
    })

    it('generates dateFeatures placeholder', () => {
      const node = createTransformNode('dateFeatures', {})
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Date Features')
    })

    it('generates textFeatures placeholder', () => {
      const node = createTransformNode('textFeatures', {})
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Text Features')
    })

    it('generates trainTestSplit placeholder', () => {
      const node = createTransformNode('trainTestSplit', {})
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('# Train/Test Split')
    })
  })

  describe('generatePreprocessingCode - unknown transform', () => {
    it('generates fallback for unknown transform type', () => {
      const node = createTransformNode('unknownTransform' as any, {})
      const code = generatePreprocessingCode(node, 'df_out', 'df_in')

      expect(code.join('\n')).toContain('df_out = df_in')
      expect(code.join('\n')).toContain('Configure unknownTransform')
    })
  })
})
