import type { DagNodeType } from '../../../types';

// Other provider imports (multi-cloud, data quality, integration, notifications)
export const getOtherImports = (type: DagNodeType): string[] => {
  const imports: string[] = [];

  switch (type) {
    // Multi-cloud / Generic
    case 'kubernetes_pod':
      imports.push('from airflow.providers.cncf.kubernetes.operators.pod import KubernetesPodOperator');
      break;
    case 'databricks':
      imports.push('from airflow.providers.databricks.operators.databricks import DatabricksRunNowOperator');
      break;
    case 'snowflake':
      imports.push('from airflow.providers.snowflake.operators.snowflake import SnowflakeOperator');
      break;
    case 'delta_sensor':
      imports.push('from airflow.providers.databricks.sensors.databricks_sql import DatabricksSqlSensor');
      break;

    // Data Quality & Transformation
    case 'dbt_cloud':
      imports.push('from airflow.providers.dbt.cloud.operators.dbt import DbtCloudRunJobOperator');
      imports.push('from airflow.providers.dbt.cloud.sensors.dbt import DbtCloudJobRunSensor');
      break;
    case 'dbt_core':
      imports.push('from airflow.operators.bash import BashOperator');
      break;
    case 'great_expectations':
      imports.push('from great_expectations_airflow.operators import GreatExpectationsOperator');
      break;
    case 'soda_core':
      imports.push('from airflow.operators.python import PythonOperator');
      break;

    // ELT Integration
    case 'airbyte':
      imports.push('from airflow.providers.airbyte.operators.airbyte import AirbyteTriggerSyncOperator');
      imports.push('from airflow.providers.airbyte.sensors.airbyte import AirbyteJobSensor');
      break;
    case 'fivetran':
      imports.push('from airflow.providers.fivetran.operators.fivetran import FivetranOperator');
      imports.push('from airflow.providers.fivetran.sensors.fivetran import FivetranSensor');
      break;

    // File Transfer & Messaging
    case 'sftp':
      imports.push('from airflow.providers.sftp.operators.sftp import SFTPOperator');
      imports.push('from airflow.providers.sftp.sensors.sftp import SFTPSensor');
      break;
    case 'ssh':
      imports.push('from airflow.providers.ssh.operators.ssh import SSHOperator');
      break;
    case 'kafka_produce':
      imports.push('from airflow.providers.apache.kafka.operators.produce import ProduceToTopicOperator');
      break;
    case 'kafka_consume':
      imports.push('from airflow.providers.apache.kafka.operators.consume import ConsumeFromTopicOperator');
      break;
    case 'trino':
      imports.push('from airflow.providers.trino.operators.trino import TrinoOperator');
      break;

    // Additional Notifications
    case 'ms_teams':
      imports.push('from airflow.providers.microsoft.mssql.operators.ms_teams import MSTeamsWebhookOperator');
      break;
    case 'pagerduty':
      imports.push('from airflow.providers.pagerduty.operators.pagerduty import PagerdutyCreateIncidentOperator');
      break;
    case 'opsgenie':
      imports.push('from airflow.providers.opsgenie.operators.opsgenie import OpsgenieCreateAlertOperator, OpsgenieCloseAlertOperator');
      break;
  }

  return imports;
};
