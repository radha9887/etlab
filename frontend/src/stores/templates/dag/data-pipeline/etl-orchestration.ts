import type { DagTemplate } from '../../types';

export const etlOrchestrationTemplate: DagTemplate = {
  id: 'etl-orchestration',
  name: 'ETL Orchestration',
  description: 'Basic ETL pipeline with sensor, ETL task, and notifications',
  category: 'data-pipeline',
  icon: 'workflow',
  nodes: [
    {
      id: 'template_sensor_1',
      type: 'dagNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Wait for Data',
        type: 's3_sensor',
        category: 'sensor',
        configured: false,
        config: {
          awsConnId: 'aws_default',
          bucketName: 'my-data-bucket',
          bucketKey: 'incoming/{{ ds }}/*.parquet',
          wildcardMatch: true,
          timeoutSeconds: 3600,
          pokeIntervalSeconds: 60,
          mode: 'reschedule',
        },
      },
    },
    {
      id: 'template_etl_1',
      type: 'dagNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Run ETL Pipeline',
        type: 'etl_task',
        category: 'etl',
        configured: false,
        config: {
          pageName: '',
          sparkConfig: {
            executorMemory: '4g',
            executorCores: 2,
            numExecutors: 4,
          },
        },
      },
    },
    {
      id: 'template_notify_1',
      type: 'dagNode',
      position: { x: 600, y: 100 },
      data: {
        label: 'Success Notification',
        type: 'slack',
        category: 'notify',
        configured: false,
        config: {
          slackConnId: 'slack_default',
          channel: '#data-alerts',
          message: 'ETL pipeline completed successfully for {{ ds }}',
        },
      },
    },
    {
      id: 'template_notify_2',
      type: 'dagNode',
      position: { x: 600, y: 200 },
      data: {
        label: 'Failure Alert',
        type: 'email',
        category: 'notify',
        configured: false,
        config: {
          to: 'data-team@company.com',
          subject: 'ETL Pipeline Failed - {{ ds }}',
          htmlContent: '<p>The ETL pipeline failed. Please check Airflow logs.</p>',
          triggerRule: 'one_failed',
        },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_sensor_1', target: 'template_etl_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_etl_1', target: 'template_notify_1', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } },
    { id: 'e2-4', source: 'template_etl_1', target: 'template_notify_2', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
  ],
  suggestedConfig: {
    schedule: { type: 'cron', cron: '0 6 * * *' },
    defaultArgs: {
      retries: 3,
      retryDelayMinutes: 5,
    },
  },
};
