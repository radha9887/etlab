import type { PipelineTemplate } from '../types';

export const silverLayerTemplate: PipelineTemplate = {
  id: 'silver-layer',
  name: 'Silver Layer Cleansing',
  description: 'Data cleaning and standardization for medallion architecture',
  category: 'data-quality',
  icon: 'filter',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Bronze Source',
        category: 'source',
        sourceType: 'delta',
        configured: false,
        config: {
          path: '/delta/bronze/raw_data',
        },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 300, y: 150 },
      data: {
        label: 'Drop Nulls',
        category: 'transform',
        transformType: 'dropna',
        configured: false,
        config: {
          how: 'any',
          subset: ['id', 'email'],
        },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 500, y: 150 },
      data: {
        label: 'Standardize',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'email_clean', expression: 'lower(trim(email))', expressionType: 'sql' },
            { name: 'name_clean', expression: 'initcap(trim(name))', expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_transform_3',
      type: 'etlNode',
      position: { x: 700, y: 150 },
      data: {
        label: 'Deduplicate',
        category: 'transform',
        transformType: 'dropDuplicates',
        configured: false,
        config: {
          columns: ['id'],
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 900, y: 150 },
      data: {
        label: 'Silver Delta Table',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: {
          path: '/delta/silver/clean_data',
          mode: 'overwrite',
        },
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
