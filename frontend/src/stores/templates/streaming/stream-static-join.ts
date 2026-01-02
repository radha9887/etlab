import type { PipelineTemplate } from '../types';

export const streamStaticJoinTemplate: PipelineTemplate = {
  id: 'stream-static-join',
  name: 'Stream-Static Join',
  description: 'Enrich streaming data with reference tables',
  category: 'streaming',
  icon: 'link2',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 100 },
      data: {
        label: 'Transaction Stream',
        category: 'source',
        sourceType: 'kafka',
        configured: false,
        config: { bootstrapServers: 'localhost:9092', subscribe: 'transactions', startingOffsets: 'latest' },
      },
    },
    {
      id: 'template_source_2',
      type: 'etlNode',
      position: { x: 100, y: 250 },
      data: {
        label: 'Product Reference',
        category: 'source',
        sourceType: 'delta',
        configured: false,
        config: { path: '/delta/products' },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 400, y: 175 },
      data: {
        label: 'Enrich with Products',
        category: 'transform',
        transformType: 'join',
        configured: false,
        config: { joinType: 'left', leftKey: 'product_id', rightKey: 'id' },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 700, y: 175 },
      data: {
        label: 'Enriched Stream',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: { path: '/delta/enriched_transactions', mode: 'append', checkpointLocation: '/checkpoints/enrich' },
      },
    },
  ],
  edges: [
    { id: 'e1-3', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_source_2', target: 'template_transform_1', animated: true, style: { stroke: '#9ca3af', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_transform_1', target: 'template_sink_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
  ],
};
