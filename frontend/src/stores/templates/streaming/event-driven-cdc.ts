import type { PipelineTemplate } from '../types';

export const eventDrivenCdcTemplate: PipelineTemplate = {
  id: 'event-driven-cdc',
  name: 'Event-Driven CDC',
  description: 'CDC events with conditional routing to multiple sinks',
  category: 'streaming',
  icon: 'split',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 200 },
      data: {
        label: 'Debezium CDC',
        category: 'source',
        sourceType: 'kafka',
        configured: false,
        config: {
          bootstrapServers: 'localhost:9092',
          subscribe: 'dbserver.inventory.customers',
          startingOffsets: 'earliest',
        },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 200 },
      data: {
        label: 'Parse CDC Event',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'operation', expression: "get_json_object(value, '$.op')", expressionType: 'sql' },
            { name: 'before_data', expression: "get_json_object(value, '$.before')", expressionType: 'sql' },
            { name: 'after_data', expression: "get_json_object(value, '$.after')", expressionType: 'sql' },
            { name: 'ts_ms', expression: "get_json_object(value, '$.ts_ms')", expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 600, y: 100 },
      data: {
        label: 'Filter Inserts',
        category: 'transform',
        transformType: 'filter',
        configured: false,
        config: { mode: 'sql', sqlExpression: "operation = 'c'" },
      },
    },
    {
      id: 'template_transform_3',
      type: 'etlNode',
      position: { x: 600, y: 200 },
      data: {
        label: 'Filter Updates',
        category: 'transform',
        transformType: 'filter',
        configured: false,
        config: { mode: 'sql', sqlExpression: "operation = 'u'" },
      },
    },
    {
      id: 'template_transform_4',
      type: 'etlNode',
      position: { x: 600, y: 300 },
      data: {
        label: 'Filter Deletes',
        category: 'transform',
        transformType: 'filter',
        configured: false,
        config: { mode: 'sql', sqlExpression: "operation = 'd'" },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 850, y: 100 },
      data: {
        label: 'New Records',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: { path: '/delta/cdc/inserts', mode: 'append' },
      },
    },
    {
      id: 'template_sink_2',
      type: 'etlNode',
      position: { x: 850, y: 200 },
      data: {
        label: 'Changed Records',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: { path: '/delta/cdc/updates', mode: 'append' },
      },
    },
    {
      id: 'template_sink_3',
      type: 'etlNode',
      position: { x: 850, y: 300 },
      data: {
        label: 'Deleted Records',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: { path: '/delta/cdc/deletes', mode: 'append' },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_transform_1', target: 'template_transform_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-4', source: 'template_transform_1', target: 'template_transform_3', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-5', source: 'template_transform_1', target: 'template_transform_4', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-6', source: 'template_transform_2', target: 'template_sink_1', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } },
    { id: 'e4-7', source: 'template_transform_3', target: 'template_sink_2', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 } },
    { id: 'e5-8', source: 'template_transform_4', target: 'template_sink_3', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
  ],
};
