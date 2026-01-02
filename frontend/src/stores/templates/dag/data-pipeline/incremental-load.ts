import type { DagTemplate } from '../../types';

export const incrementalLoadTemplate: DagTemplate = {
  id: 'incremental-load-dag',
  name: 'Incremental Load Pipeline',
  description: 'Delta/incremental data loading with watermark tracking',
  category: 'data-pipeline',
  icon: 'refreshCw',
  nodes: [
    {
      id: 'template_sensor_1',
      type: 'dagNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Check New Data',
        type: 'sql_sensor',
        category: 'sensor',
        configured: false,
        config: {
          connId: 'postgres_default',
          sql: "SELECT 1 FROM source_table WHERE updated_at > '{{ prev_ds }}' LIMIT 1",
          timeoutSeconds: 1800,
          pokeIntervalSeconds: 120,
          mode: 'reschedule',
        },
      },
    },
    {
      id: 'template_extract_1',
      type: 'dagNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Extract Delta',
        type: 'etl_task',
        category: 'etl',
        configured: false,
        config: {
          pageName: 'Extract Incremental',
          description: 'Extract records since last watermark',
        },
      },
    },
    {
      id: 'template_transform_1',
      type: 'dagNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Transform & Merge',
        type: 'etl_task',
        category: 'etl',
        configured: false,
        config: {
          pageName: 'Merge to Target',
          description: 'Upsert into target table',
        },
      },
    },
    {
      id: 'template_update_1',
      type: 'dagNode',
      position: { x: 850, y: 150 },
      data: {
        label: 'Update Watermark',
        type: 'sql_execute',
        category: 'action',
        configured: false,
        config: {
          connId: 'postgres_default',
          sql: "UPDATE etl_watermarks SET last_run = '{{ ts }}' WHERE pipeline_name = 'incremental_load'",
        },
      },
    },
    {
      id: 'template_notify_1',
      type: 'dagNode',
      position: { x: 1100, y: 150 },
      data: {
        label: 'Notify Complete',
        type: 'slack',
        category: 'notify',
        configured: false,
        config: {
          slackConnId: 'slack_default',
          channel: '#data-ops',
          message: 'Incremental load completed for {{ ds }}',
        },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_sensor_1', target: 'template_extract_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_extract_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_transform_1', target: 'template_update_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e4-5', source: 'template_update_1', target: 'template_notify_1', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } },
  ],
  suggestedConfig: {
    schedule: { type: 'cron', cron: '*/30 * * * *' },
    catchup: false,
    tags: ['incremental', 'delta-load'],
  },
};
