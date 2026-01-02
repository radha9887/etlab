import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import {
  FileText,
  Zap,
  Terminal,
  Code,
  File,
  Cloud,
  Database,
  Globe,
  ExternalLink,
  GitBranch,
  Workflow,
  Circle,
  Mail,
  MessageSquare,
  Clock,
  X,
  AlertTriangle,
  AlertCircle,
  Info,
} from 'lucide-react';
import type { DagTaskNodeData, DagNodeType, DagNodeCategory } from '../../types';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import type { ValidationIssue } from '../../utils/dagValidator';

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  etl_task: FileText,
  spark_submit: Zap,
  python: Code,
  bash: Terminal,
  file_sensor: File,
  s3_sensor: Cloud,
  sql_sensor: Database,
  http_sensor: Globe,
  external_sensor: ExternalLink,
  branch: GitBranch,
  trigger_dag: Workflow,
  dummy: Circle,
  email: Mail,
  slack: MessageSquare,
  sql_execute: Database,
  task_group: Workflow,
};

// Category colors (background) - simplified cloud provider grouping
const categoryBgColors: Record<DagNodeCategory, string> = {
  etl: 'bg-blue-500/20 border-blue-500/50',
  action: 'bg-green-500/20 border-green-500/50',
  sensor: 'bg-yellow-500/20 border-yellow-500/50',
  control: 'bg-purple-500/20 border-purple-500/50',
  notify: 'bg-pink-500/20 border-pink-500/50',
  aws: 'bg-orange-500/20 border-orange-500/50',
  gcp: 'bg-sky-500/20 border-sky-500/50',
  azure: 'bg-cyan-500/20 border-cyan-500/50',
  quality: 'bg-emerald-500/20 border-emerald-500/50',
  integration: 'bg-violet-500/20 border-violet-500/50',
  other: 'bg-indigo-500/20 border-indigo-500/50',
};

// Category accent colors
const categoryAccentColors: Record<DagNodeCategory, string> = {
  etl: 'text-blue-400',
  action: 'text-green-400',
  sensor: 'text-yellow-400',
  control: 'text-purple-400',
  notify: 'text-pink-400',
  aws: 'text-orange-400',
  gcp: 'text-sky-400',
  azure: 'text-cyan-400',
  quality: 'text-emerald-400',
  integration: 'text-violet-400',
  other: 'text-indigo-400',
};

// Type labels for display
const typeLabels: Record<DagNodeType, string> = {
  etl_task: 'ETL Task',
  spark_submit: 'SparkSubmit',
  python: 'Python',
  bash: 'Bash',
  file_sensor: 'FileSensor',
  s3_sensor: 'S3Sensor',
  sql_sensor: 'SqlSensor',
  http_sensor: 'HttpSensor',
  external_sensor: 'ExternalTask',
  branch: 'Branch',
  trigger_dag: 'TriggerDAG',
  dummy: 'Dummy',
  email: 'Email',
  slack: 'Slack',
  sql_execute: 'SqlExecute',
  task_group: 'TaskGroup',
  // Cloud Storage
  gcs_sensor: 'GCS Sensor',
  azure_blob_sensor: 'Azure Blob',
  delta_sensor: 'Delta Sensor',
  s3: 'S3',
  // Cloud Compute
  kubernetes_pod: 'K8s Pod',
  emr: 'EMR',
  dataproc: 'Dataproc',
  databricks: 'Databricks',
  // Data Warehouse
  bigquery: 'BigQuery',
  redshift: 'Redshift',
  synapse: 'Synapse',
  snowflake: 'Snowflake',
  // AWS Services
  athena: 'Athena',
  glue_job: 'Glue Job',
  glue_crawler: 'Glue Crawler',
  glue_databrew: 'Glue DataBrew',
  lambda: 'Lambda',
  step_function: 'Step Functions',
  ecs: 'ECS',
  eks: 'EKS',
  batch: 'Batch',
  sagemaker: 'SageMaker',
  sns: 'SNS',
  sqs: 'SQS',
  eventbridge: 'EventBridge',
  dynamodb: 'DynamoDB',
  rds: 'RDS',
  cloudformation: 'CloudFormation',
  bedrock: 'Bedrock',
  kinesis: 'Kinesis',
  appflow: 'AppFlow',
  comprehend: 'Comprehend',
  datasync: 'DataSync',
  dms: 'DMS',
  ec2: 'EC2',
  ssm: 'SSM',
  secrets_manager: 'Secrets Manager',
  cloudwatch: 'CloudWatch',
  // GCP Services - Compute & Containers
  gcs: 'GCS',
  cloud_run: 'Cloud Run',
  cloud_function: 'Cloud Function',
  gke: 'GKE',
  compute_engine: 'Compute Engine',
  // GCP Services - Data & Analytics
  dataflow: 'Dataflow',
  cloud_sql: 'Cloud SQL',
  pubsub: 'Pub/Sub',
  datafusion: 'DataFusion',
  dataplex: 'Dataplex',
  dataform: 'Dataform',
  bigquery_data_transfer: 'BQ Transfer',
  // GCP Services - AI/ML
  vertex_ai: 'Vertex AI',
  vision_ai: 'Vision AI',
  natural_language: 'NL API',
  translate: 'Translate',
  speech: 'Speech',
  // GCP Services - Database & Storage
  spanner: 'Spanner',
  bigtable: 'Bigtable',
  firestore: 'Firestore',
  memorystore: 'Memorystore',
  alloydb: 'AlloyDB',
  // GCP Services - DevOps & Infrastructure
  cloud_build: 'Cloud Build',
  cloud_tasks: 'Cloud Tasks',
  workflows: 'Workflows',
  // GCP Services - BI & Monitoring
  looker: 'Looker',
  cloud_dlp: 'Cloud DLP',
  // Azure Services - Storage & Data
  adf: 'Data Factory',
  adls: 'ADLS',
  data_explorer: 'Data Explorer',
  // Azure Services - Compute
  aci: 'ACI',
  azure_batch: 'Azure Batch',
  // Azure Services - Database & Messaging
  cosmos_db: 'Cosmos DB',
  service_bus: 'Service Bus',
  // Azure Services - Analytics & BI
  power_bi: 'Power BI',
  // Data Quality & Transformation
  dbt_cloud: 'dbt Cloud',
  dbt_core: 'dbt Core',
  great_expectations: 'Great Expectations',
  soda_core: 'Soda Core',
  // ELT Integration
  airbyte: 'Airbyte',
  fivetran: 'Fivetran',
  // File Transfer & Messaging
  sftp: 'SFTP',
  ssh: 'SSH',
  kafka_produce: 'Kafka Produce',
  kafka_consume: 'Kafka Consume',
  trino: 'Trino',
  // Additional Notifications
  ms_teams: 'MS Teams',
  pagerduty: 'PagerDuty',
  opsgenie: 'OpsGenie',
};

// Validation indicator component
const ValidationIndicator = ({ issues }: { issues: ValidationIssue[] }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (issues.length === 0) return null;

  // Determine severity - error > warning > info
  const hasError = issues.some(i => i.severity === 'error');
  const hasWarning = issues.some(i => i.severity === 'warning');

  const IconComponent = hasError ? AlertCircle : hasWarning ? AlertTriangle : Info;
  const colorClass = hasError
    ? 'text-red-400 bg-red-500/20 border-red-500/50'
    : hasWarning
      ? 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50'
      : 'text-blue-400 bg-blue-500/20 border-blue-500/50';

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={`absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center border ${colorClass} shadow-lg z-10`}>
        <IconComponent className="w-3 h-3" />
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute left-4 top-0 z-50 min-w-[200px] max-w-[280px]">
          <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-2 space-y-1">
            <div className="text-xs font-medium text-gray-300 border-b border-gray-700 pb-1 mb-1">
              {issues.length} validation issue{issues.length > 1 ? 's' : ''}
            </div>
            {issues.map((issue, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                {issue.severity === 'error' && <AlertCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />}
                {issue.severity === 'warning' && <AlertTriangle className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />}
                {issue.severity === 'info' && <Info className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />}
                <div className="text-[10px] text-gray-400">
                  <p className="text-gray-300">{issue.message}</p>
                  {issue.suggestion && (
                    <p className="text-gray-500 italic mt-0.5">{issue.suggestion}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

type DagNodeProps = NodeProps<Node<DagTaskNodeData>> & {
  validationIssues?: ValidationIssue[];
};

export const DagNode = memo(({ id, data, selected }: DagNodeProps) => {
  const deleteDagTask = useWorkspaceStore((state) => state.deleteDagTask);
  const dagValidation = useWorkspaceStore((state) => state.dagValidation);
  const nodeData = data as DagTaskNodeData;

  // Get validation issues for this node
  // Handle both Map (runtime) and plain object (after localStorage deserialization)
  const nodeValidations = dagValidation?.nodeValidations;
  const nodeValidation = nodeValidations instanceof Map
    ? nodeValidations.get(id)
    : nodeValidations?.[id];
  const nodeIssues = nodeValidation?.issues || [];
  const Icon = iconMap[nodeData.type] || Circle;
  const bgColorClass = categoryBgColors[nodeData.category];
  const accentColorClass = categoryAccentColors[nodeData.category];

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteDagTask(id);
  };

  // Get additional info based on node type
  const getSubtitle = () => {
    const config = nodeData.config as any;
    switch (nodeData.type) {
      case 'etl_task':
        return config?.pageName || 'No page selected';
      case 'spark_submit':
        return config?.application || 'No application';
      case 'python':
        return 'Python callable';
      case 'bash':
        return config?.bashCommand?.substring(0, 30) || 'No command';
      case 'file_sensor':
        return config?.filepath?.substring(0, 30) || 'No path';
      case 's3_sensor':
        return config?.bucketKey?.substring(0, 30) || 'No key';
      case 'branch':
        return `${config?.conditions?.length || 0} conditions`;
      default:
        return typeLabels[nodeData.type];
    }
  };

  // Check if sensor (show timer indicator)
  const isSensor = nodeData.category === 'sensor';
  const sensorInterval = isSensor ? (nodeData.config as any)?.pokeIntervalSeconds : null;

  return (
    <div
      className={`min-w-[180px] max-w-[220px] rounded-lg border-2 ${bgColorClass}
                  ${selected ? 'ring-2 ring-white/50' : ''} transition-all group relative`}
    >
      {/* Validation Indicator */}
      <ValidationIndicator issues={nodeIssues} />

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600
                   rounded-full flex items-center justify-center
                   opacity-0 group-hover:opacity-100 transition-opacity
                   shadow-lg z-10"
        title="Remove task"
      >
        <X className="w-3 h-3 text-white" />
      </button>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-600/50">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${accentColorClass}`} />
          <span className="text-sm font-medium text-gray-200 truncate">{nodeData.label}</span>
        </div>
        {isSensor && sensorInterval && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{sensorInterval}s</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-3 py-2">
        <div className="text-xs text-gray-400">{typeLabels[nodeData.type]}</div>
        <div className="text-xs text-gray-500 truncate mt-0.5">{getSubtitle()}</div>
      </div>

      {/* Status indicator */}
      {!nodeData.configured && (
        <div className="px-3 py-1.5 bg-orange-500/20 border-t border-orange-500/30">
          <span className="text-xs text-orange-400">Not configured</span>
        </div>
      )}

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-gray-600"
      />

      {/* For branch nodes, could add multiple output handles */}
      {nodeData.type === 'branch' ? (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="success"
            className="!w-3 !h-3 !bg-green-400 !border-2 !border-gray-600"
            style={{ top: '40%' }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="failure"
            className="!w-3 !h-3 !bg-red-400 !border-2 !border-gray-600"
            style={{ top: '60%' }}
          />
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-gray-400 !border-2 !border-gray-600"
        />
      )}
    </div>
  );
});

DagNode.displayName = 'DagNode';
