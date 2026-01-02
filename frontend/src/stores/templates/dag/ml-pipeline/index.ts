import type { DagTemplate } from '../../types';
import { mlTrainingTemplate } from './ml-training';
import { batchInferenceTemplate } from './batch-inference';
import { featureRefreshTemplate } from './feature-refresh';

export const mlPipelineTemplates: DagTemplate[] = [
  mlTrainingTemplate,
  batchInferenceTemplate,
  featureRefreshTemplate,
];

export {
  mlTrainingTemplate,
  batchInferenceTemplate,
  featureRefreshTemplate,
};
