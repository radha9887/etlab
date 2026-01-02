import type { DagTemplate } from '../../types';

export const medallionDagTemplate: DagTemplate = {
  id: 'medallion-dag',
  name: 'Medallion Architecture DAG',
  description: 'Three-tier data pipeline: Bronze → Silver → Gold with dependencies',
  category: 'data-pipeline',
  icon: 'layers',
  nodes: [
    {
      id: 'template_sensor_1',
      type: 'dagNode',
      position: { x: 100, y: 200 },
      data: {
        label: 'Wait for Raw Data',
        type: 'file_sensor',
        category: 'sensor',
        configured: false,
        config: {
          filepath: '/data/landing/{{ ds }}/',
          fsConnId: 'fs_default',
          timeoutSeconds: 7200,
          pokeIntervalSeconds: 300,
          mode: 'reschedule',
        },
      },
    },
    {
      id: 'template_bronze_1',
      type: 'dagNode',
      position: { x: 350, y: 200 },
      data: {
        label: 'Bronze Layer',
        type: 'etl_task',
        category: 'etl',
        configured: false,
        config: {
          pageName: 'Bronze Ingestion',
          description: 'Raw data ingestion with metadata',
        },
      },
    },
    {
      id: 'template_silver_1',
      type: 'dagNode',
      position: { x: 600, y: 200 },
      data: {
        label: 'Silver Layer',
        type: 'etl_task',
        category: 'etl',
        configured: false,
        config: {
          pageName: 'Silver Transformation',
          description: 'Data cleansing and standardization',
        },
      },
    },
    {
      id: 'template_gold_1',
      type: 'dagNode',
      position: { x: 850, y: 150 },
      data: {
        label: 'Gold - Analytics',
        type: 'etl_task',
        category: 'etl',
        configured: false,
        config: {
          pageName: 'Gold Analytics',
          description: 'Aggregated analytics layer',
        },
      },
    },
    {
      id: 'template_gold_2',
      type: 'dagNode',
      position: { x: 850, y: 250 },
      data: {
        label: 'Gold - Reporting',
        type: 'etl_task',
        category: 'etl',
        configured: false,
        config: {
          pageName: 'Gold Reporting',
          description: 'Reporting data marts',
        },
      },
    },
    {
      id: 'template_notify_1',
      type: 'dagNode',
      position: { x: 1100, y: 200 },
      data: {
        label: 'Pipeline Complete',
        type: 'slack',
        category: 'notify',
        configured: false,
        config: {
          slackConnId: 'slack_default',
          channel: '#data-pipeline',
          message: 'Medallion pipeline completed for {{ ds }}',
          triggerRule: 'all_success',
        },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_sensor_1', target: 'template_bronze_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_bronze_1', target: 'template_silver_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_silver_1', target: 'template_gold_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-5', source: 'template_silver_1', target: 'template_gold_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e4-6', source: 'template_gold_1', target: 'template_notify_1', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } },
    { id: 'e5-6', source: 'template_gold_2', target: 'template_notify_1', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } },
  ],
  suggestedConfig: {
    schedule: { type: 'cron', cron: '0 2 * * *' },
    catchup: false,
    tags: ['medallion', 'data-lake'],
  },
};
