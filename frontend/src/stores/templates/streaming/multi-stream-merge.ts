import type { PipelineTemplate } from '../types';

export const multiStreamMergeTemplate: PipelineTemplate = {
  id: 'multi-stream-merge',
  name: 'Multi-Stream Merge',
  description: 'Combine multiple Kafka topics into unified stream',
  category: 'streaming',
  icon: 'gitMerge',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 50 },
      data: {
        label: 'Orders Stream',
        category: 'source',
        sourceType: 'kafka',
        configured: false,
        config: { bootstrapServers: 'localhost:9092', subscribe: 'orders', startingOffsets: 'latest' },
      },
    },
    {
      id: 'template_source_2',
      type: 'etlNode',
      position: { x: 100, y: 175 },
      data: {
        label: 'Payments Stream',
        category: 'source',
        sourceType: 'kafka',
        configured: false,
        config: { bootstrapServers: 'localhost:9092', subscribe: 'payments', startingOffsets: 'latest' },
      },
    },
    {
      id: 'template_source_3',
      type: 'etlNode',
      position: { x: 100, y: 300 },
      data: {
        label: 'Shipments Stream',
        category: 'source',
        sourceType: 'kafka',
        configured: false,
        config: { bootstrapServers: 'localhost:9092', subscribe: 'shipments', startingOffsets: 'latest' },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 50 },
      data: {
        label: 'Normalize Orders',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'event_type', expression: "'order'", expressionType: 'sql' },
            { name: 'event_data', expression: 'cast(value as string)', expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 350, y: 175 },
      data: {
        label: 'Normalize Payments',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'event_type', expression: "'payment'", expressionType: 'sql' },
            { name: 'event_data', expression: 'cast(value as string)', expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_transform_3',
      type: 'etlNode',
      position: { x: 350, y: 300 },
      data: {
        label: 'Normalize Shipments',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'event_type', expression: "'shipment'", expressionType: 'sql' },
            { name: 'event_data', expression: 'cast(value as string)', expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_transform_4',
      type: 'etlNode',
      position: { x: 600, y: 175 },
      data: {
        label: 'Union All Streams',
        category: 'transform',
        transformType: 'union',
        configured: false,
        config: { unionType: 'all' },
      },
    },
    {
      id: 'template_transform_5',
      type: 'etlNode',
      position: { x: 850, y: 175 },
      data: {
        label: 'Add Processing Time',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'processing_time', expression: 'current_timestamp()', expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 1100, y: 175 },
      data: {
        label: 'Unified Events',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: {
          path: '/delta/unified_events',
          mode: 'append',
          checkpointLocation: '/checkpoints/multi-stream',
        },
      },
    },
  ],
  edges: [
    { id: 'e1-4', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-5', source: 'template_source_2', target: 'template_transform_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-6', source: 'template_source_3', target: 'template_transform_3', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e4-7', source: 'template_transform_1', target: 'template_transform_4', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e5-7', source: 'template_transform_2', target: 'template_transform_4', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e6-7', source: 'template_transform_3', target: 'template_transform_4', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e7-8', source: 'template_transform_4', target: 'template_transform_5', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e8-9', source: 'template_transform_5', target: 'template_sink_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
  ],
};
