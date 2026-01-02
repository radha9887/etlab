// ETL Templates
export { cdcPipelineTemplate } from './cdc-pipeline';
export { scdType2Template } from './scd-type2';
export { incrementalLoadTemplate } from './incremental-load';
export { csvToParquetTemplate } from './csv-to-parquet';
export { dbToDataLakeTemplate } from './db-to-datalake';
export { bronzeLayerTemplate } from './bronze-layer';
export { retailSalesTemplate } from './retail-sales';
export { fullMedallionTemplate } from './full-medallion';
export { graphDataTemplate } from './graph-data';
export { jsonFlatteningTemplate } from './json-flattening';
export { basicJoinTemplate } from './basic-join';
export { filterAggregateTemplate } from './filter-aggregate';
export { goldLayerTemplate } from './gold-layer';
export { deltaLakeMergeTemplate } from './delta-lake-merge';
export { healthcareFhirTemplate } from './healthcare-fhir';
export { timeTravelTemplate } from './time-travel';
export { crossRegionTemplate } from './cross-region';
export { dataMeshTemplate } from './data-mesh';
export { restApiTemplate } from './rest-api';
export { reverseEtlTemplate } from './reverse-etl';

import { cdcPipelineTemplate } from './cdc-pipeline';
import { scdType2Template } from './scd-type2';
import { incrementalLoadTemplate } from './incremental-load';
import { csvToParquetTemplate } from './csv-to-parquet';
import { dbToDataLakeTemplate } from './db-to-datalake';
import { bronzeLayerTemplate } from './bronze-layer';
import { retailSalesTemplate } from './retail-sales';
import { fullMedallionTemplate } from './full-medallion';
import { graphDataTemplate } from './graph-data';
import { jsonFlatteningTemplate } from './json-flattening';
import { basicJoinTemplate } from './basic-join';
import { filterAggregateTemplate } from './filter-aggregate';
import { goldLayerTemplate } from './gold-layer';
import { deltaLakeMergeTemplate } from './delta-lake-merge';
import { healthcareFhirTemplate } from './healthcare-fhir';
import { timeTravelTemplate } from './time-travel';
import { crossRegionTemplate } from './cross-region';
import { dataMeshTemplate } from './data-mesh';
import { restApiTemplate } from './rest-api';
import { reverseEtlTemplate } from './reverse-etl';
import type { PipelineTemplate } from '../types';

export const etlTemplates: PipelineTemplate[] = [
  cdcPipelineTemplate,
  scdType2Template,
  incrementalLoadTemplate,
  csvToParquetTemplate,
  dbToDataLakeTemplate,
  bronzeLayerTemplate,
  retailSalesTemplate,
  fullMedallionTemplate,
  graphDataTemplate,
  jsonFlatteningTemplate,
  basicJoinTemplate,
  filterAggregateTemplate,
  goldLayerTemplate,
  deltaLakeMergeTemplate,
  healthcareFhirTemplate,
  timeTravelTemplate,
  crossRegionTemplate,
  dataMeshTemplate,
  restApiTemplate,
  reverseEtlTemplate,
];
