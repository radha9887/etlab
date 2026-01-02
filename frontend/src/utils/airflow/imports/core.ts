import type { DagNodeType } from '../../../types';

// Core operator imports (built-in Airflow operators)
export const getCoreImports = (type: DagNodeType): string[] => {
  const imports: string[] = [];

  switch (type) {
    case 'etl_task':
    case 'spark_submit':
      imports.push('from airflow.providers.apache.spark.operators.spark_submit import SparkSubmitOperator');
      break;
    case 'python':
      imports.push('from airflow.operators.python import PythonOperator');
      break;
    case 'bash':
      imports.push('from airflow.operators.bash import BashOperator');
      break;
    case 'file_sensor':
      imports.push('from airflow.sensors.filesystem import FileSensor');
      break;
    case 's3_sensor':
      imports.push('from airflow.providers.amazon.aws.sensors.s3 import S3KeySensor');
      break;
    case 'sql_sensor':
      imports.push('from airflow.providers.common.sql.sensors.sql import SqlSensor');
      break;
    case 'http_sensor':
      imports.push('from airflow.providers.http.sensors.http import HttpSensor');
      break;
    case 'external_sensor':
      imports.push('from airflow.sensors.external_task import ExternalTaskSensor');
      break;
    case 'branch':
      imports.push('from airflow.operators.python import BranchPythonOperator');
      break;
    case 'trigger_dag':
      imports.push('from airflow.operators.trigger_dagrun import TriggerDagRunOperator');
      break;
    case 'dummy':
      imports.push('from airflow.operators.empty import EmptyOperator');
      break;
    case 'email':
      imports.push('from airflow.operators.email import EmailOperator');
      break;
    case 'slack':
      imports.push('from airflow.providers.slack.operators.slack_webhook import SlackWebhookOperator');
      break;
    case 'sql_execute':
      imports.push('from airflow.providers.common.sql.operators.sql import SQLExecuteQueryOperator');
      break;
  }

  return imports;
};
