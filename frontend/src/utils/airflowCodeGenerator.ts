/**
 * @deprecated This file is maintained for backwards compatibility.
 * Please import from './airflow' instead.
 *
 * The Airflow code generator has been refactored into modular files:
 * - ./airflow/index.ts - Main exports
 * - ./airflow/helpers.ts - Helper functions
 * - ./airflow/imports/ - Import generation by provider
 * - ./airflow/operators/ - Operator code generation by provider
 * - ./airflow/dependencies.ts - Task dependency generation
 */

// Re-export everything from the new modular location
export {
  generateAirflowCode,
  toTaskId,
  generateImports,
  generateDefaultArgs,
  generateAirflowImports,
  generateTaskCode,
  generateDependencies,
} from './airflow';

export type { AirflowCodeResult } from './airflow';
