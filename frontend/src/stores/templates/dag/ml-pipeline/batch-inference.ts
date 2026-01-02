import type { DagTemplate } from '../../types';

export const batchInferenceTemplate: DagTemplate = {
  id: 'batch-inference-dag',
  name: 'Batch Inference Pipeline',
  description: 'Run batch predictions with a deployed model',
  category: 'ml-pipeline',
  icon: 'zap',
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
          bucketName: 'ml-input-data',
          bucketKey: 'batch/{{ ds }}/',
          wildcardMatch: true,
          timeoutSeconds: 3600,
        },
      },
    },
    {
      id: 'template_prep_1',
      type: 'dagNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Prepare Input',
        type: 'etl_task',
        category: 'etl',
        configured: false,
        config: {
          pageName: 'Inference Prep',
          description: 'Prepare data for inference',
        },
      },
    },
    {
      id: 'template_infer_1',
      type: 'dagNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Run Predictions',
        type: 'sagemaker',
        category: 'aws',
        configured: false,
        config: {
          awsConnId: 'aws_default',
          jobType: 'transform',
          modelName: 'my-model',
          inputPath: 's3://ml-input-data/batch/{{ ds }}/',
          outputPath: 's3://ml-output-data/predictions/{{ ds }}/',
          instanceType: 'ml.m5.xlarge',
          instanceCount: 2,
          waitForCompletion: true,
        },
      },
    },
    {
      id: 'template_load_1',
      type: 'dagNode',
      position: { x: 850, y: 150 },
      data: {
        label: 'Load Predictions',
        type: 'etl_task',
        category: 'etl',
        configured: false,
        config: {
          pageName: 'Load Predictions',
          description: 'Load predictions to warehouse',
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
          channel: '#ml-predictions',
          message: 'Batch predictions completed for {{ ds }}',
        },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_sensor_1', target: 'template_prep_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_prep_1', target: 'template_infer_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_infer_1', target: 'template_load_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e4-5', source: 'template_load_1', target: 'template_notify_1', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } },
  ],
  suggestedConfig: {
    schedule: { type: 'cron', cron: '0 6 * * *' },
    tags: ['ml', 'inference', 'batch'],
  },
};
