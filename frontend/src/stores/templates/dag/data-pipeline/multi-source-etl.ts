import type { DagTemplate } from '../../types';

export const multiSourceEtlTemplate: DagTemplate = {
  id: 'multi-source-etl',
  name: 'Multi-Source ETL',
  description: 'Parallel data extraction from multiple sources with merge',
  category: 'data-pipeline',
  icon: 'gitMerge',
  nodes: [
    {
      id: 'template_source_1',
      type: 'dagNode',
      position: { x: 100, y: 100 },
      data: {
        label: 'Extract from DB',
        type: 'etl_task',
        category: 'etl',
        configured: false,
        config: {
          pageName: 'Database Extract',
          description: 'Extract from PostgreSQL',
        },
      },
    },
    {
      id: 'template_source_2',
      type: 'dagNode',
      position: { x: 100, y: 200 },
      data: {
        label: 'Extract from API',
        type: 'python',
        category: 'action',
        configured: false,
        config: {
          pythonCallable: 'extract_api_data',
          opKwargs: '{"endpoint": "{{ var.value.api_endpoint }}"}',
        },
      },
    },
    {
      id: 'template_source_3',
      type: 'dagNode',
      position: { x: 100, y: 300 },
      data: {
        label: 'Extract from S3',
        type: 'etl_task',
        category: 'etl',
        configured: false,
        config: {
          pageName: 'S3 Extract',
          description: 'Extract from S3 files',
        },
      },
    },
    {
      id: 'template_merge_1',
      type: 'dagNode',
      position: { x: 400, y: 200 },
      data: {
        label: 'Merge & Transform',
        type: 'etl_task',
        category: 'etl',
        configured: false,
        config: {
          pageName: 'Data Merge',
          description: 'Join all sources and transform',
        },
      },
    },
    {
      id: 'template_load_1',
      type: 'dagNode',
      position: { x: 650, y: 200 },
      data: {
        label: 'Load to Warehouse',
        type: 'etl_task',
        category: 'etl',
        configured: false,
        config: {
          pageName: 'Warehouse Load',
          description: 'Load to data warehouse',
        },
      },
    },
    {
      id: 'template_notify_1',
      type: 'dagNode',
      position: { x: 900, y: 200 },
      data: {
        label: 'Send Report',
        type: 'email',
        category: 'notify',
        configured: false,
        config: {
          to: 'data-team@company.com',
          subject: 'Multi-Source ETL Complete - {{ ds }}',
          htmlContent: '<p>Pipeline completed successfully.</p>',
        },
      },
    },
  ],
  edges: [
    { id: 'e1-4', source: 'template_source_1', target: 'template_merge_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-4', source: 'template_source_2', target: 'template_merge_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_source_3', target: 'template_merge_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e4-5', source: 'template_merge_1', target: 'template_load_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e5-6', source: 'template_load_1', target: 'template_notify_1', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } },
  ],
  suggestedConfig: {
    schedule: { type: 'cron', cron: '0 3 * * *' },
    tags: ['multi-source', 'etl'],
  },
};
