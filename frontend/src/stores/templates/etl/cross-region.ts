import type { PipelineTemplate } from '../types';

export const crossRegionTemplate: PipelineTemplate = {
  id: 'cross-region-replication',
  name: 'Cross-Region Replication',
  description: 'Sync data across multiple regions',
  category: 'etl',
  icon: 'globe',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Primary Region',
        category: 'source',
        sourceType: 'delta',
        configured: false,
        config: { path: 's3://bucket-us-east/delta/table' },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Filter Changed',
        category: 'transform',
        transformType: 'filter',
        configured: false,
        config: { mode: 'sql', sqlExpression: "updated_at > '${last_sync_timestamp}'" },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Add Sync Metadata',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'sync_timestamp', expression: 'current_timestamp()', expressionType: 'sql' },
            { name: 'source_region', expression: "'us-east-1'", expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 850, y: 100 },
      data: {
        label: 'EU Region',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: { path: 's3://bucket-eu-west/delta/table', mode: 'append' },
      },
    },
    {
      id: 'template_sink_2',
      type: 'etlNode',
      position: { x: 850, y: 200 },
      data: {
        label: 'APAC Region',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: { path: 's3://bucket-ap-south/delta/table', mode: 'append' },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_transform_1', target: 'template_transform_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_transform_2', target: 'template_sink_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-5', source: 'template_transform_2', target: 'template_sink_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
  ],
};
