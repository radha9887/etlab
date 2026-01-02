import type { DagTemplate } from '../../types';

export const snowflakeMaintenanceTemplate: DagTemplate = {
  id: 'snowflake-maintenance-dag',
  name: 'Snowflake Maintenance',
  description: 'Automated Snowflake warehouse maintenance and optimization',
  category: 'infrastructure',
  icon: 'snowflake',
  nodes: [
    {
      id: 'template_check_1',
      type: 'dagNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Check Query Stats',
        type: 'snowflake',
        category: 'integration',
        configured: false,
        config: {
          snowflakeConnId: 'snowflake_default',
          sql: 'SELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY WHERE START_TIME > DATEADD(day, -1, CURRENT_TIMESTAMP())',
          warehouse: 'COMPUTE_WH',
        },
      },
    },
    {
      id: 'template_cleanup_1',
      type: 'dagNode',
      position: { x: 350, y: 100 },
      data: {
        label: 'Cleanup Temp Tables',
        type: 'snowflake',
        category: 'integration',
        configured: false,
        config: {
          snowflakeConnId: 'snowflake_default',
          sql: "CALL cleanup_temp_tables('{{ ds }}')",
          warehouse: 'COMPUTE_WH',
        },
      },
    },
    {
      id: 'template_optimize_1',
      type: 'dagNode',
      position: { x: 350, y: 200 },
      data: {
        label: 'Reclustering',
        type: 'snowflake',
        category: 'integration',
        configured: false,
        config: {
          snowflakeConnId: 'snowflake_default',
          sql: 'ALTER TABLE analytics.fact_orders RECLUSTER',
          warehouse: 'COMPUTE_WH',
        },
      },
    },
    {
      id: 'template_stats_1',
      type: 'dagNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Gather Stats',
        type: 'snowflake',
        category: 'integration',
        configured: false,
        config: {
          snowflakeConnId: 'snowflake_default',
          sql: 'ANALYZE TABLE analytics.fact_orders COMPUTE STATISTICS',
          warehouse: 'COMPUTE_WH',
        },
      },
    },
    {
      id: 'template_resize_1',
      type: 'dagNode',
      position: { x: 850, y: 150 },
      data: {
        label: 'Resize Warehouse',
        type: 'snowflake',
        category: 'integration',
        configured: false,
        config: {
          snowflakeConnId: 'snowflake_default',
          sql: "ALTER WAREHOUSE COMPUTE_WH SET WAREHOUSE_SIZE = 'MEDIUM'",
          warehouse: 'COMPUTE_WH',
        },
      },
    },
    {
      id: 'template_notify_1',
      type: 'dagNode',
      position: { x: 1100, y: 150 },
      data: {
        label: 'Send Report',
        type: 'email',
        category: 'notify',
        configured: false,
        config: {
          to: 'platform-team@company.com',
          subject: 'Snowflake Maintenance Complete - {{ ds }}',
          htmlContent: '<p>Daily maintenance tasks completed successfully.</p>',
        },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_check_1', target: 'template_cleanup_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e1-3', source: 'template_check_1', target: 'template_optimize_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-4', source: 'template_cleanup_1', target: 'template_stats_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_optimize_1', target: 'template_stats_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e4-5', source: 'template_stats_1', target: 'template_resize_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e5-6', source: 'template_resize_1', target: 'template_notify_1', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } },
  ],
  suggestedConfig: {
    schedule: { type: 'cron', cron: '0 3 * * 0' },
    tags: ['infrastructure', 'snowflake', 'maintenance'],
  },
};
