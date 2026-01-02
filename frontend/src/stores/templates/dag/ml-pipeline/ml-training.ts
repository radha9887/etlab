import type { DagTemplate } from '../../types';

export const mlTrainingTemplate: DagTemplate = {
  id: 'ml-training-dag',
  name: 'ML Training Pipeline',
  description: 'End-to-end ML training with data prep, training, and model registration',
  category: 'ml-pipeline',
  icon: 'brain',
  nodes: [
    {
      id: 'template_prep_1',
      type: 'dagNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Prepare Features',
        type: 'etl_task',
        category: 'etl',
        configured: false,
        config: {
          pageName: 'Feature Engineering',
          description: 'Prepare training features',
        },
      },
    },
    {
      id: 'template_split_1',
      type: 'dagNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Train/Test Split',
        type: 'python',
        category: 'action',
        configured: false,
        config: {
          pythonCallable: 'split_dataset',
          opKwargs: '{"test_size": 0.2, "random_state": 42}',
        },
      },
    },
    {
      id: 'template_train_1',
      type: 'dagNode',
      position: { x: 600, y: 100 },
      data: {
        label: 'Train Model',
        type: 'sagemaker',
        category: 'aws',
        configured: false,
        config: {
          awsConnId: 'aws_default',
          jobName: 'training-{{ ds_nodash }}',
          trainingImage: '',
          instanceType: 'ml.m5.xlarge',
          instanceCount: 1,
          waitForCompletion: true,
        },
      },
    },
    {
      id: 'template_eval_1',
      type: 'dagNode',
      position: { x: 600, y: 200 },
      data: {
        label: 'Evaluate Model',
        type: 'python',
        category: 'action',
        configured: false,
        config: {
          pythonCallable: 'evaluate_model',
          opKwargs: '{"metrics": ["accuracy", "f1", "auc"]}',
        },
      },
    },
    {
      id: 'template_branch_1',
      type: 'dagNode',
      position: { x: 850, y: 150 },
      data: {
        label: 'Check Metrics',
        type: 'branch',
        category: 'control',
        configured: false,
        config: {
          pythonCallable: 'check_model_quality',
          conditions: [
            { label: 'Pass', targetTaskId: 'register_model' },
            { label: 'Fail', targetTaskId: 'notify_failure' },
          ],
        },
      },
    },
    {
      id: 'template_register_1',
      type: 'dagNode',
      position: { x: 1100, y: 100 },
      data: {
        label: 'Register Model',
        type: 'python',
        category: 'action',
        configured: false,
        config: {
          pythonCallable: 'register_model',
          opKwargs: '{"registry": "mlflow"}',
        },
      },
    },
    {
      id: 'template_notify_1',
      type: 'dagNode',
      position: { x: 1100, y: 200 },
      data: {
        label: 'Notify Failure',
        type: 'slack',
        category: 'notify',
        configured: false,
        config: {
          slackConnId: 'slack_default',
          channel: '#ml-alerts',
          message: ':x: Model training failed quality checks for {{ ds }}',
        },
      },
    },
    {
      id: 'template_notify_2',
      type: 'dagNode',
      position: { x: 1350, y: 100 },
      data: {
        label: 'Notify Success',
        type: 'slack',
        category: 'notify',
        configured: false,
        config: {
          slackConnId: 'slack_default',
          channel: '#ml-alerts',
          message: ':white_check_mark: Model registered successfully for {{ ds }}',
        },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_prep_1', target: 'template_split_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_split_1', target: 'template_train_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-4', source: 'template_split_1', target: 'template_eval_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-5', source: 'template_train_1', target: 'template_branch_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e4-5', source: 'template_eval_1', target: 'template_branch_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e5-6', source: 'template_branch_1', target: 'template_register_1', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } },
    { id: 'e5-7', source: 'template_branch_1', target: 'template_notify_1', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
    { id: 'e6-8', source: 'template_register_1', target: 'template_notify_2', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } },
  ],
  suggestedConfig: {
    schedule: { type: 'cron', cron: '0 0 * * 0' },
    tags: ['ml', 'training'],
  },
};
