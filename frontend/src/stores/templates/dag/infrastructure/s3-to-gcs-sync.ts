import type { DagTemplate } from '../../types';

export const s3ToGcsSyncTemplate: DagTemplate = {
  id: 's3-to-gcs-sync-dag',
  name: 'S3 to GCS Sync',
  description: 'Cross-cloud data synchronization from AWS S3 to Google Cloud Storage',
  category: 'infrastructure',
  icon: 'cloud',
  nodes: [
    {
      id: 'template_sensor_1',
      type: 'dagNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Check S3 Source',
        type: 's3_sensor',
        category: 'sensor',
        configured: false,
        config: {
          awsConnId: 'aws_default',
          bucketName: 'source-data',
          bucketKey: 'exports/{{ ds }}/',
          wildcardMatch: true,
          timeoutSeconds: 3600,
        },
      },
    },
    {
      id: 'template_list_1',
      type: 'dagNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'List S3 Objects',
        type: 'python',
        category: 'action',
        configured: false,
        config: {
          pythonCallable: 'list_s3_objects',
          opKwargs: '{"bucket": "source-data", "prefix": "exports/{{ ds }}/"}',
        },
      },
    },
    {
      id: 'template_sync_1',
      type: 'dagNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Sync to GCS',
        type: 'gcs',
        category: 'gcp',
        configured: false,
        config: {
          gcpConnId: 'google_cloud_default',
          operationType: 'sync',
          sourceBucket: 's3://source-data/exports/{{ ds }}/',
          destinationBucket: 'gs://destination-data/imports/{{ ds }}/',
        },
      },
    },
    {
      id: 'template_verify_1',
      type: 'dagNode',
      position: { x: 850, y: 150 },
      data: {
        label: 'Verify Sync',
        type: 'python',
        category: 'action',
        configured: false,
        config: {
          pythonCallable: 'verify_sync',
          opKwargs: '{"source_count": "{{ ti.xcom_pull(task_ids=\'list_s3_objects\') }}", "gcs_bucket": "destination-data"}',
        },
      },
    },
    {
      id: 'template_notify_1',
      type: 'dagNode',
      position: { x: 1100, y: 150 },
      data: {
        label: 'Notify Completion',
        type: 'slack',
        category: 'notify',
        configured: false,
        config: {
          slackConnId: 'slack_default',
          channel: '#cloud-sync',
          message: 'S3 to GCS sync completed for {{ ds }}',
        },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_sensor_1', target: 'template_list_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_list_1', target: 'template_sync_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_sync_1', target: 'template_verify_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e4-5', source: 'template_verify_1', target: 'template_notify_1', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } },
  ],
  suggestedConfig: {
    schedule: { type: 'cron', cron: '0 4 * * *' },
    tags: ['infrastructure', 'cloud-sync', 's3', 'gcs'],
  },
};
