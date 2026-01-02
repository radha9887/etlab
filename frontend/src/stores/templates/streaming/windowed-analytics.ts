import type { PipelineTemplate } from '../types';

export const windowedAnalyticsTemplate: PipelineTemplate = {
  id: 'windowed-analytics',
  name: 'Windowed Analytics',
  description: 'Time-based window aggregations (tumbling/sliding)',
  category: 'streaming',
  icon: 'clock',
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
        config: { bootstrapServers: 'localhost:9092', subscribe: 'metrics', startingOffsets: 'latest' },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 300, y: 150 },
      data: {
        label: 'Watermark',
        category: 'transform',
        transformType: 'watermark',
        configured: false,
        config: { eventTimeColumn: 'timestamp', delayThreshold: '5 minutes' },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 500, y: 100 },
      data: {
        label: 'Tumbling Window',
        category: 'transform',
        transformType: 'streamingWindow',
        configured: false,
        config: {
          windowType: 'tumbling',
          timeColumn: 'timestamp',
          windowDuration: '5 minutes',
          groupByColumns: ['device_id'],
          aggregations: [
            { column: 'value', function: 'avg', alias: 'avg_value' },
            { column: 'value', function: 'max', alias: 'max_value' },
          ],
        },
      },
    },
    {
      id: 'template_transform_3',
      type: 'etlNode',
      position: { x: 500, y: 250 },
      data: {
        label: 'Sliding Window',
        category: 'transform',
        transformType: 'streamingWindow',
        configured: false,
        config: {
          windowType: 'sliding',
          timeColumn: 'timestamp',
          windowDuration: '10 minutes',
          slideDuration: '2 minutes',
          groupByColumns: ['device_id'],
          aggregations: [
            { column: 'value', function: 'avg', alias: 'rolling_avg' },
          ],
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 750, y: 100 },
      data: {
        label: '5min Metrics',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: { path: '/delta/metrics_5min', mode: 'append' },
      },
    },
    {
      id: 'template_sink_2',
      type: 'etlNode',
      position: { x: 750, y: 250 },
      data: {
        label: 'Rolling Metrics',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: { path: '/delta/metrics_rolling', mode: 'append' },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_transform_1', target: 'template_transform_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-4', source: 'template_transform_1', target: 'template_transform_3', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-5', source: 'template_transform_2', target: 'template_sink_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e4-6', source: 'template_transform_3', target: 'template_sink_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
  ],
};
