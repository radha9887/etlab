import type { DagNodeType } from '../../../types';
import { formatDict } from '../helpers';

type CloseTaskFn = () => void;

// Generate code for AWS operators
export const generateAwsOperatorCode = (
  type: DagNodeType,
  taskId: string,
  config: any,
  lines: string[],
  closeTask: CloseTaskFn
): boolean => {
  switch (type) {
    case 'emr':
      lines.push(`    ${taskId}_add_step = EmrAddStepsOperator(`);
      lines.push(`        task_id="${taskId}_add_step",`);
      lines.push(`        job_flow_id="${config.clusterId || '{{ var.value.emr_cluster_id }}'}",`);
      lines.push(`        steps=[{`);
      lines.push(`            "Name": "${config.stepName || taskId}",`);
      lines.push(`            "ActionOnFailure": "${config.actionOnFailure || 'CONTINUE'}",`);
      lines.push(`            "HadoopJarStep": {`);
      lines.push(`                "Jar": "command-runner.jar",`);
      lines.push(`                "Args": ${JSON.stringify(config.sparkSubmitArgs || ['spark-submit', '--deploy-mode', 'cluster'])},`);
      lines.push(`            },`);
      lines.push(`        }],`);
      if (config.awsConnId) {
        lines.push(`        aws_conn_id="${config.awsConnId}",`);
      }
      closeTask();
      lines.push('');
      lines.push(`    ${taskId}_sensor = EmrStepSensor(`);
      lines.push(`        task_id="${taskId}_sensor",`);
      lines.push(`        job_flow_id="${config.clusterId || '{{ var.value.emr_cluster_id }}'}",`);
      lines.push(`        step_id="{{ task_instance.xcom_pull(task_ids='${taskId}_add_step')[0] }}",`);
      if (config.awsConnId) {
        lines.push(`        aws_conn_id="${config.awsConnId}",`);
      }
      closeTask();
      lines.push('');
      lines.push(`    ${taskId}_add_step >> ${taskId}_sensor`);
      return true;

    case 'redshift':
      lines.push(`    ${taskId} = RedshiftSQLOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        redshift_conn_id="${config.redshiftConnId || 'redshift_default'}",`);
      lines.push(`        sql="""${config.sql || ''}""",`);
      if (config.parameters && Object.keys(config.parameters).length > 0) {
        lines.push(`        parameters=${formatDict(config.parameters, 12)},`);
      }
      closeTask();
      return true;

    case 'athena':
      lines.push(`    ${taskId} = AthenaOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        query="""${config.query || ''}""",`);
      lines.push(`        database="${config.database || ''}",`);
      lines.push(`        output_location="${config.outputLocation || ''}",`);
      if (config.awsConnId) {
        lines.push(`        aws_conn_id="${config.awsConnId}",`);
      }
      if (config.regionName) {
        lines.push(`        region_name="${config.regionName}",`);
      }
      closeTask();
      return true;

    case 'glue_job':
      lines.push(`    ${taskId} = GlueJobOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        job_name="${config.jobName || ''}",`);
      if (config.scriptArgs && Object.keys(config.scriptArgs).length > 0) {
        lines.push(`        script_args=${formatDict(config.scriptArgs, 12)},`);
      }
      if (config.awsConnId) {
        lines.push(`        aws_conn_id="${config.awsConnId}",`);
      }
      if (config.regionName) {
        lines.push(`        region_name="${config.regionName}",`);
      }
      lines.push(`        wait_for_completion=${config.waitForCompletion !== false ? 'True' : 'False'},`);
      closeTask();
      return true;

    case 'glue_crawler':
      lines.push(`    ${taskId} = GlueCrawlerOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        config={"Name": "${config.crawlerName || ''}"},`);
      if (config.awsConnId) {
        lines.push(`        aws_conn_id="${config.awsConnId}",`);
      }
      if (config.regionName) {
        lines.push(`        region_name="${config.regionName}",`);
      }
      lines.push(`        wait_for_completion=${config.waitForCompletion !== false ? 'True' : 'False'},`);
      closeTask();
      return true;

    case 'glue_databrew':
      lines.push(`    ${taskId} = GlueDataBrewStartJobRunOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        job_name="${config.jobName || ''}",`);
      if (config.awsConnId) {
        lines.push(`        aws_conn_id="${config.awsConnId}",`);
      }
      if (config.regionName) {
        lines.push(`        region_name="${config.regionName}",`);
      }
      lines.push(`        wait_for_completion=${config.waitForCompletion !== false ? 'True' : 'False'},`);
      closeTask();
      return true;

    case 'lambda':
      lines.push(`    ${taskId} = LambdaInvokeFunctionOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        function_name="${config.functionName || ''}",`);
      if (config.payload) {
        lines.push(`        payload="""${config.payload}""",`);
      }
      if (config.invocationType) {
        lines.push(`        invocation_type="${config.invocationType}",`);
      }
      if (config.awsConnId) {
        lines.push(`        aws_conn_id="${config.awsConnId}",`);
      }
      if (config.regionName) {
        lines.push(`        region_name="${config.regionName}",`);
      }
      closeTask();
      return true;

    case 'step_function':
      lines.push(`    ${taskId} = StepFunctionStartExecutionOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        state_machine_arn="${config.stateMachineArn || ''}",`);
      if (config.input) {
        lines.push(`        input="""${config.input}""",`);
      }
      if (config.awsConnId) {
        lines.push(`        aws_conn_id="${config.awsConnId}",`);
      }
      if (config.regionName) {
        lines.push(`        region_name="${config.regionName}",`);
      }
      closeTask();
      return true;

    case 'ecs':
      lines.push(`    ${taskId} = EcsRunTaskOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        cluster="${config.cluster || ''}",`);
      lines.push(`        task_definition="${config.taskDefinition || ''}",`);
      if (config.launchType) {
        lines.push(`        launch_type="${config.launchType}",`);
      }
      if (config.networkConfiguration) {
        lines.push(`        network_configuration=${config.networkConfiguration},`);
      }
      if (config.overrides) {
        lines.push(`        overrides=${config.overrides},`);
      }
      if (config.awsConnId) {
        lines.push(`        aws_conn_id="${config.awsConnId}",`);
      }
      if (config.regionName) {
        lines.push(`        region="${config.regionName}",`);
      }
      closeTask();
      return true;

    case 'eks':
      lines.push(`    ${taskId} = EksPodOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        cluster_name="${config.clusterName || ''}",`);
      lines.push(`        pod_name="${config.podName || taskId}",`);
      lines.push(`        image="${config.image || ''}",`);
      if (config.namespace) {
        lines.push(`        namespace="${config.namespace}",`);
      }
      if (config.cmds?.length > 0) {
        lines.push(`        cmds=${JSON.stringify(config.cmds)},`);
      }
      if (config.awsConnId) {
        lines.push(`        aws_conn_id="${config.awsConnId}",`);
      }
      if (config.regionName) {
        lines.push(`        region="${config.regionName}",`);
      }
      closeTask();
      return true;

    case 'batch':
      lines.push(`    ${taskId} = BatchOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        job_name="${config.jobName || ''}",`);
      lines.push(`        job_definition="${config.jobDefinition || ''}",`);
      lines.push(`        job_queue="${config.jobQueue || ''}",`);
      if (config.containerOverrides) {
        lines.push(`        container_overrides=${config.containerOverrides},`);
      }
      if (config.awsConnId) {
        lines.push(`        aws_conn_id="${config.awsConnId}",`);
      }
      if (config.regionName) {
        lines.push(`        region_name="${config.regionName}",`);
      }
      closeTask();
      return true;

    case 'sagemaker':
      lines.push(`    ${taskId} = SageMakerTrainingOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        config={`);
      lines.push(`            "TrainingJobName": "${config.trainingJobName || taskId}",`);
      lines.push(`            "AlgorithmSpecification": {`);
      lines.push(`                "TrainingImage": "${config.trainingImage || ''}",`);
      lines.push(`                "TrainingInputMode": "${config.inputMode || 'File'}",`);
      lines.push(`            },`);
      lines.push(`            "RoleArn": "${config.roleArn || ''}",`);
      lines.push(`            "ResourceConfig": {`);
      lines.push(`                "InstanceType": "${config.instanceType || 'ml.m5.large'}",`);
      lines.push(`                "InstanceCount": ${config.instanceCount || 1},`);
      lines.push(`                "VolumeSizeInGB": ${config.volumeSize || 30},`);
      lines.push(`            },`);
      lines.push(`            "StoppingCondition": {"MaxRuntimeInSeconds": ${config.maxRuntime || 86400}},`);
      lines.push(`        },`);
      if (config.awsConnId) {
        lines.push(`        aws_conn_id="${config.awsConnId}",`);
      }
      lines.push(`        wait_for_completion=${config.waitForCompletion !== false ? 'True' : 'False'},`);
      closeTask();
      return true;

    case 'sns':
      lines.push(`    ${taskId} = SnsPublishOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        target_arn="${config.targetArn || ''}",`);
      lines.push(`        message="""${config.message || ''}""",`);
      if (config.subject) {
        lines.push(`        subject="${config.subject}",`);
      }
      if (config.messageAttributes) {
        lines.push(`        message_attributes=${config.messageAttributes},`);
      }
      if (config.awsConnId) {
        lines.push(`        aws_conn_id="${config.awsConnId}",`);
      }
      if (config.regionName) {
        lines.push(`        region_name="${config.regionName}",`);
      }
      closeTask();
      return true;

    case 'sqs':
      lines.push(`    ${taskId} = SqsPublishOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        sqs_queue="${config.queueUrl || ''}",`);
      lines.push(`        message_content="""${config.messageBody || ''}""",`);
      if (config.messageGroupId) {
        lines.push(`        message_group_id="${config.messageGroupId}",`);
      }
      if (config.awsConnId) {
        lines.push(`        aws_conn_id="${config.awsConnId}",`);
      }
      if (config.regionName) {
        lines.push(`        region_name="${config.regionName}",`);
      }
      closeTask();
      return true;

    case 'eventbridge':
      lines.push(`    ${taskId} = EventBridgePutEventsOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        entries=[{`);
      lines.push(`            "Source": "${config.source || ''}",`);
      lines.push(`            "DetailType": "${config.detailType || ''}",`);
      lines.push(`            "Detail": """${config.detail || '{}'}""",`);
      if (config.eventBusName) {
        lines.push(`            "EventBusName": "${config.eventBusName}",`);
      }
      lines.push(`        }],`);
      if (config.awsConnId) {
        lines.push(`        aws_conn_id="${config.awsConnId}",`);
      }
      if (config.regionName) {
        lines.push(`        region_name="${config.regionName}",`);
      }
      closeTask();
      return true;

    case 'dynamodb':
      lines.push(`    # DynamoDB operation using hook`);
      lines.push(`    def ${taskId}_operation(**context):`);
      lines.push(`        hook = DynamoDBHook(aws_conn_id="${config.awsConnId || 'aws_default'}")`);
      lines.push(`        table = hook.get_conn().Table("${config.tableName || ''}")`);
      if (config.operationType === 'put_item') {
        lines.push(`        table.put_item(Item=${config.item || '{}'})`);
      } else if (config.operationType === 'get_item') {
        lines.push(`        return table.get_item(Key=${config.item || '{}'})`);
      } else if (config.operationType === 'query') {
        lines.push(`        return table.query(KeyConditionExpression="${config.keyConditionExpression || ''}")`);
      }
      lines.push('');
      lines.push(`    ${taskId} = PythonOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        python_callable=${taskId}_operation,`);
      closeTask();
      return true;

    case 'rds':
      lines.push(`    ${taskId} = RdsStartExportTaskOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        export_task_identifier="${config.exportTaskIdentifier || ''}",`);
      lines.push(`        source_arn="${config.sourceArn || ''}",`);
      lines.push(`        s3_bucket_name="${config.s3BucketName || ''}",`);
      lines.push(`        iam_role_arn="${config.iamRoleArn || ''}",`);
      if (config.s3Prefix) {
        lines.push(`        s3_prefix="${config.s3Prefix}",`);
      }
      if (config.kmsKeyId) {
        lines.push(`        kms_key_id="${config.kmsKeyId}",`);
      }
      if (config.awsConnId) {
        lines.push(`        aws_conn_id="${config.awsConnId}",`);
      }
      closeTask();
      return true;

    case 'cloudformation':
      if (config.operation === 'create') {
        lines.push(`    ${taskId} = CloudFormationCreateStackOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        stack_name="${config.stackName || ''}",`);
        if (config.templateUrl) {
          lines.push(`        template_url="${config.templateUrl}",`);
        }
        if (config.templateBody) {
          lines.push(`        template_body="""${config.templateBody}""",`);
        }
        if (config.parameters) {
          lines.push(`        params=${config.parameters},`);
        }
        if (config.awsConnId) {
          lines.push(`        aws_conn_id="${config.awsConnId}",`);
        }
        closeTask();
      } else if (config.operation === 'delete') {
        lines.push(`    ${taskId} = CloudFormationDeleteStackOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        stack_name="${config.stackName || ''}",`);
        if (config.awsConnId) {
          lines.push(`        aws_conn_id="${config.awsConnId}",`);
        }
        closeTask();
      }
      return true;

    case 'bedrock':
      lines.push(`    ${taskId} = BedrockInvokeModelOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        model_id="${config.modelId || 'anthropic.claude-3-sonnet-20240229-v1:0'}",`);
      lines.push(`        input_data={`);
      lines.push(`            "messages": [{`);
      lines.push(`                "role": "user",`);
      lines.push(`                "content": """${config.prompt || ''}""",`);
      lines.push(`            }],`);
      if (config.systemPrompt) {
        lines.push(`            "system": """${config.systemPrompt}""",`);
      }
      lines.push(`            "max_tokens": ${config.maxTokens || 1024},`);
      lines.push(`            "temperature": ${config.temperature || 0.7},`);
      lines.push(`        },`);
      if (config.awsConnId) {
        lines.push(`        aws_conn_id="${config.awsConnId}",`);
      }
      if (config.regionName) {
        lines.push(`        region_name="${config.regionName}",`);
      }
      closeTask();
      return true;

    case 's3':
      if (config.operationType === 'copy') {
        lines.push(`    ${taskId} = S3CopyObjectOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        source_bucket_name="${config.sourceBucket || ''}",`);
        lines.push(`        source_bucket_key="${config.sourceKey || ''}",`);
        lines.push(`        dest_bucket_name="${config.destBucket || ''}",`);
        lines.push(`        dest_bucket_key="${config.destKey || ''}",`);
        if (config.awsConnId) {
          lines.push(`        aws_conn_id="${config.awsConnId}",`);
        }
        closeTask();
      } else if (config.operationType === 'delete') {
        lines.push(`    ${taskId} = S3DeleteObjectsOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        bucket="${config.sourceBucket || ''}",`);
        lines.push(`        keys="${config.sourceKey || ''}",`);
        if (config.awsConnId) {
          lines.push(`        aws_conn_id="${config.awsConnId}",`);
        }
        closeTask();
      }
      return true;

    case 'kinesis':
      lines.push(`    # Kinesis operation using hook`);
      lines.push(`    def ${taskId}_operation(**context):`);
      lines.push(`        hook = KinesisHook(aws_conn_id="${config.awsConnId || 'aws_default'}")`);
      lines.push(`        client = hook.get_conn()`);
      lines.push(`        client.put_record(`);
      lines.push(`            StreamName="${config.streamName || ''}",`);
      lines.push(`            Data="""${config.data || '{}'}""",`);
      lines.push(`            PartitionKey="${config.partitionKey || 'default'}",`);
      lines.push(`        )`);
      lines.push('');
      lines.push(`    ${taskId} = PythonOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        python_callable=${taskId}_operation,`);
      closeTask();
      return true;

    case 'appflow':
      lines.push(`    ${taskId} = AppflowRunOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        flow_name="${config.flowName || ''}",`);
      if (config.awsConnId) {
        lines.push(`        aws_conn_id="${config.awsConnId}",`);
      }
      if (config.regionName) {
        lines.push(`        region="${config.regionName}",`);
      }
      lines.push(`        wait_for_completion=${config.waitForCompletion !== false ? 'True' : 'False'},`);
      closeTask();
      return true;

    case 'comprehend':
      lines.push(`    ${taskId} = ComprehendStartPiiEntitiesDetectionJobOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        input_data_config={`);
      lines.push(`            "S3Uri": "${config.inputS3Uri || ''}",`);
      lines.push(`            "InputFormat": "${config.inputFormat || 'ONE_DOC_PER_LINE'}",`);
      lines.push(`        },`);
      lines.push(`        output_data_config={"S3Uri": "${config.outputS3Uri || ''}"},`);
      lines.push(`        data_access_role_arn="${config.dataAccessRoleArn || ''}",`);
      lines.push(`        language_code="${config.languageCode || 'en'}",`);
      if (config.awsConnId) {
        lines.push(`        aws_conn_id="${config.awsConnId}",`);
      }
      if (config.regionName) {
        lines.push(`        region_name="${config.regionName}",`);
      }
      closeTask();
      return true;

    case 'datasync':
      lines.push(`    ${taskId} = DataSyncOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        task_arn="${config.taskArn || ''}",`);
      if (config.awsConnId) {
        lines.push(`        aws_conn_id="${config.awsConnId}",`);
      }
      lines.push(`        wait_for_completion=${config.waitForCompletion !== false ? 'True' : 'False'},`);
      closeTask();
      return true;

    case 'dms':
      lines.push(`    ${taskId} = DmsStartTaskOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        replication_task_arn="${config.replicationTaskArn || ''}",`);
      lines.push(`        start_replication_task_type="${config.startReplicationTaskType || 'start-replication'}",`);
      if (config.awsConnId) {
        lines.push(`        aws_conn_id="${config.awsConnId}",`);
      }
      closeTask();
      return true;

    case 'ec2':
      if (config.operation === 'start') {
        lines.push(`    ${taskId} = EC2StartInstanceOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        instance_id="${config.instanceIds?.split(',')[0]?.trim() || ''}",`);
        if (config.awsConnId) {
          lines.push(`        aws_conn_id="${config.awsConnId}",`);
        }
        if (config.regionName) {
          lines.push(`        region_name="${config.regionName}",`);
        }
        closeTask();
      } else if (config.operation === 'stop') {
        lines.push(`    ${taskId} = EC2StopInstanceOperator(`);
        lines.push(`        task_id="${taskId}",`);
        lines.push(`        instance_id="${config.instanceIds?.split(',')[0]?.trim() || ''}",`);
        if (config.awsConnId) {
          lines.push(`        aws_conn_id="${config.awsConnId}",`);
        }
        if (config.regionName) {
          lines.push(`        region_name="${config.regionName}",`);
        }
        closeTask();
      }
      return true;

    case 'ssm':
      lines.push(`    ${taskId} = SsmRunCommandOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        instance_ids="${config.instanceIds || ''}".split(','),`);
      lines.push(`        document_name="${config.documentName === 'custom' ? config.customDocumentName : config.documentName || 'AWS-RunShellScript'}",`);
      lines.push(`        parameters={"commands": """${config.commands || ''}""".split('\\n')},`);
      if (config.awsConnId) {
        lines.push(`        aws_conn_id="${config.awsConnId}",`);
      }
      if (config.regionName) {
        lines.push(`        region_name="${config.regionName}",`);
      }
      closeTask();
      return true;

    case 'secrets_manager':
      lines.push(`    # Secrets Manager operation using hook`);
      lines.push(`    def ${taskId}_operation(**context):`);
      lines.push(`        hook = SecretsManagerHook(aws_conn_id="${config.awsConnId || 'aws_default'}")`);
      if (config.operation === 'get') {
        lines.push(`        return hook.get_secret("${config.secretId || ''}")`);
      } else if (config.operation === 'create') {
        lines.push(`        hook.get_conn().create_secret(`);
        lines.push(`            Name="${config.secretId || ''}",`);
        lines.push(`            SecretString="""${config.secretString || ''}""",`);
        lines.push(`        )`);
      }
      lines.push('');
      lines.push(`    ${taskId} = PythonOperator(`);
      lines.push(`        task_id="${taskId}",`);
      lines.push(`        python_callable=${taskId}_operation,`);
      closeTask();
      return true;

    case 'cloudwatch':
      lines.push(`    # CloudWatch operation using hook`);
      lines.push(`    def ${taskId}_operation(**context):`);
      lines.push(`        hook = AwsLogsHook(aws_conn_id="${config.awsConnId || 'aws_default'}")`);
      if (config.operationType === 'put_log_event') {
        lines.push(`        hook.get_conn().put_log_events(`);
        lines.push(`            logGroupName="${config.logGroupName || ''}",`);
        lines.push(`            logStreamName="${config.logStreamName || ''}",`);
        lines.push(`            logEvents=[{"timestamp": int(time.time() * 1000), "message": """${config.logMessage || ''}"""}],`);
        lines.push(`        )`);
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
