import type { PipelineTemplate } from '../types';

export const mlFeatureStoreTemplate: PipelineTemplate = {
  id: 'ml-feature-store',
  name: 'ML Feature Store Pipeline',
  description: 'Feature engineering pipeline for machine learning',
  category: 'optimization',
  icon: 'brain',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 100 },
      data: {
        label: 'Raw Events',
        category: 'source',
        sourceType: 'delta',
        configured: false,
        config: { path: '/delta/silver/events' },
      },
    },
    {
      id: 'template_source_2',
      type: 'etlNode',
      position: { x: 100, y: 250 },
      data: {
        label: 'User Profiles',
        category: 'source',
        sourceType: 'delta',
        configured: false,
        config: { path: '/delta/silver/users' },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 100 },
      data: {
        label: 'Event Features',
        category: 'transform',
        transformType: 'aggregate',
        configured: false,
        config: {
          groupByColumns: ['user_id'],
          aggregations: [
            { column: '*', function: 'count', alias: 'event_count_30d' },
            { column: 'amount', function: 'sum', alias: 'total_spend_30d' },
            { column: 'amount', function: 'avg', alias: 'avg_order_value' },
            { column: 'session_duration', function: 'avg', alias: 'avg_session_time' },
          ],
        },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 600, y: 175 },
      data: {
        label: 'Join Features',
        category: 'transform',
        transformType: 'join',
        configured: false,
        config: { joinType: 'left', leftKey: 'user_id', rightKey: 'id' },
      },
    },
    {
      id: 'template_transform_3',
      type: 'etlNode',
      position: { x: 850, y: 175 },
      data: {
        label: 'Derived Features',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'days_since_signup', expression: 'datediff(current_date(), signup_date)', expressionType: 'sql' },
            { name: 'orders_per_day', expression: 'event_count_30d / 30.0', expressionType: 'sql' },
            { name: 'is_high_value', expression: 'total_spend_30d > 500', expressionType: 'sql' },
            { name: 'feature_timestamp', expression: 'current_timestamp()', expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 1100, y: 175 },
      data: {
        label: 'Feature Store',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: {
          path: '/delta/feature_store/user_features',
          mode: 'overwrite',
          partitionBy: ['feature_timestamp'],
        },
      },
    },
  ],
  edges: [
    { id: 'e1-3', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_transform_1', target: 'template_transform_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-4', source: 'template_source_2', target: 'template_transform_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e4-5', source: 'template_transform_2', target: 'template_transform_3', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e5-6', source: 'template_transform_3', target: 'template_sink_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
  ],
};
