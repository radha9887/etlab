import type { PipelineTemplate } from '../types';

export const basicJoinTemplate: PipelineTemplate = {
  id: 'basic-join',
  name: 'Basic Join Pipeline',
  description: 'Join two data sources on a common key',
  category: 'etl',
  icon: 'link',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 100 },
      data: {
        label: 'Orders',
        category: 'source',
        sourceType: 'parquet',
        configured: false,
        config: { path: '/data/orders/' },
      },
    },
    {
      id: 'template_source_2',
      type: 'etlNode',
      position: { x: 100, y: 250 },
      data: {
        label: 'Customers',
        category: 'source',
        sourceType: 'parquet',
        configured: false,
        config: { path: '/data/customers/' },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 400, y: 175 },
      data: {
        label: 'Join on Customer ID',
        category: 'transform',
        transformType: 'join',
        configured: false,
        config: { joinType: 'inner', leftKey: 'customer_id', rightKey: 'id' },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 700, y: 175 },
      data: {
        label: 'Enriched Orders',
        category: 'sink',
        sinkType: 'parquet',
        configured: false,
        config: { path: '/data/enriched_orders/', mode: 'overwrite' },
      },
    },
  ],
  edges: [
    { id: 'e1-3', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_source_2', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_transform_1', target: 'template_sink_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
  ],
};
