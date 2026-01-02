import type { DagTemplate } from '../../types';
import { etlOrchestrationTemplate } from './etl-orchestration';
import { medallionDagTemplate } from './medallion-dag';
import { dbtPipelineTemplate } from './dbt-pipeline';
import { incrementalLoadTemplate } from './incremental-load';
import { multiSourceEtlTemplate } from './multi-source-etl';

export const dataPipelineTemplates: DagTemplate[] = [
  etlOrchestrationTemplate,
  medallionDagTemplate,
  dbtPipelineTemplate,
  incrementalLoadTemplate,
  multiSourceEtlTemplate,
];

export {
  etlOrchestrationTemplate,
  medallionDagTemplate,
  dbtPipelineTemplate,
  incrementalLoadTemplate,
  multiSourceEtlTemplate,
};
