import type { PipelineTemplate } from '../types';

export const reverseEtlTemplate: PipelineTemplate = {
  id: 'reverse-etl',
  name: 'Reverse ETL',
  description: 'Push analytics data back to operational systems',
  category: 'etl',
  icon: 'upload',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Analytics Data',
        category: 'source',
        sourceType: 'delta',
        configured: false,
        config: { path: '/delta/gold/customer_segments' },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Map to CRM Schema',
        category: 'transform',
        transformType: 'select',
        configured: false,
        config: {
          columns: ['customer_id as external_id', 'segment as custom_segment', 'lifetime_value as ltv', 'churn_score'],
        },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Add Sync Timestamp',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'synced_at', expression: 'current_timestamp()', expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 850, y: 150 },
      data: {
        label: 'CRM System',
        category: 'sink',
        sinkType: 'jdbc',
        configured: false,
        config: {
          url: 'jdbc:postgresql://crm-db:5432/crm',
          dbtable: 'customer_attributes',
          user: 'crm_sync',
          password: '****',
          mode: 'overwrite',
        },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_transform_1', target: 'template_transform_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_transform_2', target: 'template_sink_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
  ],
};
