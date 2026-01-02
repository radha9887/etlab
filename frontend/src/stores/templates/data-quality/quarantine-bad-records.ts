import type { PipelineTemplate } from '../types';

export const quarantineTemplate: PipelineTemplate = {
  id: 'quarantine-bad-records',
  name: 'Quarantine Bad Records',
  description: 'Route invalid records to error table',
  category: 'data-quality',
  icon: 'alertTriangle',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 200 },
      data: {
        label: 'Raw Data',
        category: 'source',
        sourceType: 'parquet',
        configured: false,
        config: { path: '/data/raw/' },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 200 },
      data: {
        label: 'Validate Records',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'is_valid', expression: 'id IS NOT NULL AND amount > 0 AND email RLIKE "^[A-Za-z0-9+_.-]+@(.+)$"', expressionType: 'sql' },
            { name: 'error_reason', expression: "CASE WHEN id IS NULL THEN 'Missing ID' WHEN amount <= 0 THEN 'Invalid amount' WHEN email NOT RLIKE '^[A-Za-z0-9+_.-]+@(.+)$' THEN 'Invalid email' ELSE NULL END", expressionType: 'sql' },
          ],
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
        config: { mode: 'sql', sqlExpression: 'is_valid = true' },
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
        config: { mode: 'sql', sqlExpression: 'is_valid = false' },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 850, y: 100 },
      data: {
        label: 'Good Records',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: { path: '/delta/clean_data', mode: 'append' },
      },
    },
    {
      id: 'template_sink_2',
      type: 'etlNode',
      position: { x: 850, y: 300 },
      data: {
        label: 'Quarantine',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: { path: '/delta/quarantine', mode: 'append' },
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
