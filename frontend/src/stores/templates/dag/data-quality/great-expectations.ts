import type { DagTemplate } from '../../types';

export const greatExpectationsTemplate: DagTemplate = {
  id: 'great-expectations-dag',
  name: 'Great Expectations Pipeline',
  description: 'Data quality validation with Great Expectations and alerting',
  category: 'data-quality',
  icon: 'checkCircle',
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
          bucketName: 'data-lake',
          bucketKey: 'processed/{{ ds }}/',
          wildcardMatch: true,
          timeoutSeconds: 3600,
        },
      },
    },
    {
      id: 'template_ge_1',
      type: 'dagNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Run GE Validation',
        type: 'great_expectations',
        category: 'quality',
        configured: false,
        config: {
          expectationSuiteName: 'critical_data_suite',
          dataContextRoot: '/opt/airflow/great_expectations',
          batchKwargs: '{"path": "s3://data-lake/processed/{{ ds }}/", "reader_method": "parquet"}',
          failTaskOnValidationFailure: false,
        },
      },
    },
    {
      id: 'template_branch_1',
      type: 'dagNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Check Results',
        type: 'branch',
        category: 'control',
        configured: false,
        config: {
          pythonCallable: 'check_ge_results',
          conditions: [
            { label: 'Pass', targetTaskId: 'notify_success' },
            { label: 'Fail', targetTaskId: 'quarantine_data' },
          ],
        },
      },
    },
    {
      id: 'template_success_1',
      type: 'dagNode',
      position: { x: 850, y: 80 },
      data: {
        label: 'Notify Success',
        type: 'slack',
        category: 'notify',
        configured: false,
        config: {
          slackConnId: 'slack_default',
          channel: '#data-quality',
          message: ':white_check_mark: Data quality checks passed for {{ ds }}',
        },
      },
    },
    {
      id: 'template_quarantine_1',
      type: 'dagNode',
      position: { x: 850, y: 180 },
      data: {
        label: 'Quarantine Data',
        type: 'python',
        category: 'action',
        configured: false,
        config: {
          pythonCallable: 'move_to_quarantine',
          opKwargs: '{"source": "s3://data-lake/processed/{{ ds }}/", "dest": "s3://data-lake/quarantine/{{ ds }}/"}',
        },
      },
    },
    {
      id: 'template_alert_1',
      type: 'dagNode',
      position: { x: 1100, y: 180 },
      data: {
        label: 'Alert Team',
        type: 'pagerduty',
        category: 'notify',
        configured: false,
        config: {
          pagerdutyConnId: 'pagerduty_default',
          summary: 'Data Quality Check Failed',
          severity: 'warning',
          deduplicationKey: 'dq-{{ ds }}',
        },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_sensor_1', target: 'template_ge_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_ge_1', target: 'template_branch_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_branch_1', target: 'template_success_1', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } },
    { id: 'e3-5', source: 'template_branch_1', target: 'template_quarantine_1', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
    { id: 'e5-6', source: 'template_quarantine_1', target: 'template_alert_1', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
  ],
  suggestedConfig: {
    schedule: { type: 'cron', cron: '0 7 * * *' },
    tags: ['data-quality', 'great-expectations'],
  },
};
