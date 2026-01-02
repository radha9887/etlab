import type { DagTemplate } from '../../types';

export const dbtPipelineTemplate: DagTemplate = {
  id: 'dbt-pipeline',
  name: 'dbt Cloud Pipeline',
  description: 'Run dbt Cloud job with testing and notifications',
  category: 'data-pipeline',
  icon: 'code',
  nodes: [
    {
      id: 'template_sensor_1',
      type: 'dagNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Wait for Upstream',
        type: 'external_sensor',
        category: 'sensor',
        configured: false,
        config: {
          externalDagId: 'upstream_data_ingestion',
          externalTaskId: 'final_task',
          timeoutSeconds: 7200,
          mode: 'reschedule',
        },
      },
    },
    {
      id: 'template_dbt_1',
      type: 'dagNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'dbt Run',
        type: 'dbt_cloud',
        category: 'integration',
        configured: false,
        config: {
          dbtCloudConnId: 'dbt_cloud_default',
          jobId: '',
          accountId: '',
          waitForTermination: true,
          checkInterval: 30,
          timeout: 3600,
        },
      },
    },
    {
      id: 'template_dbt_2',
      type: 'dagNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'dbt Test',
        type: 'dbt_cloud',
        category: 'integration',
        configured: false,
        config: {
          dbtCloudConnId: 'dbt_cloud_default',
          jobId: '',
          accountId: '',
          command: 'dbt test',
          waitForTermination: true,
        },
      },
    },
    {
      id: 'template_notify_1',
      type: 'dagNode',
      position: { x: 850, y: 100 },
      data: {
        label: 'Success Slack',
        type: 'slack',
        category: 'notify',
        configured: false,
        config: {
          slackConnId: 'slack_default',
          channel: '#dbt-alerts',
          message: ':white_check_mark: dbt pipeline completed successfully for {{ ds }}',
        },
      },
    },
    {
      id: 'template_notify_2',
      type: 'dagNode',
      position: { x: 850, y: 200 },
      data: {
        label: 'Failure PagerDuty',
        type: 'pagerduty',
        category: 'notify',
        configured: false,
        config: {
          pagerdutyConnId: 'pagerduty_default',
          summary: 'dbt Pipeline Failed',
          severity: 'error',
          triggerRule: 'one_failed',
        },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_sensor_1', target: 'template_dbt_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_dbt_1', target: 'template_dbt_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_dbt_2', target: 'template_notify_1', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } },
    { id: 'e3-5', source: 'template_dbt_2', target: 'template_notify_2', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
  ],
  suggestedConfig: {
    schedule: { type: 'cron', cron: '0 4 * * *' },
    tags: ['dbt', 'transformation'],
  },
};
