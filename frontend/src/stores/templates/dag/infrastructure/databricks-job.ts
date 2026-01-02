import type { DagTemplate } from '../../types';

export const databricksJobTemplate: DagTemplate = {
  id: 'databricks-job-dag',
  name: 'Databricks Job Orchestration',
  description: 'Orchestrate Databricks notebooks and jobs with dependencies',
  category: 'infrastructure',
  icon: 'zap',
  nodes: [
    {
      id: 'template_sensor_1',
      type: 'dagNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Wait for Data',
        type: 'delta_sensor',
        category: 'sensor',
        configured: false,
        config: {
          tableName: 'bronze.raw_events',
          deltaTablePath: 'dbfs:/delta/bronze/raw_events',
          timeoutSeconds: 3600,
        },
      },
    },
    {
      id: 'template_notebook_1',
      type: 'dagNode',
      position: { x: 350, y: 100 },
      data: {
        label: 'Transform Notebook',
        type: 'databricks',
        category: 'integration',
        configured: false,
        config: {
          databricksConnId: 'databricks_default',
          operationType: 'notebook',
          notebookPath: '/Shared/ETL/transform_events',
          notebookParams: '{"date": "{{ ds }}", "mode": "incremental"}',
          existingClusterId: '',
        },
      },
    },
    {
      id: 'template_notebook_2',
      type: 'dagNode',
      position: { x: 350, y: 200 },
      data: {
        label: 'Aggregate Notebook',
        type: 'databricks',
        category: 'integration',
        configured: false,
        config: {
          databricksConnId: 'databricks_default',
          operationType: 'notebook',
          notebookPath: '/Shared/ETL/aggregate_metrics',
          notebookParams: '{"date": "{{ ds }}"}',
          existingClusterId: '',
        },
      },
    },
    {
      id: 'template_job_1',
      type: 'dagNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Run ML Job',
        type: 'databricks',
        category: 'integration',
        configured: false,
        config: {
          databricksConnId: 'databricks_default',
          operationType: 'run_now',
          jobId: '',
          waitForTermination: true,
          timeoutSeconds: 7200,
        },
      },
    },
    {
      id: 'template_export_1',
      type: 'dagNode',
      position: { x: 850, y: 150 },
      data: {
        label: 'Export Results',
        type: 'databricks',
        category: 'integration',
        configured: false,
        config: {
          databricksConnId: 'databricks_default',
          operationType: 'notebook',
          notebookPath: '/Shared/Export/to_warehouse',
          notebookParams: '{"date": "{{ ds }}"}',
        },
      },
    },
    {
      id: 'template_notify_1',
      type: 'dagNode',
      position: { x: 1100, y: 150 },
      data: {
        label: 'Notify Team',
        type: 'ms_teams',
        category: 'notify',
        configured: false,
        config: {
          msTeamsConnId: 'ms_teams_default',
          message: 'Databricks pipeline completed for {{ ds }}',
        },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_sensor_1', target: 'template_notebook_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e1-3', source: 'template_sensor_1', target: 'template_notebook_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-4', source: 'template_notebook_1', target: 'template_job_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_notebook_2', target: 'template_job_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e4-5', source: 'template_job_1', target: 'template_export_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e5-6', source: 'template_export_1', target: 'template_notify_1', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } },
  ],
  suggestedConfig: {
    schedule: { type: 'cron', cron: '0 6 * * *' },
    tags: ['infrastructure', 'databricks', 'notebooks'],
  },
};
