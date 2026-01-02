import type { PipelineTemplate } from '../types';

export const scdType2Template: PipelineTemplate = {
  id: 'scd-type2',
  name: 'SCD Type 2',
  description: 'Slowly Changing Dimension Type 2 with history tracking',
  category: 'etl',
  icon: 'clock',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Source Data',
        category: 'source',
        sourceType: 'parquet',
        configured: false,
        config: { path: '/data/source/' },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Add SCD Columns',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'effective_date', expression: 'current_date()', expressionType: 'sql' },
            { name: 'end_date', expression: "to_date('9999-12-31')", expressionType: 'sql' },
            { name: 'is_current', expression: 'true', expressionType: 'literal' },
            { name: 'row_hash', expression: "sha2(concat_ws('|', col1, col2, col3), 256)", expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Merge SCD2',
        category: 'transform',
        transformType: 'deltaMerge',
        configured: false,
        config: {
          targetPath: '/delta/dimension_table',
          mergeConditions: [{ sourceColumn: 'id', targetColumn: 'id' }],
          whenClauses: [
            { type: 'matched', condition: 'target.row_hash != source.row_hash AND target.is_current = true', action: 'update_all' },
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
