import type { DagTemplate } from '../../types';

export const sodaChecksTemplate: DagTemplate = {
  id: 'soda-checks-dag',
  name: 'Soda Core Checks',
  description: 'Data quality monitoring with Soda Core',
  category: 'data-quality',
  icon: 'shield',
  nodes: [
    {
      id: 'template_sensor_1',
      type: 'dagNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Wait for ETL',
        type: 'external_sensor',
        category: 'sensor',
        configured: false,
        config: {
          externalDagId: 'daily_etl_pipeline',
          externalTaskId: 'load_complete',
          timeoutSeconds: 7200,
          mode: 'reschedule',
        },
      },
    },
    {
      id: 'template_soda_1',
      type: 'dagNode',
      position: { x: 350, y: 100 },
      data: {
        label: 'Check Users Table',
        type: 'soda_core',
        category: 'quality',
        configured: false,
        config: {
          dataSource: 'warehouse',
          checksPath: '/opt/airflow/soda/users_checks.yml',
          scanName: 'users_scan_{{ ds }}',
        },
      },
    },
    {
      id: 'template_soda_2',
      type: 'dagNode',
      position: { x: 350, y: 200 },
      data: {
        label: 'Check Orders Table',
        type: 'soda_core',
        category: 'quality',
        configured: false,
        config: {
          dataSource: 'warehouse',
          checksPath: '/opt/airflow/soda/orders_checks.yml',
          scanName: 'orders_scan_{{ ds }}',
        },
      },
    },
    {
      id: 'template_soda_3',
      type: 'dagNode',
      position: { x: 350, y: 300 },
      data: {
        label: 'Check Products Table',
        type: 'soda_core',
        category: 'quality',
        configured: false,
        config: {
          dataSource: 'warehouse',
          checksPath: '/opt/airflow/soda/products_checks.yml',
          scanName: 'products_scan_{{ ds }}',
        },
      },
    },
    {
      id: 'template_aggregate_1',
      type: 'dagNode',
      position: { x: 600, y: 200 },
      data: {
        label: 'Aggregate Results',
        type: 'python',
        category: 'action',
        configured: false,
        config: {
          pythonCallable: 'aggregate_soda_results',
          opKwargs: '{}',
        },
      },
    },
    {
      id: 'template_report_1',
      type: 'dagNode',
      position: { x: 850, y: 200 },
      data: {
        label: 'Send DQ Report',
        type: 'email',
        category: 'notify',
        configured: false,
        config: {
          to: 'data-quality@company.com',
          subject: 'Daily Data Quality Report - {{ ds }}',
          htmlContent: '<p>See attached Soda scan results.</p>',
        },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_sensor_1', target: 'template_soda_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e1-3', source: 'template_sensor_1', target: 'template_soda_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e1-4', source: 'template_sensor_1', target: 'template_soda_3', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-5', source: 'template_soda_1', target: 'template_aggregate_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-5', source: 'template_soda_2', target: 'template_aggregate_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e4-5', source: 'template_soda_3', target: 'template_aggregate_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e5-6', source: 'template_aggregate_1', target: 'template_report_1', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } },
  ],
  suggestedConfig: {
    schedule: { type: 'cron', cron: '0 8 * * *' },
    tags: ['data-quality', 'soda'],
  },
};
