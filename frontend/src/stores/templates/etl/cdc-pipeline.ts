import type { PipelineTemplate } from '../types';

export const cdcPipelineTemplate: PipelineTemplate = {
  id: 'cdc-pipeline',
  name: 'CDC Pipeline',
  description: 'Change Data Capture pipeline with Delta Lake merge for upserts',
  category: 'etl',
  icon: 'gitMerge',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'CDC Source',
        category: 'source',
        sourceType: 'kafka',
        configured: false,
        config: {
          bootstrapServers: 'localhost:9092',
          subscribe: 'cdc-events',
          startingOffsets: 'latest',
        },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Parse CDC Event',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'operation', expression: "get_json_object(value, '$.op')", expressionType: 'sql' },
            { name: 'payload', expression: "get_json_object(value, '$.payload')", expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Delta Merge',
        category: 'transform',
        transformType: 'deltaMerge',
        configured: false,
        config: {
          targetPath: '/delta/target_table',
          mergeConditions: [{ sourceColumn: 'id', targetColumn: 'id' }],
          whenClauses: [
            { type: 'matched', action: 'update_all' },
            { type: 'not_matched', action: 'insert_all' },
          ],
        },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_transform_1', target: 'template_transform_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
  ],
};
