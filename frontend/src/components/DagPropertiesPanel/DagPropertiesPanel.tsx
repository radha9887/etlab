import { useState, useEffect } from 'react';
import { Settings, Calendar, Clock, Mail, Tag, ChevronDown, ChevronRight, Sliders, RotateCcw, Save } from 'lucide-react';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { isDagPage, isWorkflowPage } from '../../types';
import type { DagConfig, DagTaskNodeData } from '../../types';

// Import task config components
import { EtlTaskConfig } from './configs/EtlTaskConfig';
import { SparkSubmitConfig } from './configs/SparkSubmitConfig';
import { PythonConfig } from './configs/PythonConfig';
import { BashConfig } from './configs/BashConfig';
import { FileSensorConfig } from './configs/FileSensorConfig';
import { S3SensorConfig } from './configs/S3SensorConfig';
import { BranchConfig } from './configs/BranchConfig';
import { DummyConfig } from './configs/DummyConfig';
// Phase 1: Additional task configs
import { SqlSensorConfig } from './configs/SqlSensorConfig';
import { HttpSensorConfig } from './configs/HttpSensorConfig';
import { ExternalSensorConfig } from './configs/ExternalSensorConfig';
import { TriggerDagConfig } from './configs/TriggerDagConfig';
import { EmailConfig } from './configs/EmailConfig';
import { SlackConfig } from './configs/SlackConfig';
import { SqlExecuteConfig } from './configs/SqlExecuteConfig';
// Phase 2: Cloud Storage & Data configs
import { GcsSensorConfig } from './configs/GcsSensorConfig';
import { AzureBlobSensorConfig } from './configs/AzureBlobSensorConfig';
import { SnowflakeOperatorConfig } from './configs/SnowflakeOperatorConfig';
import { DeltaLakeSensorConfig } from './configs/DeltaLakeSensorConfig';
// Phase 3: Cloud Compute configs
import { KubernetesPodConfig } from './configs/KubernetesPodConfig';
import { EmrOperatorConfig } from './configs/EmrOperatorConfig';
import { DataprocOperatorConfig } from './configs/DataprocOperatorConfig';
import { DatabricksOperatorConfig } from './configs/DatabricksOperatorConfig';
// Phase 4: Data Warehouse configs
import { BigQueryOperatorConfig } from './configs/BigQueryOperatorConfig';
import { RedshiftOperatorConfig } from './configs/RedshiftOperatorConfig';
import { SynapseOperatorConfig } from './configs/SynapseOperatorConfig';
// AWS Services configs
import { AthenaOperatorConfig } from './configs/AthenaOperatorConfig';
import { GlueJobOperatorConfig } from './configs/GlueJobOperatorConfig';
import { GlueCrawlerOperatorConfig } from './configs/GlueCrawlerOperatorConfig';
import { GlueDataBrewOperatorConfig } from './configs/GlueDataBrewOperatorConfig';
import { LambdaOperatorConfig } from './configs/LambdaOperatorConfig';
import { StepFunctionOperatorConfig } from './configs/StepFunctionOperatorConfig';
import { EcsOperatorConfig } from './configs/EcsOperatorConfig';
import { EksOperatorConfig } from './configs/EksOperatorConfig';
import { BatchOperatorConfig } from './configs/BatchOperatorConfig';
import { SageMakerOperatorConfig } from './configs/SageMakerOperatorConfig';
import { SnsOperatorConfig } from './configs/SnsOperatorConfig';
import { SqsOperatorConfig } from './configs/SqsOperatorConfig';
import { EventBridgeOperatorConfig } from './configs/EventBridgeOperatorConfig';
import { DynamoDBOperatorConfig } from './configs/DynamoDBOperatorConfig';
import { RdsOperatorConfig } from './configs/RdsOperatorConfig';
import { CloudFormationOperatorConfig } from './configs/CloudFormationOperatorConfig';
import { BedrockOperatorConfig } from './configs/BedrockOperatorConfig';
import { S3OperatorConfig } from './configs/S3OperatorConfig';
import { KinesisOperatorConfig } from './configs/KinesisOperatorConfig';
import { AppFlowOperatorConfig } from './configs/AppFlowOperatorConfig';
import { ComprehendOperatorConfig } from './configs/ComprehendOperatorConfig';
import { DataSyncOperatorConfig } from './configs/DataSyncOperatorConfig';
import { DmsOperatorConfig } from './configs/DmsOperatorConfig';
import { Ec2OperatorConfig } from './configs/Ec2OperatorConfig';
import { SsmOperatorConfig } from './configs/SsmOperatorConfig';
import { SecretsManagerOperatorConfig } from './configs/SecretsManagerOperatorConfig';
import { CloudWatchOperatorConfig } from './configs/CloudWatchOperatorConfig';
// GCP Services configs - Compute
import { GcsOperatorConfig } from './configs/GcsOperatorConfig';
import { CloudRunOperatorConfig } from './configs/CloudRunOperatorConfig';
import { CloudFunctionOperatorConfig } from './configs/CloudFunctionOperatorConfig';
import { GkeOperatorConfig } from './configs/GkeOperatorConfig';
import { ComputeEngineOperatorConfig } from './configs/ComputeEngineOperatorConfig';
// GCP Services configs - Data & Analytics
import { DataflowOperatorConfig } from './configs/DataflowOperatorConfig';
import { CloudSqlOperatorConfig } from './configs/CloudSqlOperatorConfig';
import { PubSubOperatorConfig } from './configs/PubSubOperatorConfig';
import { DataFusionOperatorConfig } from './configs/DataFusionOperatorConfig';
import { DataplexOperatorConfig } from './configs/DataplexOperatorConfig';
import { DataformOperatorConfig } from './configs/DataformOperatorConfig';
import { BigQueryDataTransferConfig } from './configs/BigQueryDataTransferConfig';
// GCP Services configs - AI/ML
import { VertexAiOperatorConfig } from './configs/VertexAiOperatorConfig';
import { VisionAiOperatorConfig } from './configs/VisionAiOperatorConfig';
import { NaturalLanguageOperatorConfig } from './configs/NaturalLanguageOperatorConfig';
import { TranslateOperatorConfig } from './configs/TranslateOperatorConfig';
import { SpeechOperatorConfig } from './configs/SpeechOperatorConfig';
// GCP Services configs - Database & Storage
import { SpannerOperatorConfig } from './configs/SpannerOperatorConfig';
import { BigtableOperatorConfig } from './configs/BigtableOperatorConfig';
import { FirestoreOperatorConfig } from './configs/FirestoreOperatorConfig';
import { MemorystoreOperatorConfig } from './configs/MemorystoreOperatorConfig';
import { AlloyDbOperatorConfig } from './configs/AlloyDbOperatorConfig';
// GCP Services configs - DevOps & Infrastructure
import { CloudBuildOperatorConfig } from './configs/CloudBuildOperatorConfig';
import { CloudTasksOperatorConfig } from './configs/CloudTasksOperatorConfig';
import { WorkflowsOperatorConfig } from './configs/WorkflowsOperatorConfig';
// GCP Services configs - BI & Security
import { LookerOperatorConfig } from './configs/LookerOperatorConfig';
import { CloudDlpOperatorConfig } from './configs/CloudDlpOperatorConfig';
// Azure Services configs
import { AdfOperatorConfig } from './configs/AdfOperatorConfig';
import { AdlsOperatorConfig } from './configs/AdlsOperatorConfig';
import { AciOperatorConfig } from './configs/AciOperatorConfig';
import { AzureBatchOperatorConfig } from './configs/AzureBatchOperatorConfig';
import { ServiceBusOperatorConfig } from './configs/ServiceBusOperatorConfig';
import { CosmosDbOperatorConfig } from './configs/CosmosDbOperatorConfig';
import { DataExplorerOperatorConfig } from './configs/DataExplorerOperatorConfig';
import { PowerBiOperatorConfig } from './configs/PowerBiOperatorConfig';
// Data Quality & Transformation configs
import { DbtCloudOperatorConfig } from './configs/DbtCloudOperatorConfig';
import { DbtCoreOperatorConfig } from './configs/DbtCoreOperatorConfig';
import { GreatExpectationsConfig } from './configs/GreatExpectationsConfig';
import { SodaCoreConfig } from './configs/SodaCoreConfig';
// ELT Integration configs
import { AirbyteOperatorConfig } from './configs/AirbyteOperatorConfig';
import { FivetranOperatorConfig } from './configs/FivetranOperatorConfig';
// File Transfer & Messaging configs
import { SftpOperatorConfig } from './configs/SftpOperatorConfig';
import { SshOperatorConfig } from './configs/SshOperatorConfig';
import { KafkaProduceConfig } from './configs/KafkaProduceConfig';
import { KafkaConsumeConfig } from './configs/KafkaConsumeConfig';
import { TrinoOperatorConfig } from './configs/TrinoOperatorConfig';
// Additional Notification configs
import { MsTeamsOperatorConfig } from './configs/MsTeamsOperatorConfig';
import { PagerDutyOperatorConfig } from './configs/PagerDutyOperatorConfig';
import { OpsgenieOperatorConfig } from './configs/OpsgenieOperatorConfig';

interface DagPropertiesPanelProps {
  selectedNodeId: string | null;
}

// Trigger rule options
const triggerRuleOptions = [
  { value: 'all_success', label: 'All Success (default)' },
  { value: 'all_failed', label: 'All Failed' },
  { value: 'all_done', label: 'All Done' },
  { value: 'one_success', label: 'One Success' },
  { value: 'one_failed', label: 'One Failed' },
  { value: 'none_failed', label: 'None Failed' },
  { value: 'none_skipped', label: 'None Skipped' },
  { value: 'dummy', label: 'Always Run' },
];

// Advanced Task Settings Component
interface AdvancedTaskSettingsProps {
  config: any;
  onChange: (updates: any) => void;
}

const AdvancedTaskSettings = ({ config, onChange }: AdvancedTaskSettingsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRetrySettings, setShowRetrySettings] = useState(false);

  return (
    <div className="border-t border-gray-700 pt-3 mt-3">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 text-xs font-medium text-gray-300 hover:text-gray-100 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
        <Sliders className="w-3.5 h-3.5" />
        <span>Advanced Settings</span>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-3">
          {/* Resource Pool */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Pool</label>
            <input
              type="text"
              value={config.pool || ''}
              onChange={(e) => onChange({ pool: e.target.value || undefined })}
              placeholder="default_pool"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Resource pool for task execution
            </p>
          </div>

          {/* Pool Slots & Priority */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Pool Slots</label>
              <input
                type="number"
                value={config.poolSlots ?? ''}
                onChange={(e) => onChange({ poolSlots: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="1"
                min={1}
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Priority Weight</label>
              <input
                type="number"
                value={config.priorityWeight ?? ''}
                onChange={(e) => onChange({ priorityWeight: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="1"
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          {/* Queue */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Queue</label>
            <input
              type="text"
              value={config.queue || ''}
              onChange={(e) => onChange({ queue: e.target.value || undefined })}
              placeholder="default"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Celery queue for task execution
            </p>
          </div>

          {/* Trigger Rule */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Trigger Rule</label>
            <select
              value={config.triggerRule || 'all_success'}
              onChange={(e) => onChange({ triggerRule: e.target.value === 'all_success' ? undefined : e.target.value })}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              {triggerRuleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Dependency Toggles */}
          <div className="space-y-2 border-t border-gray-700 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Depends on Past</span>
              <button
                onClick={() => onChange({ dependsOnPast: !config.dependsOnPast })}
                className={`w-10 h-5 rounded-full transition-colors
                          ${config.dependsOnPast ? 'bg-accent' : 'bg-gray-600'}`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transform transition-transform
                            ${config.dependsOnPast ? 'translate-x-5' : 'translate-x-0.5'}`}
                />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Task runs only if previous run succeeded
            </p>

            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">Wait for Downstream</span>
              <button
                onClick={() => onChange({ waitForDownstream: !config.waitForDownstream })}
                className={`w-10 h-5 rounded-full transition-colors
                          ${config.waitForDownstream ? 'bg-accent' : 'bg-gray-600'}`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transform transition-transform
                            ${config.waitForDownstream ? 'translate-x-5' : 'translate-x-0.5'}`}
                />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Wait for downstream tasks before running again
            </p>
          </div>

          {/* Retry Settings */}
          <div className="border-t border-gray-700 pt-3">
            <button
              onClick={() => setShowRetrySettings(!showRetrySettings)}
              className="w-full flex items-center gap-2 text-xs text-gray-400 hover:text-gray-200"
            >
              {showRetrySettings ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              <RotateCcw className="w-3 h-3" />
              <span>Task-Level Retry (overrides DAG default)</span>
            </button>

            {showRetrySettings && (
              <div className="mt-3 space-y-3 pl-2 border-l-2 border-gray-700">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Retries</label>
                    <input
                      type="number"
                      value={config.retries ?? ''}
                      onChange={(e) => onChange({ retries: e.target.value ? parseInt(e.target.value) : undefined })}
                      placeholder="DAG default"
                      min={0}
                      className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                                 border border-gray-600 focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Delay (sec)</label>
                    <input
                      type="number"
                      value={config.retryDelaySeconds ?? ''}
                      onChange={(e) => onChange({ retryDelaySeconds: e.target.value ? parseInt(e.target.value) : undefined })}
                      placeholder="300"
                      min={0}
                      className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                                 border border-gray-600 focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Exponential Backoff</span>
                  <button
                    onClick={() => onChange({ retryExponentialBackoff: !config.retryExponentialBackoff })}
                    className={`w-10 h-5 rounded-full transition-colors
                              ${config.retryExponentialBackoff ? 'bg-accent' : 'bg-gray-600'}`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transform transition-transform
                                ${config.retryExponentialBackoff ? 'translate-x-5' : 'translate-x-0.5'}`}
                    />
                  </button>
                </div>

                {config.retryExponentialBackoff && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Max Retry Delay (sec)</label>
                    <input
                      type="number"
                      value={config.maxRetryDelay ?? ''}
                      onChange={(e) => onChange({ maxRetryDelay: e.target.value ? parseInt(e.target.value) : undefined })}
                      placeholder="3600"
                      min={0}
                      className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                                 border border-gray-600 focus:border-accent focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Schedule presets
const schedulePresets = [
  { value: '@hourly', label: 'Hourly' },
  { value: '@daily', label: 'Daily' },
  { value: '@weekly', label: 'Weekly' },
  { value: '@monthly', label: 'Monthly' },
  { value: '@yearly', label: 'Yearly' },
];

export const DagPropertiesPanel = ({ selectedNodeId }: DagPropertiesPanelProps) => {
  // Get DAG page data from store
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const updateDagConfig = useWorkspaceStore((state) => state.updateDagConfig);
  const setDagTasks = useWorkspaceStore((state) => state.setDagTasks);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  const activePage = activeWorkspace?.pages.find(p => p.id === activeWorkspace?.activePageId);
  const dagPage = activePage && isDagPage(activePage) ? activePage : null;

  // Get ETL pages for reference
  const etlPages = activeWorkspace?.pages.filter(isWorkflowPage) || [];

  // Local state for config editing
  const [localConfig, setLocalConfig] = useState<DagConfig | null>(null);

  // Local state for task config editing
  const [localTaskConfig, setLocalTaskConfig] = useState<Record<string, any> | null>(null);
  const [localTaskLabel, setLocalTaskLabel] = useState<string>('');

  // Sync local state with store
  useEffect(() => {
    if (dagPage) {
      setLocalConfig(dagPage.dagConfig);
    }
  }, [dagPage?.dagConfig]);

  // Find selected node
  const selectedNode = dagPage?.tasks.find(t => t.id === selectedNodeId);

  // Sync local task config when selected node changes
  useEffect(() => {
    if (selectedNode) {
      const taskData = selectedNode.data as DagTaskNodeData;
      setLocalTaskConfig(taskData.config);
      setLocalTaskLabel(taskData.label);
    } else {
      setLocalTaskConfig(null);
      setLocalTaskLabel('');
    }
  }, [selectedNodeId, selectedNode?.data]);

  // Update DAG config in store
  const handleConfigChange = (updates: Partial<DagConfig>) => {
    if (!dagPage || !localConfig) return;
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    updateDagConfig(dagPage.id, updates);
  };

  // Update local task config (doesn't save to store yet)
  const handleLocalTaskConfigChange = (updates: Record<string, any>) => {
    if (!localTaskConfig) return;
    setLocalTaskConfig({ ...localTaskConfig, ...updates });
  };

  // Save task config to store
  const handleSaveTaskConfig = () => {
    if (!dagPage || !selectedNode || !localTaskConfig) return;
    const newTasks = dagPage.tasks.map(task =>
      task.id === selectedNode.id
        ? {
            ...task,
            data: {
              ...task.data,
              config: localTaskConfig as DagTaskNodeData['config'],
              label: localTaskLabel,
              configured: true,
            }
          }
        : task
    );
    setDagTasks(newTasks as any);
  };


  if (!dagPage || !localConfig) {
    return (
      <div className="w-72 bg-panel border-l border-gray-700 flex items-center justify-center">
        <p className="text-gray-500 text-sm">No DAG page selected</p>
      </div>
    );
  }

  // Render task-specific config
  const renderTaskConfig = () => {
    if (!selectedNode || !localTaskConfig) return null;

    const taskData = selectedNode.data as DagTaskNodeData;
    const commonProps = {
      config: localTaskConfig as any,
      onChange: handleLocalTaskConfigChange,
      etlPages,
    };

    switch (taskData.type) {
      case 'etl_task':
        return <EtlTaskConfig {...commonProps} />;
      case 'spark_submit':
        return <SparkSubmitConfig {...commonProps} />;
      case 'python':
        return <PythonConfig {...commonProps} />;
      case 'bash':
        return <BashConfig {...commonProps} />;
      case 'file_sensor':
        return <FileSensorConfig {...commonProps} />;
      case 's3_sensor':
        return <S3SensorConfig {...commonProps} />;
      case 'branch':
        return <BranchConfig {...commonProps} />;
      case 'dummy':
        return <DummyConfig {...commonProps} />;
      // Phase 1: New task types
      case 'sql_sensor':
        return <SqlSensorConfig {...commonProps} />;
      case 'http_sensor':
        return <HttpSensorConfig {...commonProps} />;
      case 'external_sensor':
        return <ExternalSensorConfig {...commonProps} />;
      case 'trigger_dag':
        return <TriggerDagConfig {...commonProps} />;
      case 'email':
        return <EmailConfig {...commonProps} />;
      case 'slack':
        return <SlackConfig {...commonProps} />;
      case 'sql_execute':
        return <SqlExecuteConfig {...commonProps} />;
      // Phase 2: Cloud Storage & Data
      case 'gcs_sensor':
        return <GcsSensorConfig {...commonProps} />;
      case 'azure_blob_sensor':
        return <AzureBlobSensorConfig {...commonProps} />;
      case 'snowflake':
        return <SnowflakeOperatorConfig {...commonProps} />;
      case 'delta_sensor':
        return <DeltaLakeSensorConfig {...commonProps} />;
      // Phase 3: Cloud Compute
      case 'kubernetes_pod':
        return <KubernetesPodConfig {...commonProps} />;
      case 'emr':
        return <EmrOperatorConfig {...commonProps} />;
      case 'dataproc':
        return <DataprocOperatorConfig {...commonProps} />;
      case 'databricks':
        return <DatabricksOperatorConfig {...commonProps} />;
      // Phase 4: Data Warehouse
      case 'bigquery':
        return <BigQueryOperatorConfig {...commonProps} />;
      case 'redshift':
        return <RedshiftOperatorConfig {...commonProps} />;
      case 'synapse':
        return <SynapseOperatorConfig {...commonProps} />;
      // AWS Services
      case 'athena':
        return <AthenaOperatorConfig {...commonProps} />;
      case 'glue_job':
        return <GlueJobOperatorConfig {...commonProps} />;
      case 'glue_crawler':
        return <GlueCrawlerOperatorConfig {...commonProps} />;
      case 'glue_databrew':
        return <GlueDataBrewOperatorConfig {...commonProps} />;
      case 'lambda':
        return <LambdaOperatorConfig {...commonProps} />;
      case 'step_function':
        return <StepFunctionOperatorConfig {...commonProps} />;
      case 'ecs':
        return <EcsOperatorConfig {...commonProps} />;
      case 'eks':
        return <EksOperatorConfig {...commonProps} />;
      case 'batch':
        return <BatchOperatorConfig {...commonProps} />;
      case 'sagemaker':
        return <SageMakerOperatorConfig {...commonProps} />;
      case 'sns':
        return <SnsOperatorConfig {...commonProps} />;
      case 'sqs':
        return <SqsOperatorConfig {...commonProps} />;
      case 'eventbridge':
        return <EventBridgeOperatorConfig {...commonProps} />;
      case 'dynamodb':
        return <DynamoDBOperatorConfig {...commonProps} />;
      case 'rds':
        return <RdsOperatorConfig {...commonProps} />;
      case 'cloudformation':
        return <CloudFormationOperatorConfig {...commonProps} />;
      case 'bedrock':
        return <BedrockOperatorConfig {...commonProps} />;
      case 's3':
        return <S3OperatorConfig {...commonProps} />;
      case 'kinesis':
        return <KinesisOperatorConfig {...commonProps} />;
      case 'appflow':
        return <AppFlowOperatorConfig {...commonProps} />;
      case 'comprehend':
        return <ComprehendOperatorConfig {...commonProps} />;
      case 'datasync':
        return <DataSyncOperatorConfig {...commonProps} />;
      case 'dms':
        return <DmsOperatorConfig {...commonProps} />;
      case 'ec2':
        return <Ec2OperatorConfig {...commonProps} />;
      case 'ssm':
        return <SsmOperatorConfig {...commonProps} />;
      case 'secrets_manager':
        return <SecretsManagerOperatorConfig {...commonProps} />;
      case 'cloudwatch':
        return <CloudWatchOperatorConfig {...commonProps} />;
      // GCP Services
      case 'gcs':
        return <GcsOperatorConfig {...commonProps} />;
      case 'cloud_run':
        return <CloudRunOperatorConfig {...commonProps} />;
      case 'cloud_function':
        return <CloudFunctionOperatorConfig {...commonProps} />;
      case 'gke':
        return <GkeOperatorConfig {...commonProps} />;
      case 'compute_engine':
        return <ComputeEngineOperatorConfig {...commonProps} />;
      // GCP Data & Analytics
      case 'dataflow':
        return <DataflowOperatorConfig {...commonProps} />;
      case 'cloud_sql':
        return <CloudSqlOperatorConfig {...commonProps} />;
      case 'pubsub':
        return <PubSubOperatorConfig {...commonProps} />;
      case 'datafusion':
        return <DataFusionOperatorConfig {...commonProps} />;
      case 'dataplex':
        return <DataplexOperatorConfig {...commonProps} />;
      case 'dataform':
        return <DataformOperatorConfig {...commonProps} />;
      case 'bigquery_data_transfer':
        return <BigQueryDataTransferConfig {...commonProps} />;
      // GCP AI/ML
      case 'vertex_ai':
        return <VertexAiOperatorConfig {...commonProps} />;
      case 'vision_ai':
        return <VisionAiOperatorConfig {...commonProps} />;
      case 'natural_language':
        return <NaturalLanguageOperatorConfig {...commonProps} />;
      case 'translate':
        return <TranslateOperatorConfig {...commonProps} />;
      case 'speech':
        return <SpeechOperatorConfig {...commonProps} />;
      // GCP Database & Storage
      case 'spanner':
        return <SpannerOperatorConfig {...commonProps} />;
      case 'bigtable':
        return <BigtableOperatorConfig {...commonProps} />;
      case 'firestore':
        return <FirestoreOperatorConfig {...commonProps} />;
      case 'memorystore':
        return <MemorystoreOperatorConfig {...commonProps} />;
      case 'alloydb':
        return <AlloyDbOperatorConfig {...commonProps} />;
      // GCP DevOps & Infrastructure
      case 'cloud_build':
        return <CloudBuildOperatorConfig {...commonProps} />;
      case 'cloud_tasks':
        return <CloudTasksOperatorConfig {...commonProps} />;
      case 'workflows':
        return <WorkflowsOperatorConfig {...commonProps} />;
      // GCP BI & Security
      case 'looker':
        return <LookerOperatorConfig {...commonProps} />;
      case 'cloud_dlp':
        return <CloudDlpOperatorConfig {...commonProps} />;
      // Azure Services
      case 'adf':
        return <AdfOperatorConfig {...commonProps} />;
      case 'adls':
        return <AdlsOperatorConfig {...commonProps} />;
      case 'aci':
        return <AciOperatorConfig {...commonProps} />;
      case 'azure_batch':
        return <AzureBatchOperatorConfig {...commonProps} />;
      case 'service_bus':
        return <ServiceBusOperatorConfig {...commonProps} />;
      case 'cosmos_db':
        return <CosmosDbOperatorConfig {...commonProps} />;
      case 'data_explorer':
        return <DataExplorerOperatorConfig {...commonProps} />;
      case 'power_bi':
        return <PowerBiOperatorConfig {...commonProps} />;
      // Data Quality & Transformation
      case 'dbt_cloud':
        return <DbtCloudOperatorConfig {...commonProps} />;
      case 'dbt_core':
        return <DbtCoreOperatorConfig {...commonProps} />;
      case 'great_expectations':
        return <GreatExpectationsConfig {...commonProps} />;
      case 'soda_core':
        return <SodaCoreConfig {...commonProps} />;
      // ELT Integration
      case 'airbyte':
        return <AirbyteOperatorConfig {...commonProps} />;
      case 'fivetran':
        return <FivetranOperatorConfig {...commonProps} />;
      // File Transfer & Messaging
      case 'sftp':
        return <SftpOperatorConfig {...commonProps} />;
      case 'ssh':
        return <SshOperatorConfig {...commonProps} />;
      case 'kafka_produce':
        return <KafkaProduceConfig {...commonProps} />;
      case 'kafka_consume':
        return <KafkaConsumeConfig {...commonProps} />;
      case 'trino':
        return <TrinoOperatorConfig {...commonProps} />;
      // Additional Notifications
      case 'ms_teams':
        return <MsTeamsOperatorConfig {...commonProps} />;
      case 'pagerduty':
        return <PagerDutyOperatorConfig {...commonProps} />;
      case 'opsgenie':
        return <OpsgenieOperatorConfig {...commonProps} />;
      default:
        return (
          <div className="p-4 text-gray-400 text-sm">
            Configuration not available for this task type.
          </div>
        );
    }
  };

  return (
    <div className="w-72 bg-panel border-l border-gray-700 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
          <Settings className="w-4 h-4 text-accent" />
          {selectedNode ? 'Task Config' : 'DAG Config'}
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedNode && localTaskConfig ? (
          // Task configuration
          <div className="p-3 space-y-4">
            {/* Task Header */}
            <div className="bg-panel-light rounded-lg p-3">
              <label className="block text-xs text-gray-400 mb-1">Task ID</label>
              <input
                type="text"
                value={localTaskConfig.taskId || ''}
                onChange={(e) => {
                  handleLocalTaskConfigChange({ taskId: e.target.value });
                  setLocalTaskLabel(e.target.value);
                }}
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none"
              />
            </div>

            {/* Task-specific config */}
            {renderTaskConfig()}

            {/* Advanced Task Settings */}
            <AdvancedTaskSettings
              config={localTaskConfig}
              onChange={handleLocalTaskConfigChange}
            />

            {/* Save Button */}
            <button
              onClick={handleSaveTaskConfig}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-md transition-colors"
            >
              <Save className="w-4 h-4" /> Save Configuration
            </button>
          </div>
        ) : (
          // DAG configuration
          <div className="p-3 space-y-4">
            {/* DAG ID */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">DAG ID</label>
              <input
                type="text"
                value={localConfig.dagId}
                onChange={(e) => handleConfigChange({ dagId: e.target.value })}
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Description</label>
              <textarea
                value={localConfig.description}
                onChange={(e) => handleConfigChange({ description: e.target.value })}
                rows={2}
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none resize-none"
              />
            </div>

            {/* Schedule Section */}
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-xs font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                Schedule
              </h3>

              {/* Schedule Type */}
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Type</label>
                <select
                  value={localConfig.schedule.type}
                  onChange={(e) => handleConfigChange({
                    schedule: { ...localConfig.schedule, type: e.target.value as any }
                  })}
                  className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                             border border-gray-600 focus:border-accent focus:outline-none"
                >
                  <option value="manual">Manual</option>
                  <option value="preset">Preset</option>
                  <option value="cron">Cron Expression</option>
                </select>
              </div>

              {/* Preset selector */}
              {localConfig.schedule.type === 'preset' && (
                <div className="mb-3">
                  <label className="block text-xs text-gray-400 mb-1">Preset</label>
                  <div className="flex flex-wrap gap-1">
                    {schedulePresets.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => handleConfigChange({
                          schedule: { ...localConfig.schedule, preset: preset.value as any }
                        })}
                        className={`px-2 py-1 text-xs rounded-md transition-colors
                                  ${localConfig.schedule.preset === preset.value
                                    ? 'bg-accent text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cron expression */}
              {localConfig.schedule.type === 'cron' && (
                <div className="mb-3">
                  <label className="block text-xs text-gray-400 mb-1">Cron Expression</label>
                  <input
                    type="text"
                    value={localConfig.schedule.cron || ''}
                    onChange={(e) => handleConfigChange({
                      schedule: { ...localConfig.schedule, cron: e.target.value }
                    })}
                    placeholder="0 5 * * *"
                    className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                               border border-gray-600 focus:border-accent focus:outline-none font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">min hour day month dow</p>
                </div>
              )}

              {/* Catchup toggle */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Catchup</span>
                <button
                  onClick={() => handleConfigChange({ catchup: !localConfig.catchup })}
                  className={`w-10 h-5 rounded-full transition-colors
                            ${localConfig.catchup ? 'bg-accent' : 'bg-gray-600'}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transform transition-transform
                              ${localConfig.catchup ? 'translate-x-5' : 'translate-x-0.5'}`}
                  />
                </button>
              </div>
            </div>

            {/* Default Args Section */}
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-xs font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Default Args
              </h3>

              {/* Owner */}
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Owner</label>
                <input
                  type="text"
                  value={localConfig.defaultArgs.owner}
                  onChange={(e) => handleConfigChange({
                    defaultArgs: { ...localConfig.defaultArgs, owner: e.target.value }
                  })}
                  className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                             border border-gray-600 focus:border-accent focus:outline-none"
                />
              </div>

              {/* Retries */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Retries</label>
                  <input
                    type="number"
                    value={localConfig.defaultArgs.retries}
                    onChange={(e) => handleConfigChange({
                      defaultArgs: { ...localConfig.defaultArgs, retries: parseInt(e.target.value) || 0 }
                    })}
                    min={0}
                    className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                               border border-gray-600 focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Retry Delay (min)</label>
                  <input
                    type="number"
                    value={localConfig.defaultArgs.retryDelayMinutes}
                    onChange={(e) => handleConfigChange({
                      defaultArgs: { ...localConfig.defaultArgs, retryDelayMinutes: parseInt(e.target.value) || 5 }
                    })}
                    min={1}
                    className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                               border border-gray-600 focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              {/* Timeout */}
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Execution Timeout (min)</label>
                <input
                  type="number"
                  value={localConfig.defaultArgs.executionTimeoutMinutes}
                  onChange={(e) => handleConfigChange({
                    defaultArgs: { ...localConfig.defaultArgs, executionTimeoutMinutes: parseInt(e.target.value) || 60 }
                  })}
                  min={1}
                  className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                             border border-gray-600 focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            {/* Alerts Section */}
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-xs font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                Alerts
              </h3>

              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={localConfig.defaultArgs.email || ''}
                  onChange={(e) => handleConfigChange({
                    defaultArgs: { ...localConfig.defaultArgs, email: e.target.value }
                  })}
                  placeholder="alerts@company.com"
                  className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                             border border-gray-600 focus:border-accent focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localConfig.defaultArgs.emailOnFailure}
                    onChange={(e) => handleConfigChange({
                      defaultArgs: { ...localConfig.defaultArgs, emailOnFailure: e.target.checked }
                    })}
                    className="rounded border-gray-600 bg-gray-800 text-accent focus:ring-accent"
                  />
                  Email on failure
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localConfig.defaultArgs.emailOnRetry}
                    onChange={(e) => handleConfigChange({
                      defaultArgs: { ...localConfig.defaultArgs, emailOnRetry: e.target.checked }
                    })}
                    className="rounded border-gray-600 bg-gray-800 text-accent focus:ring-accent"
                  />
                  Email on retry
                </label>
              </div>
            </div>

            {/* Tags Section */}
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-xs font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" />
                Tags
              </h3>

              <div className="flex flex-wrap gap-1 mb-2">
                {localConfig.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-md flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => handleConfigChange({
                        tags: localConfig.tags.filter((_, i) => i !== index)
                      })}
                      className="hover:text-red-400"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>

              <input
                type="text"
                placeholder="Add tag and press Enter"
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = (e.target as HTMLInputElement).value.trim();
                    if (value && !localConfig.tags.includes(value)) {
                      handleConfigChange({ tags: [...localConfig.tags, value] });
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
