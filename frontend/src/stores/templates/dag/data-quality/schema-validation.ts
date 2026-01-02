import type { DagTemplate } from '../../types';

export const schemaValidationTemplate: DagTemplate = {
  id: 'schema-validation-dag',
  name: 'Schema Validation Pipeline',
  description: 'Validate data schemas before processing',
  category: 'data-quality',
  icon: 'fileCheck',
  nodes: [
    {
      id: 'template_sensor_1',
      type: 'dagNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Wait for Files',
        type: 's3_sensor',
        category: 'sensor',
        configured: false,
        config: {
          awsConnId: 'aws_default',
          bucketName: 'incoming-data',
          bucketKey: 'raw/{{ ds }}/',
          wildcardMatch: true,
          timeoutSeconds: 3600,
        },
      },
    },
    {
      id: 'template_validate_1',
      type: 'dagNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Validate Schema',
        type: 'python',
        category: 'action',
        configured: false,
        config: {
          pythonCallable: 'validate_schema',
          opKwargs: '{"expected_schema": "schemas/expected.json", "data_path": "s3://incoming-data/raw/{{ ds }}/"}',
        },
      },
    },
    {
      id: 'template_branch_1',
      type: 'dagNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Schema Valid?',
        type: 'branch',
        category: 'control',
        configured: false,
        config: {
          pythonCallable: 'check_schema_result',
          conditions: [
            { label: 'Valid', targetTaskId: 'process_data' },
            { label: 'Invalid', targetTaskId: 'reject_data' },
          ],
        },
      },
    },
    {
      id: 'template_process_1',
      type: 'dagNode',
      position: { x: 850, y: 80 },
      data: {
        label: 'Process Data',
        type: 'trigger_dag',
        category: 'control',
        configured: false,
        config: {
          triggerDagId: 'main_etl_pipeline',
          waitForCompletion: false,
          conf: '{"source_date": "{{ ds }}"}',
        },
      },
    },
    {
      id: 'template_reject_1',
      type: 'dagNode',
      position: { x: 850, y: 180 },
      data: {
        label: 'Move to Rejected',
        type: 'python',
        category: 'action',
        configured: false,
        config: {
          pythonCallable: 'move_to_rejected',
          opKwargs: '{"source": "s3://incoming-data/raw/{{ ds }}/", "dest": "s3://incoming-data/rejected/{{ ds }}/"}',
        },
      },
    },
    {
      id: 'template_notify_1',
      type: 'dagNode',
      position: { x: 1100, y: 180 },
      data: {
        label: 'Alert Invalid Schema',
        type: 'slack',
        category: 'notify',
        configured: false,
        config: {
          slackConnId: 'slack_default',
          channel: '#data-alerts',
          message: ':warning: Schema validation failed for {{ ds }}. Data moved to rejected folder.',
        },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_sensor_1', target: 'template_validate_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_validate_1', target: 'template_branch_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_branch_1', target: 'template_process_1', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } },
    { id: 'e3-5', source: 'template_branch_1', target: 'template_reject_1', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
    { id: 'e5-6', source: 'template_reject_1', target: 'template_notify_1', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
  ],
  suggestedConfig: {
    schedule: { type: 'cron', cron: '*/15 * * * *' },
    catchup: false,
    tags: ['data-quality', 'schema', 'validation'],
  },
};
