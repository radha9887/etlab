import type { PipelineTemplate } from '../types';

export const dataMeshTemplate: PipelineTemplate = {
  id: 'data-mesh-domain',
  name: 'Data Mesh Domain Pipeline',
  description: 'Self-serve domain data product',
  category: 'etl',
  icon: 'hexagon',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Domain Raw Data',
        category: 'source',
        sourceType: 'delta',
        configured: false,
        config: { path: '/delta/domains/sales/raw' },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Apply Business Rules',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'fiscal_quarter', expression: "concat('Q', quarter(order_date), ' FY', year(order_date))", expressionType: 'sql' },
            { name: 'revenue_category', expression: "CASE WHEN amount > 1000 THEN 'High' WHEN amount > 100 THEN 'Medium' ELSE 'Low' END", expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Add Data Contract',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: '_domain', expression: "'sales'", expressionType: 'sql' },
            { name: '_data_product', expression: "'order_analytics'", expressionType: 'sql' },
            { name: '_version', expression: "'1.0.0'", expressionType: 'sql' },
            { name: '_published_at', expression: 'current_timestamp()', expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 850, y: 150 },
      data: {
        label: 'Data Product',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: { path: '/delta/data_products/sales/order_analytics', mode: 'overwrite' },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_transform_1', target: 'template_transform_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_transform_2', target: 'template_sink_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
  ],
};
