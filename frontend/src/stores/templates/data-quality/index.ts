// Data Quality Templates
export { deduplicationTemplate } from './deduplication';
export { dataQualityTemplate } from './data-quality-check';
export { silverLayerTemplate } from './silver-layer';
export { schemaValidationTemplate } from './schema-validation';
export { financialReconTemplate } from './financial-reconciliation';
export { piiMaskingTemplate } from './pii-masking';
export { dataProfilingTemplate } from './data-profiling';
export { quarantineTemplate } from './quarantine-bad-records';
export { auditTrailTemplate } from './audit-trail';

import { deduplicationTemplate } from './deduplication';
import { dataQualityTemplate } from './data-quality-check';
import { silverLayerTemplate } from './silver-layer';
import { schemaValidationTemplate } from './schema-validation';
import { financialReconTemplate } from './financial-reconciliation';
import { piiMaskingTemplate } from './pii-masking';
import { dataProfilingTemplate } from './data-profiling';
import { quarantineTemplate } from './quarantine-bad-records';
import { auditTrailTemplate } from './audit-trail';
import type { PipelineTemplate } from '../types';

export const dataQualityTemplates: PipelineTemplate[] = [
  deduplicationTemplate,
  dataQualityTemplate,
  silverLayerTemplate,
  schemaValidationTemplate,
  financialReconTemplate,
  piiMaskingTemplate,
  dataProfilingTemplate,
  quarantineTemplate,
  auditTrailTemplate,
];
