import type { DagNodeType } from '../../../types';
import { formatDict } from '../helpers';

type CloseTaskFn = () => void;

// Generate code for GCP operators
export const generateGcpOperatorCode = (
  type: DagNodeType,
  taskId: string,
  config: any,
  lines: string[],
  closeTask: CloseTaskFn
): boolean => {
  switch (type) {
    case 'dataproc':
      lines.push(`    ${taskId} = DataprocSubmitJobOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
      lines.push(`        region="${config.region || 'us-central1'}",`);
      lines.push(`        cluster_name="${config.clusterName || ''}",`);
      lines.push(`        job={`);
      lines.push(`            "reference": {"job_id": "${taskId}_{{ ts_nodash }}"},`);
      lines.push(`            "placement": {"cluster_name": "${config.clusterName || ''}"},`);
      if (config.jobType === 'pyspark') {
        lines.push(`            "pyspark_job": {`);
        lines.push(`                "main_python_file_uri": "${config.mainFile || ''}",`);
        if (config.args?.length > 0) {
          lines.push(`                "args": ${JSON.stringify(config.args)},`);
        }
        lines.push(`            },`);
      } else {
        lines.push(`            "spark_job": {`);
        lines.push(`                "main_jar_file_uri": "${config.mainFile || ''}",`);
        lines.push(`                "main_class": "${config.mainClass || ''}",`);
        if (config.args?.length > 0) {
          lines.push(`                "args": ${JSON.stringify(config.args)},`);
        }
        lines.push(`            },`);
      }
      lines.push(`        },`);
      if (config.gcpConnId) {
        lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
      }
      closeTask();
      return true;

    case 'bigquery':
      lines.push(`    ${taskId} = BigQueryInsertJobOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        configuration={`);
      lines.push(`            "query": {`);
      lines.push(`                "query": """${config.sql || ''}""",`);
      lines.push(`                "useLegacySql": False,`);
      if (config.destinationTable) {
        lines.push(`                "destinationTable": {`);
        lines.push(`                    "projectId": "${config.projectId || '{{ var.value.gcp_project }}'}",`);
        lines.push(`                    "datasetId": "${config.datasetId || ''}",`);
        lines.push(`                    "tableId": "${config.destinationTable}",`);
        lines.push(`                },`);
        lines.push(`                "writeDisposition": "${config.writeDisposition || 'WRITE_TRUNCATE'}",`);
      }
      lines.push(`            },`);
      lines.push(`        },`);
      lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
      lines.push(`        location="${config.location || 'US'}",`);
      if (config.gcpConnId) {
        lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
      }
      closeTask();
      return true;

    case 'gcs':
      if (config.operation === 'create_bucket') {
        lines.push(`    ${taskId} = GCSCreateBucketOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        bucket_name="${config.bucketName || ''}",`);
        if (config.location) {
          lines.push(`        location="${config.location}",`);
        }
        if (config.storageClass) {
          lines.push(`        storage_class="${config.storageClass}",`);
        }
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      } else if (config.operation === 'delete_bucket') {
        lines.push(`    ${taskId} = GCSDeleteBucketOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        bucket_name="${config.bucketName || ''}",`);
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      } else if (config.operation === 'delete_objects') {
        lines.push(`    ${taskId} = GCSDeleteObjectsOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        bucket_name="${config.bucketName || ''}",`);
        lines.push(`        prefix="${config.prefix || ''}",`);
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      } else if (config.operation === 'copy') {
        lines.push(`    ${taskId} = GCSToGCSOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        source_bucket="${config.sourceBucket || ''}",`);
        lines.push(`        source_object="${config.sourceObject || ''}",`);
        lines.push(`        destination_bucket="${config.destinationBucket || ''}",`);
        lines.push(`        destination_object="${config.destinationObject || ''}",`);
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      }
      return true;

    case 'cloud_run':
      lines.push(`    ${taskId} = CloudRunExecuteJobOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
      lines.push(`        region="${config.region || 'us-central1'}",`);
      lines.push(`        job_name="${config.jobName || ''}",`);
      if (config.overrides) {
        lines.push(`        overrides=${config.overrides},`);
      }
      if (config.gcpConnId) {
        lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
      }
      closeTask();
      return true;

    case 'cloud_function':
      lines.push(`    ${taskId} = CloudFunctionInvokeFunctionOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
      lines.push(`        location="${config.location || 'us-central1'}",`);
      lines.push(`        function_id="${config.functionName || ''}",`);
      if (config.inputData) {
        lines.push(`        input_data="""${config.inputData}""",`);
      }
      if (config.gcpConnId) {
        lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
      }
      closeTask();
      return true;

    case 'gke':
      lines.push(`    ${taskId} = GKEStartPodOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
      lines.push(`        location="${config.location || 'us-central1'}",`);
      lines.push(`        cluster_name="${config.clusterName || ''}",`);
      lines.push(`        name="${config.podName || taskId}",`);
      lines.push(`        namespace="${config.namespace || 'default'}",`);
      lines.push(`        image="${config.image || ''}",`);
      if (config.cmds?.length > 0) {
        lines.push(`        cmds=${JSON.stringify(config.cmds)},`);
      }
      if (config.arguments?.length > 0) {
        lines.push(`        arguments=${JSON.stringify(config.arguments)},`);
      }
      if (config.gcpConnId) {
        lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
      }
      closeTask();
      return true;

    case 'compute_engine':
      if (config.operation === 'start') {
        lines.push(`    ${taskId} = ComputeEngineStartInstanceOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
        lines.push(`        zone="${config.zone || 'us-central1-a'}",`);
        lines.push(`        resource_id="${config.instanceName || ''}",`);
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      } else if (config.operation === 'stop') {
        lines.push(`    ${taskId} = ComputeEngineStopInstanceOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
        lines.push(`        zone="${config.zone || 'us-central1-a'}",`);
        lines.push(`        resource_id="${config.instanceName || ''}",`);
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      }
      return true;

    case 'dataflow':
      if (config.templateType === 'classic') {
        lines.push(`    ${taskId} = DataflowTemplatedJobStartOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
        lines.push(`        location="${config.region || 'us-central1'}",`);
        lines.push(`        template="${config.templatePath || ''}",`);
        lines.push(`        job_name="${config.jobName || taskId}",`);
        if (config.parameters && Object.keys(config.parameters).length > 0) {
          lines.push(`        parameters=${formatDict(config.parameters, 12)},`);
        }
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      } else {
        lines.push(`    ${taskId} = DataflowStartFlexTemplateOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
        lines.push(`        location="${config.region || 'us-central1'}",`);
        lines.push(`        body={`);
        lines.push(`            "launchParameter": {`);
        lines.push(`                "jobName": "${config.jobName || taskId}",`);
        lines.push(`                "containerSpecGcsPath": "${config.templatePath || ''}",`);
        if (config.parameters && Object.keys(config.parameters).length > 0) {
          lines.push(`                "parameters": ${formatDict(config.parameters, 20)},`);
        }
        lines.push(`            },`);
        lines.push(`        },`);
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      }
      return true;

    case 'cloud_sql':
      if (config.operation === 'query') {
        lines.push(`    ${taskId} = CloudSQLExecuteQueryOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        gcp_cloudsql_conn_id="${config.cloudSqlConnId || 'google_cloud_sql_default'}",`);
        lines.push(`        sql="""${config.sql || ''}""",`);
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      } else if (config.operation === 'export') {
        lines.push(`    ${taskId} = CloudSQLExportInstanceOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
        lines.push(`        instance="${config.instanceName || ''}",`);
        lines.push(`        body={`);
        lines.push(`            "exportContext": {`);
        lines.push(`                "fileType": "${config.fileType || 'SQL'}",`);
        lines.push(`                "uri": "${config.exportUri || ''}",`);
        if (config.databases) {
          lines.push(`                "databases": ${JSON.stringify(config.databases.split(',').map((d: string) => d.trim()))},`);
        }
        lines.push(`            },`);
        lines.push(`        },`);
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      } else if (config.operation === 'import') {
        lines.push(`    ${taskId} = CloudSQLImportInstanceOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
        lines.push(`        instance="${config.instanceName || ''}",`);
        lines.push(`        body={`);
        lines.push(`            "importContext": {`);
        lines.push(`                "fileType": "${config.fileType || 'SQL'}",`);
        lines.push(`                "uri": "${config.importUri || ''}",`);
        if (config.database) {
          lines.push(`                "database": "${config.database}",`);
        }
        lines.push(`            },`);
        lines.push(`        },`);
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      }
      return true;

    case 'pubsub':
      if (config.operation === 'create_topic') {
        lines.push(`    ${taskId} = PubSubCreateTopicOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
        lines.push(`        topic="${config.topicId || ''}",`);
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      } else if (config.operation === 'publish') {
        lines.push(`    ${taskId} = PubSubPublishMessageOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
        lines.push(`        topic="${config.topicId || ''}",`);
        lines.push(`        messages=[{"data": """${config.messageData || ''}""".encode("utf-8")}],`);
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      } else if (config.operation === 'delete_topic') {
        lines.push(`    ${taskId} = PubSubDeleteTopicOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
        lines.push(`        topic="${config.topicId || ''}",`);
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      }
      return true;

    case 'datafusion':
      lines.push(`    ${taskId} = CloudDataFusionStartPipelineOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
      lines.push(`        location="${config.location || 'us-central1'}",`);
      lines.push(`        instance_name="${config.instanceName || ''}",`);
      lines.push(`        pipeline_name="${config.pipelineName || ''}",`);
      lines.push(`        namespace="${config.namespace || 'default'}",`);
      if (config.runtimeArgs && Object.keys(config.runtimeArgs).length > 0) {
        lines.push(`        runtime_args=${formatDict(config.runtimeArgs, 12)},`);
      }
      if (config.gcpConnId) {
        lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
      }
      closeTask();
      return true;

    case 'dataplex':
      lines.push(`    ${taskId} = DataplexCreateTaskOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
      lines.push(`        region="${config.region || 'us-central1'}",`);
      lines.push(`        lake_id="${config.lakeId || ''}",`);
      lines.push(`        dataplex_task_id="${config.dataplexTaskId || taskId}",`);
      lines.push(`        body={`);
      lines.push(`            "trigger_spec": {"type": "${config.triggerType || 'ON_DEMAND'}"},`);
      lines.push(`            "execution_spec": {`);
      lines.push(`                "service_account": "${config.serviceAccount || ''}",`);
      lines.push(`            },`);
      if (config.taskType === 'spark') {
        lines.push(`            "spark": {`);
        lines.push(`                "main_jar_file_uri": "${config.mainJarFileUri || ''}",`);
        lines.push(`            },`);
      } else {
        lines.push(`            "notebook": {`);
        lines.push(`                "notebook": "${config.notebookPath || ''}",`);
        lines.push(`            },`);
      }
      lines.push(`        },`);
      if (config.gcpConnId) {
        lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
      }
      closeTask();
      return true;

    case 'dataform':
      lines.push(`    ${taskId}_compilation = DataformCreateCompilationResultOperator(`);
      lines.push(`        task_id="${taskId}_compilation",`);
      lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
      lines.push(`        region="${config.region || 'us-central1'}",`);
      lines.push(`        repository_id="${config.repositoryId || ''}",`);
      lines.push(`        compilation_result={`);
      lines.push(`            "git_commitish": "${config.gitCommitish || 'main'}",`);
      lines.push(`        },`);
      if (config.gcpConnId) {
        lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
      }
      closeTask();
      lines.push('');
      lines.push(`    ${taskId} = DataformCreateWorkflowInvocationOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
      lines.push(`        region="${config.region || 'us-central1'}",`);
      lines.push(`        repository_id="${config.repositoryId || ''}",`);
      lines.push(`        workflow_invocation={`);
      lines.push(`            "compilation_result": "{{ task_instance.xcom_pull(task_ids='${taskId}_compilation')['name'] }}",`);
      lines.push(`        },`);
      if (config.gcpConnId) {
        lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
      }
      closeTask();
      lines.push('');
      lines.push(`    ${taskId}_compilation >> ${taskId}`);
      return true;

    case 'vertex_ai':
      if (config.operation === 'custom_training') {
        lines.push(`    ${taskId} = CreateCustomTrainingJobOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
        lines.push(`        region="${config.region || 'us-central1'}",`);
        lines.push(`        display_name="${config.displayName || taskId}",`);
        lines.push(`        container_uri="${config.containerUri || ''}",`);
        if (config.modelServingContainerUri) {
          lines.push(`        model_serving_container_image_uri="${config.modelServingContainerUri}",`);
        }
        lines.push(`        machine_type="${config.machineType || 'n1-standard-4'}",`);
        if (config.acceleratorType && config.acceleratorType !== 'none') {
          lines.push(`        accelerator_type="${config.acceleratorType}",`);
          lines.push(`        accelerator_count=${config.acceleratorCount || 1},`);
        }
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      } else if (config.operation === 'pipeline') {
        lines.push(`    ${taskId} = RunPipelineJobOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
        lines.push(`        region="${config.region || 'us-central1'}",`);
        lines.push(`        display_name="${config.displayName || taskId}",`);
        lines.push(`        template_path="${config.pipelineTemplatePath || ''}",`);
        if (config.pipelineParameters && Object.keys(config.pipelineParameters).length > 0) {
          lines.push(`        parameter_values=${formatDict(config.pipelineParameters, 12)},`);
        }
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      }
      return true;

    case 'vision_ai':
      lines.push(`    ${taskId} = CloudVisionImageAnnotateOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        request={`);
      lines.push(`            "image": {`);
      if (config.imageSource === 'gcs') {
        lines.push(`                "source": {"gcs_image_uri": "${config.gcsUri || ''}"},`);
      } else {
        lines.push(`                "content": "${config.imageContent || ''}",`);
      }
      lines.push(`            },`);
      lines.push(`            "features": [`);
      const features = config.features?.split(',').map((f: string) => f.trim()) || ['LABEL_DETECTION'];
      features.forEach((feature: string) => {
        lines.push(`                {"type_": "${feature}"},`);
      });
      lines.push(`            ],`);
      lines.push(`        },`);
      if (config.gcpConnId) {
        lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
      }
      closeTask();
      return true;

    case 'natural_language':
      lines.push(`    ${taskId} = CloudNaturalLanguageAnalyzeSentimentOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        document={`);
      lines.push(`            "type_": "${config.documentType || 'PLAIN_TEXT'}",`);
      if (config.contentSource === 'gcs') {
        lines.push(`            "gcs_content_uri": "${config.gcsUri || ''}",`);
      } else {
        lines.push(`            "content": """${config.content || ''}""",`);
      }
      if (config.language) {
        lines.push(`            "language": "${config.language}",`);
      }
      lines.push(`        },`);
      if (config.gcpConnId) {
        lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
      }
      closeTask();
      return true;

    case 'translate':
      lines.push(`    ${taskId} = CloudTranslateTextOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
      lines.push(`        contents=["""${config.text || ''}"""],`);
      lines.push(`        target_language_code="${config.targetLanguage || 'en'}",`);
      if (config.sourceLanguage) {
        lines.push(`        source_language_code="${config.sourceLanguage}",`);
      }
      if (config.gcpConnId) {
        lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
      }
      closeTask();
      return true;

    case 'speech':
      if (config.operation === 'speech_to_text') {
        lines.push(`    ${taskId} = CloudSpeechToTextRecognizeSpeechOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
        lines.push(`        config={`);
        lines.push(`            "encoding": "${config.encoding || 'LINEAR16'}",`);
        lines.push(`            "sample_rate_hertz": ${config.sampleRate || 16000},`);
        lines.push(`            "language_code": "${config.languageCode || 'en-US'}",`);
        lines.push(`        },`);
        lines.push(`        audio={"uri": "${config.audioUri || ''}"},`);
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      } else {
        lines.push(`    ${taskId} = CloudTextToSpeechSynthesizeOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
        lines.push(`        input_data={"text": """${config.text || ''}"""},`);
        lines.push(`        voice={`);
        lines.push(`            "language_code": "${config.languageCode || 'en-US'}",`);
        lines.push(`            "name": "${config.voiceName || 'en-US-Standard-A'}",`);
        lines.push(`        },`);
        lines.push(`        audio_config={"audio_encoding": "${config.audioEncoding || 'MP3'}"},`);
        lines.push(`        target_bucket_name="${config.outputBucket || ''}",`);
        lines.push(`        target_filename="${config.outputFilename || 'output.mp3'}",`);
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      }
      return true;

    case 'spanner':
      lines.push(`    ${taskId} = SpannerQueryDatabaseInstanceOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
      lines.push(`        instance_id="${config.instanceId || ''}",`);
      lines.push(`        database_id="${config.databaseId || ''}",`);
      lines.push(`        query="""${config.sql || ''}""",`);
      if (config.gcpConnId) {
        lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
      }
      closeTask();
      return true;

    case 'bigtable':
      if (config.operation === 'create_table') {
        lines.push(`    ${taskId} = BigtableCreateTableOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
        lines.push(`        instance_id="${config.instanceId || ''}",`);
        lines.push(`        table_id="${config.tableId || ''}",`);
        if (config.columnFamilies) {
          lines.push(`        initial_column_families=${JSON.stringify(config.columnFamilies.split(',').map((cf: string) => cf.trim()))},`);
        }
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      } else if (config.operation === 'delete_table') {
        lines.push(`    ${taskId} = BigtableDeleteTableOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
        lines.push(`        instance_id="${config.instanceId || ''}",`);
        lines.push(`        table_id="${config.tableId || ''}",`);
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      }
      return true;

    case 'firestore':
      if (config.operation === 'export') {
        lines.push(`    ${taskId} = CloudDatastoreExportEntitiesOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
        lines.push(`        bucket="${config.outputBucket || ''}",`);
        if (config.namespace) {
          lines.push(`        namespace="${config.namespace}",`);
        }
        if (config.entityFilter) {
          lines.push(`        entity_filter={"kinds": ${JSON.stringify(config.entityFilter.split(',').map((k: string) => k.trim()))}},`);
        }
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      } else if (config.operation === 'import') {
        lines.push(`    ${taskId} = CloudDatastoreImportEntitiesOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
        lines.push(`        bucket="${config.inputBucket || ''}",`);
        lines.push(`        file="${config.inputFile || ''}",`);
        if (config.namespace) {
          lines.push(`        namespace="${config.namespace}",`);
        }
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      }
      return true;

    case 'memorystore':
      lines.push(`    ${taskId} = CloudMemorystoreCreateInstanceOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
      lines.push(`        location="${config.location || 'us-central1'}",`);
      lines.push(`        instance_id="${config.instanceId || ''}",`);
      lines.push(`        instance={`);
      lines.push(`            "tier": "${config.tier || 'BASIC'}",`);
      lines.push(`            "memory_size_gb": ${config.memorySizeGb || 1},`);
      if (config.redisVersion) {
        lines.push(`            "redis_version": "${config.redisVersion}",`);
      }
      lines.push(`        },`);
      if (config.gcpConnId) {
        lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
      }
      closeTask();
      return true;

    case 'cloud_build':
      if (config.operation === 'build') {
        lines.push(`    ${taskId} = CloudBuildCreateBuildOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
        lines.push(`        build={`);
        lines.push(`            "steps": [`);
        if (config.buildSteps) {
          const steps = JSON.parse(config.buildSteps || '[]');
          steps.forEach((step: any) => {
            lines.push(`                {"name": "${step.name}", "args": ${JSON.stringify(step.args || [])}},`);
          });
        } else {
          lines.push(`                {"name": "gcr.io/cloud-builders/docker", "args": ["build", "-t", "${config.imageName || ''}", "."]},`);
        }
        lines.push(`            ],`);
        if (config.imageName) {
          lines.push(`            "images": ["${config.imageName}"],`);
        }
        lines.push(`        },`);
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      } else if (config.operation === 'trigger') {
        lines.push(`    ${taskId} = CloudBuildRunBuildTriggerOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
        lines.push(`        trigger_id="${config.triggerId || ''}",`);
        if (config.source) {
          lines.push(`        source=${config.source},`);
        }
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      }
      return true;

    case 'cloud_tasks':
      if (config.operation === 'create_queue') {
        lines.push(`    ${taskId} = CloudTasksQueueCreateOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
        lines.push(`        location="${config.location || 'us-central1'}",`);
        lines.push(`        task_queue={"name": "projects/${config.projectId || '{{ var.value.gcp_project }}'}/locations/${config.location || 'us-central1'}/queues/${config.queueName || ''}"},`);
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      } else if (config.operation === 'create_task') {
        lines.push(`    ${taskId} = CloudTasksTaskCreateOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
        lines.push(`        location="${config.location || 'us-central1'}",`);
        lines.push(`        queue_id="${config.queueName || ''}",`);
        lines.push(`        task={`);
        if (config.httpMethod) {
          lines.push(`            "http_request": {`);
          lines.push(`                "http_method": "${config.httpMethod}",`);
          lines.push(`                "url": "${config.url || ''}",`);
          if (config.body) {
            lines.push(`                "body": """${config.body}""".encode(),`);
          }
          lines.push(`            },`);
        }
        lines.push(`        },`);
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      }
      return true;

    case 'workflows':
      if (config.operation === 'create_execution') {
        lines.push(`    ${taskId} = WorkflowsCreateExecutionOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
        lines.push(`        location="${config.location || 'us-central1'}",`);
        lines.push(`        workflow_id="${config.workflowId || ''}",`);
        if (config.arguments) {
          lines.push(`        execution={"argument": """${config.arguments}"""},`);
        }
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      }
      return true;

    case 'looker':
      if (config.operation === 'start_pdt_build') {
        lines.push(`    ${taskId} = LookerStartPdtBuildOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        looker_conn_id="${config.lookerConnId || 'looker_default'}",`);
        lines.push(`        model="${config.model || ''}",`);
        lines.push(`        view="${config.view || ''}",`);
        if (config.forceFullIncremental) {
          lines.push(`        force_full_incremental=True,`);
        }
        closeTask();
      }
      return true;

    case 'cloud_dlp':
      if (config.operation === 'deidentify') {
        lines.push(`    ${taskId} = CloudDLPDeidentifyContentOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
        lines.push(`        deidentify_config={`);
        lines.push(`            "info_type_transformations": {`);
        lines.push(`                "transformations": [{`);
        if (config.deidentifyMethod === 'mask') {
          lines.push(`                    "primitive_transformation": {`);
          lines.push(`                        "character_mask_config": {`);
          lines.push(`                            "masking_character": "${config.maskingChar || '*'}",`);
          if (config.numberToMask > 0) {
            lines.push(`                            "number_to_mask": ${config.numberToMask},`);
          }
          lines.push(`                        },`);
          lines.push(`                    },`);
        } else if (config.deidentifyMethod === 'redact') {
          lines.push(`                    "primitive_transformation": {"redact_config": {}},`);
        } else if (config.deidentifyMethod === 'replace') {
          lines.push(`                    "primitive_transformation": {`);
          lines.push(`                        "replace_config": {"new_value": {"string_value": "${config.replaceValue || '[REDACTED]'}"}},`);
          lines.push(`                    },`);
        }
        lines.push(`                }],`);
        lines.push(`            },`);
        lines.push(`        },`);
        lines.push(`        item={"value": """${config.content || ''}"""},`);
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      } else if (config.operation === 'inspect') {
        lines.push(`    ${taskId} = CloudDLPInspectContentOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
        if (config.infoTypes) {
          lines.push(`        inspect_config={`);
          lines.push(`            "info_types": [`);
          const infoTypes = config.infoTypes.split(',').map((t: string) => t.trim());
          infoTypes.forEach((infoType: string) => {
            lines.push(`                {"name": "${infoType}"},`);
          });
          lines.push(`            ],`);
          lines.push(`        },`);
        }
        lines.push(`        item={"value": """${config.content || ''}"""},`);
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      }
      return true;

    case 'bigquery_data_transfer':
      if (config.operation === 'create_transfer') {
        lines.push(`    ${taskId} = BigQueryCreateDataTransferOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
        lines.push(`        transfer_config={`);
        lines.push(`            "destination_dataset_id": "${config.destinationDataset || ''}",`);
        lines.push(`            "display_name": "${config.displayName || taskId}",`);
        lines.push(`            "data_source_id": "${config.dataSourceId || ''}",`);
        if (config.params) {
          lines.push(`            "params": ${config.params},`);
        }
        if (config.schedule) {
          lines.push(`            "schedule": "${config.schedule}",`);
        }
        lines.push(`        },`);
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      } else if (config.operation === 'start_transfer') {
        lines.push(`    ${taskId} = BigQueryDataTransferServiceStartTransferRunsOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
        lines.push(`        transfer_config_id="${config.transferConfigId || ''}",`);
        if (config.requestedRunTime) {
          lines.push(`        requested_run_time="${config.requestedRunTime}",`);
        }
        if (config.gcpConnId) {
          lines.push(`        gcp_conn_id="${config.gcpConnId}",`);
        }
        closeTask();
      }
      return true;

    case 'alloydb':
      lines.push(`    # AlloyDB operation using hook`);
      lines.push(`    def ${taskId}_operation(**context):`);
      lines.push(`        hook = AlloyDbHook(gcp_conn_id="${config.gcpConnId || 'google_cloud_default'}")`);
      lines.push(`        connection = hook.get_conn(`);
      lines.push(`            project_id="${config.projectId || '{{ var.value.gcp_project }}'}",`);
      lines.push(`            location="${config.location || 'us-central1'}",`);
      lines.push(`            cluster_id="${config.clusterId || ''}",`);
      lines.push(`            instance_id="${config.instanceId || ''}",`);
      lines.push(`        )`);
      if (config.operation === 'query') {
        lines.push(`        cursor = connection.cursor()`);
        lines.push(`        cursor.execute("""${config.sql || ''}""")`);
        lines.push(`        return cursor.fetchall()`);
      }
      lines.push('');
      lines.push(`    ${taskId} = PythonOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        python_callable=${taskId}_operation,`);
      closeTask();
      return true;

    default:
      return false;
  }
};
