import type { PipelineTemplate } from '../types';

export const healthcareFhirTemplate: PipelineTemplate = {
  id: 'healthcare-fhir',
  name: 'Healthcare HL7/FHIR',
  description: 'Medical data transformation pipeline',
  category: 'etl',
  icon: 'heart',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'FHIR Messages',
        category: 'source',
        sourceType: 'json',
        configured: false,
        config: { path: '/data/fhir/*.json', multiLine: true },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Parse FHIR Bundle',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'resource_type', expression: "get_json_object(entry, '$.resource.resourceType')", expressionType: 'sql' },
            { name: 'patient_id', expression: "get_json_object(entry, '$.resource.subject.reference')", expressionType: 'sql' },
            { name: 'encounter_date', expression: "get_json_object(entry, '$.resource.period.start')", expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Standardize IDs',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'patient_id_clean', expression: "regexp_replace(patient_id, 'Patient/', '')", expressionType: 'sql' },
            { name: 'ingestion_time', expression: 'current_timestamp()', expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 850, y: 150 },
      data: {
        label: 'Healthcare Data Lake',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: { path: '/delta/healthcare/fhir_resources', mode: 'append', partitionBy: ['resource_type'] },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_transform_1', target: 'template_transform_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_transform_2', target: 'template_sink_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
  ],
};
