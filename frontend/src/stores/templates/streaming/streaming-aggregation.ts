import type { PipelineTemplate } from '../types';

export const streamingAggTemplate: PipelineTemplate = {
  id: 'streaming-aggregation',
  name: 'Streaming Aggregation',
  description: 'Real-time streaming with windowed aggregations',
  category: 'streaming',
  icon: 'radio',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Kafka Source',
        category: 'source',
        sourceType: 'kafka',
        configured: false,
        config: {
          bootstrapServers: 'localhost:9092',
          subscribe: 'events',
          startingOffsets: 'latest',
        },
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
        config: {
          eventTimeColumn: 'event_time',
          delayThreshold: '10 minutes',
        },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Window Aggregation',
        category: 'transform',
        transformType: 'streamingWindow',
        configured: false,
        config: {
          windowType: 'tumbling',
          timeColumn: 'event_time',
          windowDuration: '5 minutes',
          groupByColumns: ['category'],
          aggregations: [
            { column: '*', function: 'count', alias: 'event_count' },
            { column: 'amount', function: 'sum', alias: 'total_amount' },
          ],
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 850, y: 150 },
      data: {
        label: 'Delta Sink',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: { path: '/delta/streaming_output', mode: 'append' },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_transform_1', target: 'template_transform_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_transform_2', target: 'template_sink_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
  ],
};
