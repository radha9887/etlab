import type { DagNodeType } from '../../../types';
import { formatDict } from '../helpers';

type CloseTaskFn = () => void;

// Generate code for other operators (multi-cloud, data quality, integration, notifications)
export const generateOtherOperatorCode = (
  type: DagNodeType,
  taskId: string,
  config: any,
  lines: string[],
  closeTask: CloseTaskFn
): boolean => {
  switch (type) {
    case 'kubernetes_pod':
      lines.push(`    ${taskId} = KubernetesPodOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        name="${config.podName || taskId}",`);
      lines.push(`        namespace="${config.namespace || 'default'}",`);
      lines.push(`        image="${config.image || ''}",`);
      if (config.cmds?.length > 0) {
        lines.push(`        cmds=${JSON.stringify(config.cmds)},`);
      }
      if (config.arguments?.length > 0) {
        lines.push(`        arguments=${JSON.stringify(config.arguments)},`);
      }
      if (config.envVars && Object.keys(config.envVars).length > 0) {
        lines.push(`        env_vars=${formatDict(config.envVars, 12)},`);
      }
      if (config.resources) {
        lines.push(`        container_resources=k8s.V1ResourceRequirements(`);
        if (config.resources.requests) {
          lines.push(`            requests={"cpu": "${config.resources.requests.cpu || '100m'}", "memory": "${config.resources.requests.memory || '256Mi'}"},`);
        }
        if (config.resources.limits) {
          lines.push(`            limits={"cpu": "${config.resources.limits.cpu || '1'}", "memory": "${config.resources.limits.memory || '1Gi'}"},`);
        }
        lines.push(`        ),`);
      }
      lines.push(`        get_logs=True,`);
      lines.push(`        is_delete_operator_pod=${config.deleteOnCompletion !== false ? 'True' : 'False'},`);
      closeTask();
      return true;

    case 'databricks':
      lines.push(`    ${taskId} = DatabricksRunNowOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        databricks_conn_id="${config.databricksConnId || 'databricks_default'}",`);
      lines.push(`        job_id=${config.jobId || 0},`);
      if (config.notebookParams && Object.keys(config.notebookParams).length > 0) {
        lines.push(`        notebook_params=${formatDict(config.notebookParams, 12)},`);
      }
      if (config.pythonParams?.length > 0) {
        lines.push(`        python_params=${JSON.stringify(config.pythonParams)},`);
      }
      if (config.sparkSubmitParams?.length > 0) {
        lines.push(`        spark_submit_params=${JSON.stringify(config.sparkSubmitParams)},`);
      }
      closeTask();
      return true;

    // Data Quality & Transformation
    case 'dbt_cloud':
      lines.push(`    ${taskId} = DbtCloudRunJobOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        dbt_cloud_conn_id="${config.dbtCloudConnId || 'dbt_cloud_default'}",`);
      lines.push(`        job_id=${config.jobId || 0},`);
      if (config.accountId) {
        lines.push(`        account_id=${config.accountId},`);
      }
      if (config.cause) {
        lines.push(`        cause="${config.cause}",`);
      }
      if (config.waitForTermination !== false) {
        lines.push(`        wait_for_termination=True,`);
      }
      if (config.schemaOverride) {
        lines.push(`        schema_override="${config.schemaOverride}",`);
      }
      closeTask();
      return true;

    case 'dbt_core':
      lines.push(`    ${taskId} = BashOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        bash_command="${config.dbtCommand || 'dbt run'}",`);
      if (config.projectDir) {
        lines.push(`        cwd="${config.projectDir}",`);
      }
      if (config.profilesDir) {
        lines.push(`        env={"DBT_PROFILES_DIR": "${config.profilesDir}"},`);
      }
      closeTask();
      return true;

    case 'great_expectations':
      lines.push(`    ${taskId} = GreatExpectationsOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        data_context_root_dir="${config.dataContextRoot || '/opt/airflow/great_expectations'}",`);
      lines.push(`        expectation_suite_name="${config.expectationSuite || ''}",`);
      if (config.dataAssetName) {
        lines.push(`        data_asset_name="${config.dataAssetName}",`);
      }
      if (config.checkpointName) {
        lines.push(`        checkpoint_name="${config.checkpointName}",`);
      }
      if (config.failTaskOnValidationFailure !== false) {
        lines.push(`        fail_task_on_validation_failure=True,`);
      }
      closeTask();
      return true;

    case 'soda_core':
      lines.push(`    def run_soda_scan_${taskId}():`);
      lines.push(`        from soda.scan import Scan`);
      lines.push(`        scan = Scan()`);
      lines.push(`        scan.set_scan_definition_name("${config.scanName || 'airflow_scan'}")`);
      lines.push(`        scan.set_data_source_name("${config.dataSource || ''}")`);
      if (config.checksPath) {
        lines.push(`        scan.add_sodacl_yaml_file("${config.checksPath}")`);
      }
      lines.push(`        scan.execute()`);
      lines.push(`        if scan.has_check_fails():`);
      lines.push(`            raise Exception("Soda scan failed")`);
      lines.push(`    `);
      lines.push(`    ${taskId} = PythonOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        python_callable=run_soda_scan_${taskId},`);
      closeTask();
      return true;

    // ELT Integration
    case 'airbyte':
      lines.push(`    ${taskId} = AirbyteTriggerSyncOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        airbyte_conn_id="${config.airbyteConnId || 'airbyte_default'}",`);
      lines.push(`        connection_id="${config.connectionId || ''}",`);
      if (config.waitForCompletion !== false) {
        lines.push(`        asynchronous=False,`);
      } else {
        lines.push(`        asynchronous=True,`);
      }
      if (config.timeout) {
        lines.push(`        timeout=${config.timeout},`);
      }
      closeTask();
      return true;

    case 'fivetran':
      lines.push(`    ${taskId} = FivetranOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        fivetran_conn_id="${config.fivetranConnId || 'fivetran_default'}",`);
      lines.push(`        connector_id="${config.connectorId || ''}",`);
      if (config.waitForCompletion !== false) {
        lines.push(`        wait_for_completion=True,`);
      }
      if (config.pollFrequency) {
        lines.push(`        poll_frequency=${config.pollFrequency},`);
      }
      closeTask();
      return true;

    // File Transfer & Messaging
    case 'sftp':
      if (config.operation === 'get') {
        lines.push(`    ${taskId} = SFTPOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        ssh_conn_id="${config.sshConnId || 'ssh_default'}",`);
        lines.push(`        operation="get",`);
        lines.push(`        remote_filepath="${config.remotePath || ''}",`);
        lines.push(`        local_filepath="${config.localPath || ''}",`);
        if (config.createIntermediateDirs) {
          lines.push(`        create_intermediate_dirs=True,`);
        }
        closeTask();
      } else if (config.operation === 'put') {
        lines.push(`    ${taskId} = SFTPOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        ssh_conn_id="${config.sshConnId || 'ssh_default'}",`);
        lines.push(`        operation="put",`);
        lines.push(`        local_filepath="${config.localPath || ''}",`);
        lines.push(`        remote_filepath="${config.remotePath || ''}",`);
        if (config.createIntermediateDirs) {
          lines.push(`        create_intermediate_dirs=True,`);
        }
        closeTask();
      } else {
        lines.push(`    ${taskId} = SFTPOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        ssh_conn_id="${config.sshConnId || 'ssh_default'}",`);
        lines.push(`        operation="${config.operation || 'get'}",`);
        lines.push(`        remote_filepath="${config.remotePath || ''}",`);
        closeTask();
      }
      return true;

    case 'ssh':
      lines.push(`    ${taskId} = SSHOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        ssh_conn_id="${config.sshConnId || 'ssh_default'}",`);
      lines.push(`        command="${config.command || ''}",`);
      if (config.timeout) {
        lines.push(`        conn_timeout=${config.timeout},`);
      }
      if (config.cmdTimeout) {
        lines.push(`        cmd_timeout=${config.cmdTimeout},`);
      }
      if (config.environment) {
        lines.push(`        environment=${config.environment},`);
      }
      if (config.getOutput) {
        lines.push(`        do_xcom_push=True,`);
      }
      closeTask();
      return true;

    case 'kafka_produce':
      lines.push(`    ${taskId} = ProduceToTopicOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        kafka_config_id="${config.kafkaConnId || 'kafka_default'}",`);
      lines.push(`        topic="${config.topic || ''}",`);
      lines.push(`        producer_function=lambda: ${config.messages || '[]'},`);
      if (config.acks) {
        lines.push(`        acks="${config.acks}",`);
      }
      if (config.compression && config.compression !== 'none') {
        lines.push(`        compression_type="${config.compression}",`);
      }
      closeTask();
      return true;

    case 'kafka_consume':
      lines.push(`    ${taskId} = ConsumeFromTopicOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        kafka_config_id="${config.kafkaConnId || 'kafka_default'}",`);
      lines.push(`        topics=["${config.topics || ''}"],`);
      lines.push(`        max_messages=${config.maxMessages || 100},`);
      if (config.consumerGroup) {
        lines.push(`        group_id="${config.consumerGroup}",`);
      }
      if (config.autoOffsetReset) {
        lines.push(`        auto_offset_reset="${config.autoOffsetReset}",`);
      }
      if (config.commitOnComplete !== false) {
        lines.push(`        commit_cadence="end_of_batch",`);
      }
      closeTask();
      return true;

    case 'trino':
      lines.push(`    ${taskId} = TrinoOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        trino_conn_id="${config.trinoConnId || 'trino_default'}",`);
      lines.push(`        sql="""${config.sql || ''}""",`);
      if (config.catalog) {
        lines.push(`        catalog="${config.catalog}",`);
      }
      if (config.schema) {
        lines.push(`        schema="${config.schema}",`);
      }
      if (config.handler && config.handler !== 'list') {
        lines.push(`        handler="${config.handler}",`);
      }
      closeTask();
      return true;

    // Additional Notifications
    case 'ms_teams':
      lines.push(`    ${taskId} = MSTeamsWebhookOperator(`);
      lines.push(`        task_id="${taskId}",`);
      if (config.teamsConnId) {
        lines.push(`        http_conn_id="${config.teamsConnId}",`);
      }
      if (config.webhookUrl) {
        lines.push(`        webhook_url="${config.webhookUrl}",`);
      }
      lines.push(`        message="${config.message || ''}",`);
      if (config.title) {
        lines.push(`        subtitle="${config.title}",`);
      }
      if (config.themeColor) {
        lines.push(`        theme_color="${config.themeColor}",`);
      }
      if (config.buttonText && config.buttonUrl) {
        lines.push(`        button_text="${config.buttonText}",`);
        lines.push(`        button_url="${config.buttonUrl}",`);
      }
      closeTask();
      return true;

    case 'pagerduty':
      lines.push(`    ${taskId} = PagerdutyCreateIncidentOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        pagerduty_conn_id="${config.pagerdutyConnId || 'pagerduty_default'}",`);
      lines.push(`        summary="${config.summary || ''}",`);
      lines.push(`        severity="${config.severity || 'error'}",`);
      if (config.source) {
        lines.push(`        source="${config.source}",`);
      }
      if (config.dedupKey) {
        lines.push(`        dedup_key="${config.dedupKey}",`);
      }
      if (config.component) {
        lines.push(`        component="${config.component}",`);
      }
      if (config.group) {
        lines.push(`        group="${config.group}",`);
      }
      closeTask();
      return true;

    case 'opsgenie':
      if (config.closeAlert) {
        lines.push(`    ${taskId} = OpsgenieCloseAlertOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        opsgenie_conn_id="${config.opsgenieConnId || 'opsgenie_default'}",`);
        lines.push(`        alias="${config.alias || ''}",`);
        if (config.note) {
          lines.push(`        note="${config.note}",`);
        }
        closeTask();
      } else {
        lines.push(`    ${taskId} = OpsgenieCreateAlertOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        opsgenie_conn_id="${config.opsgenieConnId || 'opsgenie_default'}",`);
        lines.push(`        message="${config.message || ''}",`);
        if (config.alias) {
          lines.push(`        alias="${config.alias}",`);
        }
        if (config.priority) {
          lines.push(`        priority="${config.priority}",`);
        }
        if (config.description) {
          lines.push(`        description="${config.description}",`);
        }
        if (config.tags) {
          lines.push(`        tags=${JSON.stringify(config.tags.split(',').map((t: string) => t.trim()))},`);
        }
        if (config.entity) {
          lines.push(`        entity="${config.entity}",`);
        }
        if (config.source) {
          lines.push(`        source="${config.source}",`);
        }
        closeTask();
      }
      return true;

    default:
      return false;
  }
};
