import type { PipelineTemplate } from '../types';

export const dataQualityTemplate: PipelineTemplate = {
  id: 'data-quality-check',
  name: 'Data Quality Pipeline',
  description: 'Comprehensive data quality checks with profiling and assertions',
  category: 'data-quality',
  icon: 'checkCircle',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Source Data',
        category: 'source',
        sourceType: 'parquet',
        configured: false,
        config: { path: '/data/source/' },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Schema Validation',
        category: 'transform',
        transformType: 'schemaValidation',
        configured: false,
        config: {
          expectedSchema: [],
          strictMode: false,
          failOnError: true,
        },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Data Assertions',
        category: 'transform',
        transformType: 'dataAssertions',
        configured: false,
        config: {
          assertions: [
            { name: 'id_not_null', type: 'not_null', column: 'id' },
            { name: 'id_unique', type: 'unique', column: 'id' },
          ],
          failOnError: true,
        },
      },
    },
    {
      id: 'template_transform_3',
      type: 'etlNode',
      position: { x: 850, y: 150 },
      data: {
        label: 'Drop NA',
        category: 'transform',
        transformType: 'dropna',
        configured: false,
        config: { how: 'any' },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 1100, y: 150 },
      data: {
        label: 'Clean Output',
        category: 'sink',
        sinkType: 'parquet',
        configured: false,
        config: { path: '/data/clean/', mode: 'overwrite' },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_transform_1', target: 'template_transform_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_transform_2', target: 'template_transform_3', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e4-5', source: 'template_transform_3', target: 'template_sink_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
  ],
};
