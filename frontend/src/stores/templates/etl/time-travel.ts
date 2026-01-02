import type { PipelineTemplate } from '../types';

export const timeTravelTemplate: PipelineTemplate = {
  id: 'time-travel',
  name: 'Time Travel Queries',
  description: 'Historical data comparison using Delta Lake versioning',
  category: 'etl',
  icon: 'rewind',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 100 },
      data: {
        label: 'Current Version',
        category: 'source',
        sourceType: 'delta',
        configured: false,
        config: { path: '/delta/table' },
      },
    },
    {
      id: 'template_source_2',
      type: 'etlNode',
      position: { x: 100, y: 250 },
      data: {
        label: 'Previous Version',
        category: 'source',
        sourceType: 'delta',
        configured: false,
        config: { path: '/delta/table', versionAsOf: 10 },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 400, y: 175 },
      data: {
        label: 'Compare Versions',
        category: 'transform',
        transformType: 'join',
        configured: false,
        config: { joinType: 'full_outer', leftKey: 'id', rightKey: 'id' },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 650, y: 175 },
      data: {
        label: 'Identify Changes',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'change_type', expression: "CASE WHEN current.id IS NULL THEN 'DELETED' WHEN previous.id IS NULL THEN 'INSERTED' WHEN current.row_hash != previous.row_hash THEN 'UPDATED' ELSE 'UNCHANGED' END", expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 900, y: 175 },
      data: {
        label: 'Change Report',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: { path: '/delta/change_reports', mode: 'append' },
      },
    },
  ],
  edges: [
    { id: 'e1-3', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_source_2', target: 'template_transform_1', animated: true, style: { stroke: '#9ca3af', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_transform_1', target: 'template_transform_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e4-5', source: 'template_transform_2', target: 'template_sink_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
  ],
};
