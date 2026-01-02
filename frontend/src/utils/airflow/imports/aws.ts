import type { DagNodeType } from '../../../types';

// AWS provider imports
export const getAwsImports = (type: DagNodeType): string[] => {
  const imports: string[] = [];

  switch (type) {
    case 'emr':
      imports.push('from airflow.providers.amazon.aws.operators.emr import EmrAddStepsOperator');
      imports.push('from airflow.providers.amazon.aws.sensors.emr import EmrStepSensor');
      break;
    case 'redshift':
      imports.push('from airflow.providers.amazon.aws.operators.redshift_sql import RedshiftSQLOperator');
      break;
    case 'athena':
      imports.push('from airflow.providers.amazon.aws.operators.athena import AthenaOperator');
      break;
    case 'glue_job':
      imports.push('from airflow.providers.amazon.aws.operators.glue import GlueJobOperator');
      imports.push('from airflow.providers.amazon.aws.sensors.glue import GlueJobSensor');
      break;
    case 'glue_crawler':
      imports.push('from airflow.providers.amazon.aws.operators.glue_crawler import GlueCrawlerOperator');
      break;
    case 'glue_databrew':
      imports.push('from airflow.providers.amazon.aws.operators.glue_databrew import GlueDataBrewStartJobRunOperator');
      break;
    case 'lambda':
      imports.push('from airflow.providers.amazon.aws.operators.lambda_function import LambdaInvokeFunctionOperator');
      break;
    case 'step_function':
      imports.push('from airflow.providers.amazon.aws.operators.step_function import StepFunctionStartExecutionOperator');
      imports.push('from airflow.providers.amazon.aws.sensors.step_function import StepFunctionExecutionSensor');
      break;
    case 'ecs':
      imports.push('from airflow.providers.amazon.aws.operators.ecs import EcsRunTaskOperator');
      break;
    case 'eks':
      imports.push('from airflow.providers.amazon.aws.operators.eks import EksPodOperator');
      break;
    case 'batch':
      imports.push('from airflow.providers.amazon.aws.operators.batch import BatchOperator');
      break;
    case 'sagemaker':
      imports.push('from airflow.providers.amazon.aws.operators.sagemaker import SageMakerTrainingOperator');
      break;
    case 'sns':
      imports.push('from airflow.providers.amazon.aws.operators.sns import SnsPublishOperator');
      break;
    case 'sqs':
      imports.push('from airflow.providers.amazon.aws.operators.sqs import SqsPublishOperator');
      break;
    case 'eventbridge':
      imports.push('from airflow.providers.amazon.aws.operators.eventbridge import EventBridgePutEventsOperator');
      break;
    case 'dynamodb':
      imports.push('from airflow.providers.amazon.aws.operators.dynamodb import DynamoDBToS3Operator');
      imports.push('from airflow.providers.amazon.aws.hooks.dynamodb import DynamoDBHook');
      break;
    case 'rds':
      imports.push('from airflow.providers.amazon.aws.operators.rds import RdsStartExportTaskOperator');
      break;
    case 'cloudformation':
      imports.push('from airflow.providers.amazon.aws.operators.cloud_formation import CloudFormationCreateStackOperator');
      imports.push('from airflow.providers.amazon.aws.operators.cloud_formation import CloudFormationDeleteStackOperator');
      break;
    case 'bedrock':
      imports.push('from airflow.providers.amazon.aws.operators.bedrock import BedrockInvokeModelOperator');
      break;
    case 's3':
      imports.push('from airflow.providers.amazon.aws.operators.s3 import S3CopyObjectOperator');
      imports.push('from airflow.providers.amazon.aws.operators.s3 import S3DeleteObjectsOperator');
      break;
    case 'kinesis':
      imports.push('from airflow.providers.amazon.aws.hooks.kinesis import KinesisHook');
      break;
    case 'appflow':
      imports.push('from airflow.providers.amazon.aws.operators.appflow import AppflowRunOperator');
      break;
    case 'comprehend':
      imports.push('from airflow.providers.amazon.aws.operators.comprehend import ComprehendStartPiiEntitiesDetectionJobOperator');
      break;
    case 'datasync':
      imports.push('from airflow.providers.amazon.aws.operators.datasync import DataSyncOperator');
      break;
    case 'dms':
      imports.push('from airflow.providers.amazon.aws.operators.dms import DmsStartTaskOperator');
      break;
    case 'ec2':
      imports.push('from airflow.providers.amazon.aws.operators.ec2 import EC2StartInstanceOperator');
      imports.push('from airflow.providers.amazon.aws.operators.ec2 import EC2StopInstanceOperator');
      break;
    case 'ssm':
      imports.push('from airflow.providers.amazon.aws.operators.ssm import SsmRunCommandOperator');
      break;
    case 'secrets_manager':
      imports.push('from airflow.providers.amazon.aws.hooks.secrets_manager import SecretsManagerHook');
      break;
    case 'cloudwatch':
      imports.push('from airflow.providers.amazon.aws.hooks.logs import AwsLogsHook');
      break;
  }

  return imports;
};
