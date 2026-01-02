import type { PipelineTemplate } from '../types';

export const kafkaToDeltaTemplate: PipelineTemplate = {
  id: 'kafka-to-delta',
  name: 'Kafka to Delta Lake',
  description: 'Stream ingestion from Kafka to Delta Lake with checkpointing',
  category: 'streaming',
  icon: 'activity',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Kafka Stream',
        category: 'source',
        sourceType: 'kafka',
        configured: false,
        config: {
          bootstrapServers: 'localhost:9092',
          subscribe: 'events-topic',
          startingOffsets: 'earliest',
        },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Parse JSON',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'parsed_value', expression: "from_json(cast(value as string), 'id INT, name STRING, timestamp TIMESTAMP')", expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Flatten Struct',
        category: 'transform',
        transformType: 'select',
        configured: false,
        config: {
          columns: ['parsed_value.id as id', 'parsed_value.name as name', 'parsed_value.timestamp as event_time', 'topic', 'partition', 'offset'],
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 850, y: 150 },
      data: {
        label: 'Delta Lake Sink',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: {
          path: '/delta/streaming/events',
          mode: 'append',
          checkpointLocation: '/checkpoints/kafka-to-delta',
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
