import type { PipelineTemplate } from '../types';

export const eventDeduplicationTemplate: PipelineTemplate = {
  id: 'event-deduplication',
  name: 'Event Deduplication',
  description: 'Streaming deduplication with watermarks',
  category: 'streaming',
  icon: 'copy',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Event Stream',
        category: 'source',
        sourceType: 'kafka',
        configured: false,
        config: { bootstrapServers: 'localhost:9092', subscribe: 'events', startingOffsets: 'latest' },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Watermark',
        category: 'transform',
        transformType: 'watermark',
        configured: false,
        config: { eventTimeColumn: 'event_time', delayThreshold: '10 minutes' },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Deduplicate',
        category: 'transform',
        transformType: 'dropDuplicates',
        configured: false,
        config: { columns: ['event_id'] },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 850, y: 150 },
      data: {
        label: 'Unique Events',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: { path: '/delta/unique_events', mode: 'append', checkpointLocation: '/checkpoints/dedup' },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_transform_1', target: 'template_transform_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_transform_2', target: 'template_sink_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
  ],
};
