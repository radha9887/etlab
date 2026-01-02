import type { PipelineTemplate } from '../types';

export const deduplicationTemplate: PipelineTemplate = {
  id: 'deduplication',
  name: 'Deduplication Pipeline',
  description: 'Remove duplicate records keeping the most recent',
  category: 'data-quality',
  icon: 'copy',
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
        label: 'Rank Duplicates',
        category: 'transform',
        transformType: 'window',
        configured: false,
        config: {
          partitionBy: 'id',
          orderByColumns: [{ column: 'updated_at', direction: 'desc' }],
          windowFunction: 'row_number',
          outputColumn: 'rn',
        },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Keep First',
        category: 'transform',
        transformType: 'filter',
        configured: false,
        config: { mode: 'sql', sqlExpression: 'rn = 1' },
      },
    },
    {
      id: 'template_transform_3',
      type: 'etlNode',
      position: { x: 850, y: 150 },
      data: {
        label: 'Drop Rank Column',
        category: 'transform',
        transformType: 'dropColumn',
        configured: false,
        config: { columns: 'rn' },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 1100, y: 150 },
      data: {
        label: 'Deduplicated Output',
        category: 'sink',
        sinkType: 'parquet',
        configured: false,
        config: { path: '/data/output/', mode: 'overwrite' },
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
