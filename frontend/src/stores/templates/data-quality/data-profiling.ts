import type { PipelineTemplate } from '../types';

export const dataProfilingTemplate: PipelineTemplate = {
  id: 'data-profiling',
  name: 'Data Profiling',
  description: 'Generate column statistics and quality metrics',
  category: 'data-quality',
  icon: 'pieChart',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Data to Profile',
        category: 'source',
        sourceType: 'delta',
        configured: false,
        config: { path: '/delta/data_to_profile' },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Compute Stats',
        category: 'transform',
        transformType: 'aggregate',
        configured: false,
        config: {
          groupByColumns: [],
          aggregations: [
            { column: '*', function: 'count', alias: 'total_rows' },
            { column: 'id', function: 'countDistinct', alias: 'unique_ids' },
            { column: 'amount', function: 'min', alias: 'min_amount' },
            { column: 'amount', function: 'max', alias: 'max_amount' },
            { column: 'amount', function: 'avg', alias: 'avg_amount' },
          ],
        },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Add Profile Metadata',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'profile_date', expression: 'current_date()', expressionType: 'sql' },
            { name: 'source_path', expression: "'/delta/data_to_profile'", expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 850, y: 150 },
      data: {
        label: 'Profile Results',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: { path: '/delta/data_profiles', mode: 'append' },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_transform_1', target: 'template_transform_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_transform_2', target: 'template_sink_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
  ],
};
