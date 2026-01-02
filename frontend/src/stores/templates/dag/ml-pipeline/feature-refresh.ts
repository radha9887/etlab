import type { DagTemplate } from '../../types';

export const featureRefreshTemplate: DagTemplate = {
  id: 'feature-refresh-dag',
  name: 'Feature Store Refresh',
  description: 'Refresh ML feature store with latest data',
  category: 'ml-pipeline',
  icon: 'database',
  nodes: [
    {
      id: 'template_sensor_1',
      type: 'dagNode',
      position: { x: 100, y: 200 },
      data: {
        label: 'Wait for Source',
        type: 'external_sensor',
        category: 'sensor',
        configured: false,
        config: {
          externalDagId: 'data_warehouse_refresh',
          externalTaskId: 'final_task',
          timeoutSeconds: 7200,
          mode: 'reschedule',
        },
      },
    },
    {
      id: 'template_features_1',
      type: 'dagNode',
      position: { x: 350, y: 100 },
      data: {
        label: 'User Features',
        type: 'etl_task',
        category: 'etl',
        configured: false,
        config: {
          pageName: 'User Feature Engineering',
          description: 'Compute user-level features',
        },
      },
    },
    {
      id: 'template_features_2',
      type: 'dagNode',
      position: { x: 350, y: 200 },
      data: {
        label: 'Product Features',
        type: 'etl_task',
        category: 'etl',
        configured: false,
        config: {
          pageName: 'Product Feature Engineering',
          description: 'Compute product-level features',
        },
      },
    },
    {
      id: 'template_features_3',
      type: 'dagNode',
      position: { x: 350, y: 300 },
      data: {
        label: 'Interaction Features',
        type: 'etl_task',
        category: 'etl',
        configured: false,
        config: {
          pageName: 'Interaction Feature Engineering',
          description: 'Compute user-product interactions',
        },
      },
    },
    {
      id: 'template_store_1',
      type: 'dagNode',
      position: { x: 600, y: 200 },
      data: {
        label: 'Update Feature Store',
        type: 'python',
        category: 'action',
        configured: false,
        config: {
          pythonCallable: 'update_feature_store',
          opKwargs: '{"feature_store": "feast", "batch_source": "s3://features/{{ ds }}/"}',
        },
      },
    },
    {
      id: 'template_validate_1',
      type: 'dagNode',
      position: { x: 850, y: 200 },
      data: {
        label: 'Validate Features',
        type: 'python',
        category: 'action',
        configured: false,
        config: {
          pythonCallable: 'validate_features',
          opKwargs: '{"check_drift": true, "check_completeness": true}',
        },
      },
    },
    {
      id: 'template_notify_1',
      type: 'dagNode',
      position: { x: 1100, y: 200 },
      data: {
        label: 'Notify Team',
        type: 'slack',
        category: 'notify',
        configured: false,
        config: {
          slackConnId: 'slack_default',
          channel: '#ml-features',
          message: 'Feature store refreshed for {{ ds }}',
        },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_sensor_1', target: 'template_features_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e1-3', source: 'template_sensor_1', target: 'template_features_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e1-4', source: 'template_sensor_1', target: 'template_features_3', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-5', source: 'template_features_1', target: 'template_store_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-5', source: 'template_features_2', target: 'template_store_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e4-5', source: 'template_features_3', target: 'template_store_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e5-6', source: 'template_store_1', target: 'template_validate_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e6-7', source: 'template_validate_1', target: 'template_notify_1', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } },
  ],
  suggestedConfig: {
    schedule: { type: 'cron', cron: '0 5 * * *' },
    tags: ['ml', 'features', 'feature-store'],
  },
};
