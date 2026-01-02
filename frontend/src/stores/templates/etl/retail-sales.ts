import type { PipelineTemplate } from '../types';

export const retailSalesTemplate: PipelineTemplate = {
  id: 'retail-sales-analytics',
  name: 'Retail Sales Analytics',
  description: 'POS data aggregation pipeline with time-based rollups',
  category: 'etl',
  icon: 'shoppingCart',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'POS Transactions',
        category: 'source',
        sourceType: 'jdbc',
        configured: false,
        config: {
          url: 'jdbc:postgresql://localhost:5432/retail',
          dbtable: 'pos_transactions',
          user: 'retail_user',
          password: '****',
        },
      },
    },
    {
      id: 'template_source_2',
      type: 'etlNode',
      position: { x: 100, y: 300 },
      data: {
        label: 'Product Catalog',
        category: 'source',
        sourceType: 'delta',
        configured: false,
        config: { path: '/delta/products' },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 200 },
      data: {
        label: 'Join Products',
        category: 'transform',
        transformType: 'join',
        configured: false,
        config: { joinType: 'left', leftKey: 'product_id', rightKey: 'id' },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 600, y: 200 },
      data: {
        label: 'Daily Aggregation',
        category: 'transform',
        transformType: 'aggregate',
        configured: false,
        config: {
          groupByColumns: ['store_id', 'category', 'transaction_date'],
          aggregations: [
            { column: 'amount', function: 'sum', alias: 'total_sales' },
            { column: 'quantity', function: 'sum', alias: 'total_units' },
            { column: 'transaction_id', function: 'count', alias: 'transaction_count' },
            { column: 'amount', function: 'avg', alias: 'avg_transaction' },
          ],
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 850, y: 200 },
      data: {
        label: 'Sales Dashboard',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: { path: '/delta/gold/daily_sales', mode: 'overwrite', partitionBy: ['transaction_date'] },
      },
    },
  ],
  edges: [
    { id: 'e1-3', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_source_2', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_transform_1', target: 'template_transform_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e4-5', source: 'template_transform_2', target: 'template_sink_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
  ],
};
