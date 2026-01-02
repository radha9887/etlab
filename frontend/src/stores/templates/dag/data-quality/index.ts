import type { DagTemplate } from '../../types';
import { greatExpectationsTemplate } from './great-expectations';
import { sodaChecksTemplate } from './soda-checks';
import { schemaValidationTemplate } from './schema-validation';

export const dataQualityDagTemplates: DagTemplate[] = [
  greatExpectationsTemplate,
  sodaChecksTemplate,
  schemaValidationTemplate,
];

export {
  greatExpectationsTemplate,
  sodaChecksTemplate,
  schemaValidationTemplate,
};
