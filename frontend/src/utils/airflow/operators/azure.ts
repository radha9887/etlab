import type { DagNodeType } from '../../../types';

type CloseTaskFn = () => void;

// Generate code for Azure operators
export const generateAzureOperatorCode = (
  type: DagNodeType,
  taskId: string,
  config: any,
  lines: string[],
  closeTask: CloseTaskFn
): boolean => {
  switch (type) {
    case 'synapse':
      lines.push(`    ${taskId} = AzureSynapseRunSparkBatchOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        azure_synapse_conn_id="${config.synapseConnId || 'azure_synapse_default'}",`);
      lines.push(`        spark_pool="${config.sparkPool || ''}",`);
      lines.push(`        payload={`);
      lines.push(`            "name": "${config.jobName || taskId}",`);
      lines.push(`            "file": "${config.mainFile || ''}",`);
      if (config.className) {
        lines.push(`            "className": "${config.className}",`);
      }
      if (config.args?.length > 0) {
        lines.push(`            "args": ${JSON.stringify(config.args)},`);
      }
      lines.push(`            "driverMemory": "${config.driverMemory || '4g'}",`);
      lines.push(`            "driverCores": ${config.driverCores || 4},`);
      lines.push(`            "executorMemory": "${config.executorMemory || '4g'}",`);
      lines.push(`            "executorCores": ${config.executorCores || 4},`);
      lines.push(`            "numExecutors": ${config.numExecutors || 2},`);
      lines.push(`        },`);
      closeTask();
      return true;

    case 'adf':
      lines.push(`    ${taskId} = AzureDataFactoryRunPipelineOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        azure_data_factory_conn_id="${config.azureConnId || 'azure_data_factory_default'}",`);
      lines.push(`        resource_group_name="${config.resourceGroup || ''}",`);
      lines.push(`        factory_name="${config.factoryName || ''}",`);
      lines.push(`        pipeline_name="${config.pipelineName || ''}",`);
      if (config.parameters) {
        lines.push(`        parameters=${config.parameters},`);
      }
      if (config.waitForCompletion !== false) {
        lines.push(`        wait_for_termination=True,`);
      }
      closeTask();
      return true;

    case 'adls':
      lines.push(`    # ADLS operation using hook`);
      lines.push(`    def ${taskId}_operation(**context):`);
      lines.push(`        hook = AzureDataLakeStorageV2Hook(adls_conn_id="${config.azureDataLakeConnId || 'azure_data_lake_default'}")`);
      if (config.operation === 'upload') {
        lines.push(`        hook.upload_file(`);
        lines.push(`            file_system_name="${config.fileSystem || ''}",`);
        lines.push(`            file_name="${config.path || ''}",`);
        lines.push(`            file_path="${config.localPath || ''}",`);
        lines.push(`            overwrite=${config.overwrite ? 'True' : 'False'},`);
        lines.push(`        )`);
      } else if (config.operation === 'download') {
        lines.push(`        hook.download_file(`);
        lines.push(`            file_system_name="${config.fileSystem || ''}",`);
        lines.push(`            file_name="${config.path || ''}",`);
        lines.push(`            destination_path="${config.localPath || ''}",`);
        lines.push(`        )`);
      } else if (config.operation === 'delete') {
        lines.push(`        hook.delete_file(`);
        lines.push(`            file_system_name="${config.fileSystem || ''}",`);
        lines.push(`            file_name="${config.path || ''}",`);
        lines.push(`        )`);
      } else if (config.operation === 'list') {
        lines.push(`        return hook.list_file_system(`);
        lines.push(`            file_system_name="${config.fileSystem || ''}",`);
        lines.push(`            prefix="${config.directoryPath || ''}",`);
        lines.push(`        )`);
      }
      lines.push('');
      lines.push(`    ${taskId} = PythonOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        python_callable=${taskId}_operation,`);
      closeTask();
      return true;

    case 'aci':
      lines.push(`    ${taskId} = AzureContainerInstancesOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        ci_conn_id="${config.azureConnId || 'azure_default'}",`);
      lines.push(`        resource_group="${config.resourceGroup || ''}",`);
      lines.push(`        name="${config.containerGroupName || ''}",`);
      lines.push(`        image="${config.image || ''}",`);
      lines.push(`        region="${config.region || 'eastus'}",`);
      lines.push(`        cpu=${config.cpu || 1},`);
      lines.push(`        memory_in_gb=${config.memoryGb || 1.5},`);
      if (config.command) {
        lines.push(`        command=${config.command},`);
      }
      if (config.environmentVariables) {
        lines.push(`        environment_variables=${config.environmentVariables},`);
      }
      if (config.registryServer) {
        lines.push(`        registry_credentials={`);
        lines.push(`            "registry": "${config.registryServer}",`);
        lines.push(`        },`);
      }
      lines.push(`        remove_on_error=${config.removeOnError !== false ? 'True' : 'False'},`);
      lines.push(`        fail_if_exists=${config.failIfExists ? 'True' : 'False'},`);
      closeTask();
      return true;

    case 'azure_batch':
      lines.push(`    ${taskId} = AzureBatchOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        batch_pool_id="${config.poolId || ''}",`);
      lines.push(`        batch_job_id="${config.jobId || ''}",`);
      lines.push(`        batch_task_id="${config.taskId || taskId}",`);
      lines.push(`        batch_pool_vm_size="Standard_D2_v2",`);
      lines.push(`        command="${config.commandLine || ''}",`);
      if (config.containerImage) {
        lines.push(`        container_settings={"image": "${config.containerImage}"},`);
      }
      lines.push(`        azure_batch_conn_id="${config.azureBatchConnId || 'azure_batch_default'}",`);
      closeTask();
      return true;

    case 'service_bus':
      if (config.operation === 'send_message') {
        lines.push(`    ${taskId} = AzureServiceBusSendMessageOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        queue_name="${config.queueName || ''}",`);
        lines.push(`        message="""${config.messageBody || ''}""",`);
        lines.push(`        azure_service_bus_conn_id="${config.azureServiceBusConnId || 'azure_service_bus_default'}",`);
        closeTask();
      } else if (config.operation === 'receive_message') {
        lines.push(`    ${taskId} = AzureServiceBusReceiveMessageOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        queue_name="${config.queueName || ''}",`);
        lines.push(`        max_message_count=${config.maxMessages || 1},`);
        lines.push(`        azure_service_bus_conn_id="${config.azureServiceBusConnId || 'azure_service_bus_default'}",`);
        closeTask();
      } else if (config.operation === 'create_queue') {
        lines.push(`    ${taskId} = AzureServiceBusCreateQueueOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        queue_name="${config.queueName || ''}",`);
        lines.push(`        azure_service_bus_conn_id="${config.azureServiceBusConnId || 'azure_service_bus_default'}",`);
        closeTask();
      } else if (config.operation === 'delete_queue') {
        lines.push(`    ${taskId} = AzureServiceBusDeleteQueueOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        queue_name="${config.queueName || ''}",`);
        lines.push(`        azure_service_bus_conn_id="${config.azureServiceBusConnId || 'azure_service_bus_default'}",`);
        closeTask();
      }
      return true;

    case 'cosmos_db':
      if (config.operation === 'insert_document' || config.operation === 'upsert_document') {
        lines.push(`    ${taskId} = AzureCosmosInsertDocumentOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        database_name="${config.databaseName || ''}",`);
        lines.push(`        collection_name="${config.collectionName || ''}",`);
        lines.push(`        document=${config.document || '{}'},`);
        lines.push(`        azure_cosmos_conn_id="${config.azureCosmosConnId || 'azure_cosmos_default'}",`);
        closeTask();
      } else if (config.operation === 'query_documents') {
        lines.push(`    # Cosmos DB query using hook`);
        lines.push(`    def ${taskId}_operation(**context):`);
        lines.push(`        hook = AzureCosmosDBHook(azure_cosmos_conn_id="${config.azureCosmosConnId || 'azure_cosmos_default'}")`);
        lines.push(`        return hook.get_documents(`);
        lines.push(`            sql_string="""${config.query || ''}""",`);
        lines.push(`            database_name="${config.databaseName || ''}",`);
        lines.push(`            collection_name="${config.collectionName || ''}",`);
        lines.push(`        )`);
        lines.push('');
        lines.push(`    ${taskId} = PythonOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        python_callable=${taskId}_operation,`);
        closeTask();
      }
      return true;

    case 'data_explorer':
      lines.push(`    ${taskId} = AzureDataExplorerQueryOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        query="""${config.query || ''}""",`);
      lines.push(`        database="${config.database || ''}",`);
      lines.push(`        azure_data_explorer_conn_id="${config.azureDataExplorerConnId || 'azure_data_explorer_default'}",`);
      if (config.timeout) {
        lines.push(`        options={"servertimeout": timedelta(seconds=${config.timeout})},`);
      }
      closeTask();
      return true;

    case 'power_bi':
      lines.push(`    ${taskId} = PowerBIDatasetRefreshOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        dataset_id="${config.datasetId || ''}",`);
      lines.push(`        group_id="${config.groupId || ''}",`);
      lines.push(`        conn_id="${config.powerBiConnId || 'powerbi_default'}",`);
      if (config.waitForCompletion !== false) {
        lines.push(`        wait_for_termination=True,`);
      }
      closeTask();
      return true;

    default:
      return false;
  }
};
