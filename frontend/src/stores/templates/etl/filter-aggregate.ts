import type { PipelineTemplate } from '../types';

export const filterAggregateTemplate: PipelineTemplate = {
  id: 'filter-aggregate',
  name: 'Filter and Aggregate',
  description: 'Simple WHERE + GROUP BY pattern',
  category: 'etl',
  icon: 'barChart2',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Sales Data',
        category: 'source',
        sourceType: 'parquet',
        configured: false,
        config: { path: '/data/sales/' },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Filter Active',
        category: 'transform',
        transformType: 'filter',
        configured: false,
        config: { mode: 'sql', sqlExpression: "status = 'completed' AND amount > 0" },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Aggregate by Region',
        category: 'transform',
        transformType: 'aggregate',
        configured: false,
        config: {
          groupByColumns: ['region', 'product_category'],
          aggregations: [
            { column: 'amount', function: 'sum', alias: 'total_sales' },
            { column: 'order_id', function: 'count', alias: 'order_count' },
            { column: 'amount', function: 'avg', alias: 'avg_order_value' },
          ],
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 850, y: 150 },
      data: {
        label: 'Sales Summary',
        category: 'sink',
        sinkType: 'parquet',
        configured: false,
        config: { path: '/data/sales_summary/', mode: 'overwrite' },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_transform_1', target: 'template_transform_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_transform_2', target: 'template_sink_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
  ],
};
