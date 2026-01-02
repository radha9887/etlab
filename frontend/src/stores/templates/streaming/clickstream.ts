import type { PipelineTemplate } from '../types';

export const clickstreamTemplate: PipelineTemplate = {
  id: 'clickstream-analytics',
  name: 'Clickstream Analytics',
  description: 'Web/app event processing with sessionization',
  category: 'streaming',
  icon: 'mousePointer',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Click Events',
        category: 'source',
        sourceType: 'kafka',
        configured: false,
        config: {
          bootstrapServers: 'localhost:9092',
          subscribe: 'clickstream',
          startingOffsets: 'latest',
        },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 300, y: 150 },
      data: {
        label: 'Parse Events',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'event', expression: "from_json(cast(value as string), 'user_id STRING, session_id STRING, page STRING, action STRING, timestamp TIMESTAMP')", expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 500, y: 150 },
      data: {
        label: 'Session Window',
        category: 'transform',
        transformType: 'streamingWindow',
        configured: false,
        config: {
          windowType: 'session',
          timeColumn: 'event.timestamp',
          windowDuration: '30 minutes',
          groupByColumns: ['event.user_id', 'event.session_id'],
          aggregations: [
            { column: '*', function: 'count', alias: 'page_views' },
            { column: 'event.page', function: 'collect_list', alias: 'pages_visited' },
          ],
        },
      },
    },
    {
      id: 'template_transform_3',
      type: 'etlNode',
      position: { x: 700, y: 150 },
      data: {
        label: 'Add Metrics',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'session_duration_sec', expression: 'unix_timestamp(window.end) - unix_timestamp(window.start)', expressionType: 'sql' },
            { name: 'is_bounce', expression: 'page_views = 1', expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 900, y: 150 },
      data: {
        label: 'User Sessions',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: {
          path: '/delta/analytics/user_sessions',
          mode: 'append',
          checkpointLocation: '/checkpoints/clickstream',
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
