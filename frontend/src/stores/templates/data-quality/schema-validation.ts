import type { PipelineTemplate } from '../types';

export const schemaValidationTemplate: PipelineTemplate = {
  id: 'schema-validation',
  name: 'Schema Validation Pipeline',
  description: 'Validate data against schema and route good/bad records',
  category: 'data-quality',
  icon: 'shield',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 200 },
      data: {
        label: 'Source Data',
        category: 'source',
        sourceType: 'parquet',
        configured: false,
        config: {
          path: '/data/input/',
        },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 200 },
      data: {
        label: 'Schema Validation',
        category: 'transform',
        transformType: 'schemaValidation',
        configured: false,
        config: {
          expectedSchema: [
            { name: 'id', type: 'integer', nullable: false },
            { name: 'email', type: 'string', nullable: false },
            { name: 'amount', type: 'double', nullable: true },
          ],
          strictMode: false,
          failOnError: false,
        },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 600, y: 100 },
      data: {
        label: 'Filter Valid',
        category: 'transform',
        transformType: 'filter',
        configured: false,
        config: {
          mode: 'sql',
          sqlExpression: '_validation_passed = true',
        },
      },
    },
    {
      id: 'template_transform_3',
      type: 'etlNode',
      position: { x: 600, y: 300 },
      data: {
        label: 'Filter Invalid',
        category: 'transform',
        transformType: 'filter',
        configured: false,
        config: {
          mode: 'sql',
          sqlExpression: '_validation_passed = false',
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 850, y: 100 },
      data: {
        label: 'Valid Records',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: {
          path: '/delta/valid_records',
          mode: 'append',
        },
      },
    },
    {
      id: 'template_sink_2',
      type: 'etlNode',
      position: { x: 850, y: 300 },
      data: {
        label: 'Error Records',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: {
          path: '/delta/error_records',
          mode: 'append',
        },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_transform_1', target: 'template_transform_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-4', source: 'template_transform_1', target: 'template_transform_3', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-5', source: 'template_transform_2', target: 'template_sink_1', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } },
    { id: 'e4-6', source: 'template_transform_3', target: 'template_sink_2', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
  ],
};
