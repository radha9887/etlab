import type { PipelineTemplate } from '../types';

export const financialReconTemplate: PipelineTemplate = {
  id: 'financial-reconciliation',
  name: 'Financial Reconciliation',
  description: 'Multi-source balance matching with exception reporting',
  category: 'data-quality',
  icon: 'dollarSign',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 100 },
      data: {
        label: 'Source System A',
        category: 'source',
        sourceType: 'jdbc',
        configured: false,
        config: {
          url: 'jdbc:postgresql://localhost:5432/finance',
          dbtable: 'ledger_entries',
          user: 'finance_user',
          password: '****',
        },
      },
    },
    {
      id: 'template_source_2',
      type: 'etlNode',
      position: { x: 100, y: 300 },
      data: {
        label: 'Source System B',
        category: 'source',
        sourceType: 'jdbc',
        configured: false,
        config: {
          url: 'jdbc:postgresql://localhost:5432/banking',
          dbtable: 'bank_transactions',
          user: 'bank_user',
          password: '****',
        },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 100 },
      data: {
        label: 'Aggregate Source A',
        category: 'transform',
        transformType: 'aggregate',
        configured: false,
        config: {
          groupByColumns: ['account_id', 'transaction_date'],
          aggregations: [
            { column: 'amount', function: 'sum', alias: 'source_a_balance' },
            { column: 'transaction_id', function: 'count', alias: 'source_a_count' },
          ],
        },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 350, y: 300 },
      data: {
        label: 'Aggregate Source B',
        category: 'transform',
        transformType: 'aggregate',
        configured: false,
        config: {
          groupByColumns: ['account_id', 'transaction_date'],
          aggregations: [
            { column: 'amount', function: 'sum', alias: 'source_b_balance' },
            { column: 'transaction_id', function: 'count', alias: 'source_b_count' },
          ],
        },
      },
    },
    {
      id: 'template_transform_3',
      type: 'etlNode',
      position: { x: 600, y: 200 },
      data: {
        label: 'Full Outer Join',
        category: 'transform',
        transformType: 'join',
        configured: false,
        config: {
          joinType: 'full_outer',
          leftKey: ['account_id', 'transaction_date'],
          rightKey: ['account_id', 'transaction_date'],
        },
      },
    },
    {
      id: 'template_transform_4',
      type: 'etlNode',
      position: { x: 850, y: 200 },
      data: {
        label: 'Calculate Variance',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'balance_diff', expression: 'coalesce(source_a_balance, 0) - coalesce(source_b_balance, 0)', expressionType: 'sql' },
            { name: 'count_diff', expression: 'coalesce(source_a_count, 0) - coalesce(source_b_count, 0)', expressionType: 'sql' },
            { name: 'is_matched', expression: 'abs(balance_diff) < 0.01 AND count_diff = 0', expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 1100, y: 100 },
      data: {
        label: 'Matched Records',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: {
          path: '/delta/recon/matched',
          mode: 'overwrite',
        },
      },
    },
    {
      id: 'template_sink_2',
      type: 'etlNode',
      position: { x: 1100, y: 300 },
      data: {
        label: 'Exceptions',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: {
          path: '/delta/recon/exceptions',
          mode: 'overwrite',
        },
      },
    },
  ],
  edges: [
    { id: 'e1-3', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-4', source: 'template_source_2', target: 'template_transform_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-5', source: 'template_transform_1', target: 'template_transform_3', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e4-5', source: 'template_transform_2', target: 'template_transform_3', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e5-6', source: 'template_transform_3', target: 'template_transform_4', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e6-7', source: 'template_transform_4', target: 'template_sink_1', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } },
    { id: 'e6-8', source: 'template_transform_4', target: 'template_sink_2', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
  ],
};
