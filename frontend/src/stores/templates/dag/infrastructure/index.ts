import type { DagTemplate } from '../../types';
import { snowflakeMaintenanceTemplate } from './snowflake-maintenance';
import { s3ToGcsSyncTemplate } from './s3-to-gcs-sync';
import { databricksJobTemplate } from './databricks-job';

export const infrastructureTemplates: DagTemplate[] = [
  snowflakeMaintenanceTemplate,
  s3ToGcsSyncTemplate,
  databricksJobTemplate,
];

export {
  snowflakeMaintenanceTemplate,
  s3ToGcsSyncTemplate,
  databricksJobTemplate,
};
