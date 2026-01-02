import type { PipelineTemplate } from '../types';

export const incrementalLoadTemplate: PipelineTemplate = {
  id: 'incremental-load',
  name: 'Incremental Load',
  description: 'Load only new/changed records based on watermark column',
  category: 'etl',
  icon: 'refreshCw',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Source Table',
        category: 'source',
        sourceType: 'jdbc',
        configured: false,
        config: {
          url: 'jdbc:postgresql://host:5432/db',
          dbtable: 'source_table',
          user: 'user',
          password: '****',
        },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Filter Incremental',
        category: 'transform',
        transformType: 'filter',
        configured: false,
        config: {
          mode: 'sql',
          sqlExpression: "updated_at > '${last_load_timestamp}'",
        },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Add Load Metadata',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'load_timestamp', expression: 'current_timestamp()', expressionType: 'sql' },
            { name: 'load_date', expression: 'current_date()', expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 850, y: 150 },
      data: {
        label: 'Delta Target',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: {
          path: '/delta/target_table',
          mode: 'append',
          mergeSchema: true,
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
