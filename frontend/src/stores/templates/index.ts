// Export types
export type { PipelineTemplate, DagTemplate, DagTemplateCategory, DagTemplateNodeData, DagTemplateSuggestedConfig } from './types';

// Import templates from each category
import { etlTemplates } from './etl';
import { streamingTemplates } from './streaming';
import { dataQualityTemplates } from './data-quality';
import { optimizationTemplates } from './optimization';
import { allDagTemplates, dataPipelineTemplates, mlPipelineTemplates, dataQualityDagTemplates, infrastructureTemplates } from './dag';
import type { PipelineTemplate } from './types';

// Combined array of all ETL templates
export const allTemplates: PipelineTemplate[] = [
  ...etlTemplates,
  ...streamingTemplates,
  ...dataQualityTemplates,
  ...optimizationTemplates,
];

// Re-export category arrays
export { etlTemplates, streamingTemplates, dataQualityTemplates, optimizationTemplates };

// Re-export DAG templates
export { allDagTemplates, dataPipelineTemplates, mlPipelineTemplates, dataQualityDagTemplates, infrastructureTemplates };
