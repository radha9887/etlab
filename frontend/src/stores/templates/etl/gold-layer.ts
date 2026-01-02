import type { PipelineTemplate } from '../types';

export const goldLayerTemplate: PipelineTemplate = {
  id: 'gold-layer',
  name: 'Gold Layer Aggregation',
  description: 'Business-level aggregates for medallion architecture',
  category: 'etl',
  icon: 'award',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Silver Data',
        category: 'source',
        sourceType: 'delta',
        configured: false,
        config: { path: '/delta/silver/transactions' },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Daily KPIs',
        category: 'transform',
        transformType: 'aggregate',
        configured: false,
        config: {
          groupByColumns: ['date', 'business_unit'],
          aggregations: [
            { column: 'revenue', function: 'sum', alias: 'daily_revenue' },
            { column: 'orders', function: 'count', alias: 'daily_orders' },
            { column: 'customers', function: 'countDistinct', alias: 'unique_customers' },
          ],
        },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Add Metrics',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'avg_order_value', expression: 'daily_revenue / daily_orders', expressionType: 'sql' },
            { name: 'report_date', expression: 'current_date()', expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 850, y: 150 },
      data: {
        label: 'Gold KPI Table',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: { path: '/delta/gold/daily_kpis', mode: 'overwrite' },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_transform_1', target: 'template_transform_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_transform_2', target: 'template_sink_1', animated: true, style: { stroke: '#ffd700', strokeWidth: 2 } },
  ],
};
