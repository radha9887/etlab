import type { DagNodeType } from '../../../types';

// Azure provider imports
export const getAzureImports = (type: DagNodeType): string[] => {
  const imports: string[] = [];

  switch (type) {
    case 'azure_blob_sensor':
      imports.push('from airflow.providers.microsoft.azure.sensors.wasb import WasbBlobSensor');
      break;
    case 'synapse':
      imports.push('from airflow.providers.microsoft.azure.operators.synapse import AzureSynapseRunSparkBatchOperator');
      break;
    case 'adf':
      imports.push('from airflow.providers.microsoft.azure.operators.data_factory import AzureDataFactoryRunPipelineOperator');
      imports.push('from airflow.providers.microsoft.azure.sensors.data_factory import AzureDataFactoryPipelineRunStatusSensor');
      break;
    case 'adls':
      imports.push('from airflow.providers.microsoft.azure.operators.adls import ADLSCreateObjectOperator, ADLSDeleteOperator, ADLSListOperator');
      imports.push('from airflow.providers.microsoft.azure.hooks.data_lake import AzureDataLakeStorageV2Hook');
      break;
    case 'aci':
      imports.push('from airflow.providers.microsoft.azure.operators.container_instances import AzureContainerInstancesOperator');
      break;
    case 'azure_batch':
      imports.push('from airflow.providers.microsoft.azure.operators.batch import AzureBatchOperator');
      break;
    case 'service_bus':
      imports.push('from airflow.providers.microsoft.azure.operators.asb import AzureServiceBusSendMessageOperator, AzureServiceBusReceiveMessageOperator');
      imports.push('from airflow.providers.microsoft.azure.operators.asb import AzureServiceBusCreateQueueOperator, AzureServiceBusDeleteQueueOperator');
      break;
    case 'cosmos_db':
      imports.push('from airflow.providers.microsoft.azure.operators.cosmos import AzureCosmosInsertDocumentOperator');
      imports.push('from airflow.providers.microsoft.azure.hooks.cosmos import AzureCosmosDBHook');
      break;
    case 'data_explorer':
      imports.push('from airflow.providers.microsoft.azure.operators.adx import AzureDataExplorerQueryOperator');
      break;
    case 'power_bi':
      imports.push('from airflow.providers.microsoft.azure.operators.powerbi import PowerBIDatasetRefreshOperator');
      break;
  }

  return imports;
};
