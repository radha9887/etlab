import type { DagNodeType } from '../../../types';
import { formatDict } from '../helpers';

type CloseTaskFn = () => void;

// Generate code for core operators (built-in Airflow)
export const generateCoreOperatorCode = (
  type: DagNodeType,
  taskId: string,
  config: any,
  lines: string[],
  closeTask: CloseTaskFn
): boolean => {
  switch (type) {
    case 'etl_task':
      lines.push(`    ${taskId} = SparkSubmitOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        application="{{ var.value.etl_scripts_path }}/${config.pageName || 'etl_job'}.py",`);
      lines.push(`        conn_id="spark_default",`);
      if (config.driverMemory) {
        lines.push(`        driver_memory="${config.driverMemory}",`);
      }
      if (config.executorMemory) {
        lines.push(`        executor_memory="${config.executorMemory}",`);
      }
      closeTask();
      return true;

    case 'spark_submit':
      lines.push(`    ${taskId} = SparkSubmitOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        application="${config.application || ''}",`);
      lines.push(`        conn_id="spark_default",`);
      if (config.sparkConfig?.driverMemory) {
        lines.push(`        driver_memory="${config.sparkConfig.driverMemory}",`);
      }
      if (config.sparkConfig?.executorMemory) {
        lines.push(`        executor_memory="${config.sparkConfig.executorMemory}",`);
      }
      if (config.sparkConfig?.executorCores) {
        lines.push(`        executor_cores=${config.sparkConfig.executorCores},`);
      }
      if (config.sparkConfig?.numExecutors) {
        lines.push(`        num_executors=${config.sparkConfig.numExecutors},`);
      }
      if (config.applicationArgs?.length > 0) {
        lines.push(`        application_args=${JSON.stringify(config.applicationArgs)},`);
      }
      closeTask();
      return true;

    case 'python':
      // First define the callable function
      const funcName = config.pythonCallable || 'execute';
      if (config.pythonCode) {
        lines.push(`    # Python callable for ${taskId}`);
        const codeLines = config.pythonCode.split('\n');
        codeLines.forEach((line: string) => {
          lines.push(`    ${line}`);
        });
        lines.push('');
      }

      lines.push(`    ${taskId} = PythonOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        python_callable=${funcName},`);
      if (config.opKwargs && Object.keys(config.opKwargs).length > 0) {
        lines.push(`        op_kwargs=${formatDict(config.opKwargs, 12)},`);
      }
      closeTask();
      return true;

    case 'bash':
      lines.push(`    ${taskId} = BashOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        bash_command="""${config.bashCommand || 'echo "Hello"'}""",`);
      if (config.cwd) {
        lines.push(`        cwd="${config.cwd}",`);
      }
      if (config.env && Object.keys(config.env).length > 0) {
        lines.push(`        env=${formatDict(config.env, 12)},`);
      }
      closeTask();
      return true;

    case 'file_sensor':
      lines.push(`    ${taskId} = FileSensor(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        filepath="${config.filepath || ''}",`);
      lines.push(`        poke_interval=${config.pokeIntervalSeconds || 60},`);
      lines.push(`        timeout=${config.timeoutSeconds || 3600},`);
      lines.push(`        mode="${config.mode || 'poke'}",`);
      lines.push(`        soft_fail=${config.softFail ? 'True' : 'False'},`);
      if (config.deferrable) {
        lines.push(`        deferrable=True,`);
      }
      if (config.exponentialBackoff) {
        lines.push(`        exponential_backoff=True,`);
      }
      closeTask();
      return true;

    case 's3_sensor':
      lines.push(`    ${taskId} = S3KeySensor(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        bucket_name="${config.bucketName || ''}",`);
      lines.push(`        bucket_key="${config.bucketKey || ''}",`);
      lines.push(`        wildcard_match=${config.wildcardMatch ? 'True' : 'False'},`);
      if (config.awsConnId) {
        lines.push(`        aws_conn_id="${config.awsConnId}",`);
      }
      lines.push(`        poke_interval=${config.pokeIntervalSeconds || 300},`);
      lines.push(`        timeout=${config.timeoutSeconds || 7200},`);
      if (config.deferrable) {
        lines.push(`        deferrable=True,`);
      }
      if (config.exponentialBackoff) {
        lines.push(`        exponential_backoff=True,`);
      }
      if (config.softFail) {
        lines.push(`        soft_fail=True,`);
      }
      closeTask();
      return true;

    case 'sql_sensor':
      lines.push(`    ${taskId} = SqlSensor(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        conn_id="${config.connId || 'default_conn'}",`);
      lines.push(`        sql="""${config.sql || 'SELECT 1'}""",`);
      lines.push(`        poke_interval=${config.pokeIntervalSeconds || 120},`);
      lines.push(`        timeout=${config.timeoutSeconds || 3600},`);
      if (config.deferrable) {
        lines.push(`        deferrable=True,`);
      }
      if (config.exponentialBackoff) {
        lines.push(`        exponential_backoff=True,`);
      }
      closeTask();
      return true;

    case 'http_sensor':
      lines.push(`    ${taskId} = HttpSensor(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        http_conn_id="http_default",`);
      lines.push(`        endpoint="${config.endpoint || ''}",`);
      lines.push(`        method="${config.method || 'GET'}",`);
      lines.push(`        poke_interval=${config.pokeIntervalSeconds || 30},`);
      lines.push(`        timeout=${config.timeoutSeconds || 1800},`);
      if (config.deferrable) {
        lines.push(`        deferrable=True,`);
      }
      if (config.exponentialBackoff) {
        lines.push(`        exponential_backoff=True,`);
      }
      closeTask();
      return true;

    case 'external_sensor':
      lines.push(`    ${taskId} = ExternalTaskSensor(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        external_dag_id="${config.externalDagId || ''}",`);
      lines.push(`        poke_interval=${config.pokeIntervalSeconds || 60},`);
      lines.push(`        timeout=${config.timeoutSeconds || 3600},`);
      if (config.deferrable) {
        lines.push(`        deferrable=True,`);
      }
      if (config.exponentialBackoff) {
        lines.push(`        exponential_backoff=True,`);
      }
      closeTask();
      return true;

    case 'branch':
      // Generate branch function
      lines.push(`    # Branch logic for ${taskId}`);
      lines.push(`    def branch_${taskId}(**kwargs):`);
      lines.push(`        ti = kwargs['ti']`);
      if (config.conditions?.length > 0) {
        config.conditions.forEach((cond: any) => {
          lines.push(`        if ${cond.expression}:`);
          lines.push(`            return "${cond.targetTaskId}"`);
        });
      }
      lines.push(`        return "${config.defaultTaskId || 'default'}"`);
      lines.push('');
      lines.push(`    ${taskId} = BranchPythonOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        python_callable=branch_${taskId},`);
      closeTask();
      return true;

    case 'trigger_dag':
      lines.push(`    ${taskId} = TriggerDagRunOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        trigger_dag_id="${config.triggerDagId || ''}",`);
      lines.push(`        wait_for_completion=${config.waitForCompletion ? 'True' : 'False'},`);
      closeTask();
      return true;

    case 'dummy':
      lines.push(`    ${taskId} = EmptyOperator(`);
      lines.push(`        task_id="${taskId}",`);
      closeTask();
      return true;

    case 'email':
      lines.push(`    ${taskId} = EmailOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        to="${config.to || ''}",`);
      lines.push(`        subject="${config.subject || ''}",`);
      lines.push(`        html_content="""${config.htmlContent || ''}""",`);
      closeTask();
      return true;

    case 'slack':
      lines.push(`    ${taskId} = SlackWebhookOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        slack_webhook_conn_id="${config.slackConnId || 'slack_default'}",`);
      if (config.channel) {
        lines.push(`        channel="${config.channel}",`);
      }
      lines.push(`        message="${config.message || ''}",`);
      closeTask();
      return true;

    case 'sql_execute':
      lines.push(`    ${taskId} = SQLExecuteQueryOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        conn_id="${config.connId || 'default_conn'}",`);
      lines.push(`        sql="""${config.sql || ''}""",`);
      closeTask();
      return true;

    // Cloud Storage & Data Sensors (multi-cloud)
    case 'gcs_sensor':
      lines.push(`    ${taskId} = GCSObjectExistenceSensor(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        bucket="${config.bucket || ''}",`);
      lines.push(`        object="${config.object || ''}",`);
      if (config.gcpConnId) {
        lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
      }
      lines.push(`        poke_interval=${config.pokeIntervalSeconds || 300},`);
      lines.push(`        timeout=${config.timeoutSeconds || 7200},`);
      lines.push(`        mode="${config.mode || 'poke'}",`);
      if (config.deferrable) {
        lines.push(`        deferrable=True,`);
      }
      if (config.exponentialBackoff) {
        lines.push(`        exponential_backoff=True,`);
      }
      if (config.softFail) {
        lines.push(`        soft_fail=True,`);
      }
      closeTask();
      return true;

    case 'azure_blob_sensor':
      lines.push(`    ${taskId} = WasbBlobSensor(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        container_name="${config.containerName || ''}",`);
      lines.push(`        blob_name="${config.blobName || ''}",`);
      if (config.wasb_conn_id) {
        lines.push(`        wasb_conn_id="${config.wasb_conn_id}",`);
      }
      lines.push(`        poke_interval=${config.pokeIntervalSeconds || 300},`);
      lines.push(`        timeout=${config.timeoutSeconds || 7200},`);
      if (config.deferrable) {
        lines.push(`        deferrable=True,`);
      }
      if (config.exponentialBackoff) {
        lines.push(`        exponential_backoff=True,`);
      }
      if (config.softFail) {
        lines.push(`        soft_fail=True,`);
      }
      closeTask();
      return true;

    case 'snowflake':
      lines.push(`    ${taskId} = SnowflakeOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        snowflake_conn_id="${config.snowflakeConnId || 'snowflake_default'}",`);
      lines.push(`        sql="""${config.sql || ''}""",`);
      if (config.warehouse) {
        lines.push(`        warehouse="${config.warehouse}",`);
      }
      if (config.database) {
        lines.push(`        database="${config.database}",`);
      }
      if (config.schema) {
        lines.push(`        schema="${config.schema}",`);
      }
      if (config.role) {
        lines.push(`        role="${config.role}",`);
      }
      closeTask();
      return true;

    case 'delta_sensor':
      lines.push(`    ${taskId} = DatabricksSqlSensor(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        databricks_conn_id="${config.databricksConnId || 'databricks_default'}",`);
      lines.push(`        sql="""SELECT COUNT(*) FROM ${config.tablePath || ''} WHERE ${config.condition || '1=1'}""",`);
      lines.push(`        poke_interval=${config.pokeIntervalSeconds || 300},`);
      lines.push(`        timeout=${config.timeoutSeconds || 7200},`);
      if (config.deferrable) {
        lines.push(`        deferrable=True,`);
      }
      if (config.exponentialBackoff) {
        lines.push(`        exponential_backoff=True,`);
      }
      if (config.softFail) {
        lines.push(`        soft_fail=True,`);
      }
      closeTask();
      return true;

    default:
      return false;
  }
};
