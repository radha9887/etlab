/**
 * PySpark Code Generator
 *
 * This file re-exports from the modular pyspark/ directory for backwards compatibility.
 * The actual implementation is split across multiple files for better maintainability:
 *
 * - pyspark/types.ts - Core TypeScript interfaces
 * - pyspark/helpers.ts - Utility functions (topological sort, variable names, etc.)
 * - pyspark/sources/ - Source node code generators
 * - pyspark/transforms/ - Transform node code generators
 * - pyspark/sinks/ - Sink node code generators
 * - pyspark/columns.ts - Column computation functions
 * - pyspark/index.ts - Main entry point
 */

// Re-export everything from the modular implementation
export { generatePySparkCode } from './pyspark';
export { getAvailableColumns } from './pyspark/columns';

// Re-export types
export type { CodeGeneratorResult } from './pyspark';
