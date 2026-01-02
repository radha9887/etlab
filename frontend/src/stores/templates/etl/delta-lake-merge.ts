import type { PipelineTemplate } from '../types';

export const deltaLakeMergeTemplate: PipelineTemplate = {
  id: 'delta-lake-merge',
  name: 'Delta Lake Merge (Upsert)',
  description: 'MERGE INTO pattern for incremental updates',
  category: 'etl',
  icon: 'gitPullRequest',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'New Data',
        category: 'source',
        sourceType: 'parquet',
        configured: false,
        config: { path: '/data/incremental/' },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Add Update Timestamp',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'updated_at', expression: 'current_timestamp()', expressionType: 'sql' },
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
