import type { DagNodeType } from '../../../types';

// GCP provider imports
export const getGcpImports = (type: DagNodeType): string[] => {
  const imports: string[] = [];

  switch (type) {
    case 'gcs_sensor':
      imports.push('from airflow.providers.google.cloud.sensors.gcs import GCSObjectExistenceSensor');
      break;
    case 'dataproc':
      imports.push('from airflow.providers.google.cloud.operators.dataproc import DataprocSubmitJobOperator');
      break;
    case 'bigquery':
      imports.push('from airflow.providers.google.cloud.operators.bigquery import BigQueryInsertJobOperator');
      break;
    case 'gcs':
      imports.push('from airflow.providers.google.cloud.operators.gcs import GCSCreateBucketOperator, GCSDeleteBucketOperator, GCSDeleteObjectsOperator');
      imports.push('from airflow.providers.google.cloud.transfers.gcs_to_gcs import GCSToGCSOperator');
      break;
    case 'cloud_run':
      imports.push('from airflow.providers.google.cloud.operators.cloud_run import CloudRunExecuteJobOperator');
      break;
    case 'cloud_function':
      imports.push('from airflow.providers.google.cloud.operators.functions import CloudFunctionInvokeFunctionOperator');
      break;
    case 'gke':
      imports.push('from airflow.providers.google.cloud.operators.kubernetes_engine import GKEStartPodOperator');
      break;
    case 'compute_engine':
      imports.push('from airflow.providers.google.cloud.operators.compute import ComputeEngineStartInstanceOperator, ComputeEngineStopInstanceOperator');
      break;
    case 'dataflow':
      imports.push('from airflow.providers.google.cloud.operators.dataflow import DataflowTemplatedJobStartOperator, DataflowStartFlexTemplateOperator');
      break;
    case 'cloud_sql':
      imports.push('from airflow.providers.google.cloud.operators.cloud_sql import CloudSQLExecuteQueryOperator, CloudSQLExportInstanceOperator, CloudSQLImportInstanceOperator');
      break;
    case 'pubsub':
      imports.push('from airflow.providers.google.cloud.operators.pubsub import PubSubCreateTopicOperator, PubSubPublishMessageOperator, PubSubDeleteTopicOperator');
      break;
    case 'datafusion':
      imports.push('from airflow.providers.google.cloud.operators.datafusion import CloudDataFusionStartPipelineOperator');
      break;
    case 'dataplex':
      imports.push('from airflow.providers.google.cloud.operators.dataplex import DataplexCreateTaskOperator');
      break;
    case 'dataform':
      imports.push('from airflow.providers.google.cloud.operators.dataform import DataformCreateWorkflowInvocationOperator, DataformCreateCompilationResultOperator');
      break;
    case 'vertex_ai':
      imports.push('from airflow.providers.google.cloud.operators.vertex_ai.custom_job import CreateCustomTrainingJobOperator');
      imports.push('from airflow.providers.google.cloud.operators.vertex_ai.pipeline_job import RunPipelineJobOperator');
      break;
    case 'vision_ai':
      imports.push('from airflow.providers.google.cloud.operators.vision import CloudVisionImageAnnotateOperator');
      break;
    case 'natural_language':
      imports.push('from airflow.providers.google.cloud.operators.natural_language import CloudNaturalLanguageAnalyzeSentimentOperator');
      break;
    case 'translate':
      imports.push('from airflow.providers.google.cloud.operators.translate import CloudTranslateTextOperator');
      break;
    case 'speech':
      imports.push('from airflow.providers.google.cloud.operators.speech_to_text import CloudSpeechToTextRecognizeSpeechOperator');
      imports.push('from airflow.providers.google.cloud.operators.text_to_speech import CloudTextToSpeechSynthesizeOperator');
      break;
    case 'spanner':
      imports.push('from airflow.providers.google.cloud.operators.spanner import SpannerQueryDatabaseInstanceOperator');
      break;
    case 'bigtable':
      imports.push('from airflow.providers.google.cloud.operators.bigtable import BigtableCreateTableOperator, BigtableDeleteTableOperator');
      break;
    case 'firestore':
      imports.push('from airflow.providers.google.cloud.operators.datastore import CloudDatastoreExportEntitiesOperator, CloudDatastoreImportEntitiesOperator');
      break;
    case 'memorystore':
      imports.push('from airflow.providers.google.cloud.operators.cloud_memorystore import CloudMemorystoreCreateInstanceOperator');
      break;
    case 'cloud_build':
      imports.push('from airflow.providers.google.cloud.operators.cloud_build import CloudBuildCreateBuildOperator, CloudBuildRunBuildTriggerOperator');
      break;
    case 'cloud_tasks':
      imports.push('from airflow.providers.google.cloud.operators.tasks import CloudTasksQueueCreateOperator, CloudTasksTaskCreateOperator');
      break;
    case 'workflows':
      imports.push('from airflow.providers.google.cloud.operators.workflows import WorkflowsCreateExecutionOperator');
      break;
    case 'looker':
      imports.push('from airflow.providers.google.cloud.operators.looker import LookerStartPdtBuildOperator');
      break;
    case 'cloud_dlp':
      imports.push('from airflow.providers.google.cloud.operators.dlp import CloudDLPDeidentifyContentOperator, CloudDLPInspectContentOperator');
      break;
    case 'bigquery_data_transfer':
      imports.push('from airflow.providers.google.cloud.operators.bigquery_dts import BigQueryCreateDataTransferOperator, BigQueryDataTransferServiceStartTransferRunsOperator');
      break;
    case 'alloydb':
      imports.push('from airflow.providers.google.cloud.operators.alloy_db import AlloyDBWriteBaseOperator');
      imports.push('from airflow.providers.google.cloud.hooks.alloy_db import AlloyDbHook');
      break;
  }

  return imports;
};
