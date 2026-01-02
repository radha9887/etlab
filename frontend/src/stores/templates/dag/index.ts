import type { DagTemplate } from '../types';
import { dataPipelineTemplates } from './data-pipeline';
import { mlPipelineTemplates } from './ml-pipeline';
import { dataQualityDagTemplates } from './data-quality';
import { infrastructureTemplates } from './infrastructure';

// Combined array of all DAG templates
export const allDagTemplates: DagTemplate[] = [
  ...dataPipelineTemplates,
  ...mlPipelineTemplates,
  ...dataQualityDagTemplates,
  ...infrastructureTemplates,
];

// Re-export category arrays
export { dataPipelineTemplates, mlPipelineTemplates, dataQualityDagTemplates, infrastructureTemplates };

// Re-export individual templates
export * from './data-pipeline';
export * from './ml-pipeline';
export * from './data-quality';
export * from './infrastructure';
