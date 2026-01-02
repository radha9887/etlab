import { useState } from 'react';
import {
  FileText,
  Zap,
  Search,
  GitBranch,
  ChevronDown,
  ChevronRight,
  Workflow,
  Terminal,
  Code,
  File,
  Cloud,
  Clock,
  Globe,
  ExternalLink,
  Mail,
  MessageSquare,
  Database,
  Circle,
  X,
  Server,
  Box,
  Layers,
  CheckCircle,
  Link,
  AlertTriangle,
  Upload,
  Download,
  Radio,
} from 'lucide-react';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { isWorkflowPage } from '../../types';
import type { DagNodeCategory, DraggableDagNodeItem } from '../../types';

// ============================================
// Node Definitions - Simplified Cloud Provider Grouping
// ============================================

interface NodeCategory {
  name: string;
  icon: React.ReactNode;
  nodes: DraggableDagNodeItem[];
}

// Action categories - Operators (Spark, Python, Bash, SQL)
const actionCategories: NodeCategory[] = [
  {
    name: 'Operators',
    icon: <Zap className="w-3 h-3" />,
    nodes: [
      { type: 'spark_submit', category: 'action', label: 'Spark Submit', icon: 'Zap', description: 'Submit Spark job' },
      { type: 'python', category: 'action', label: 'Python', icon: 'Code', description: 'Run Python code' },
      { type: 'bash', category: 'action', label: 'Bash', icon: 'Terminal', description: 'Run shell command' },
      { type: 'sql_execute', category: 'action', label: 'SQL Execute', icon: 'Database', description: 'Execute SQL query' },
    ],
  },
];

// Sensor categories - Generic sensors
const sensorCategories: NodeCategory[] = [
  {
    name: 'Sensors',
    icon: <Clock className="w-3 h-3" />,
    nodes: [
      { type: 'file_sensor', category: 'sensor', label: 'File Sensor', icon: 'File', description: 'Wait for file' },
      { type: 'sql_sensor', category: 'sensor', label: 'SQL Sensor', icon: 'Database', description: 'Wait for query result' },
      { type: 'http_sensor', category: 'sensor', label: 'HTTP Sensor', icon: 'Globe', description: 'Wait for API response' },
      { type: 'external_sensor', category: 'sensor', label: 'External Task', icon: 'ExternalLink', description: 'Wait for another DAG' },
    ],
  },
];

// Control categories - Flow control
const controlCategories: NodeCategory[] = [
  {
    name: 'Flow Control',
    icon: <GitBranch className="w-3 h-3" />,
    nodes: [
      { type: 'branch', category: 'control', label: 'Branch', icon: 'GitBranch', description: 'Conditional routing' },
      { type: 'trigger_dag', category: 'control', label: 'Trigger DAG', icon: 'Workflow', description: 'Trigger another DAG' },
      { type: 'dummy', category: 'control', label: 'Dummy', icon: 'Circle', description: 'Placeholder task' },
    ],
  },
];

// Notify categories - Notifications
const notifyCategories: NodeCategory[] = [
  {
    name: 'Notifications',
    icon: <Mail className="w-3 h-3" />,
    nodes: [
      { type: 'email', category: 'notify', label: 'Email', icon: 'Mail', description: 'Send email' },
      { type: 'slack', category: 'notify', label: 'Slack', icon: 'MessageSquare', description: 'Send Slack message' },
      { type: 'ms_teams', category: 'notify', label: 'MS Teams', icon: 'MessageSquare', description: 'Send Teams message' },
      { type: 'pagerduty', category: 'notify', label: 'PagerDuty', icon: 'AlertTriangle', description: 'Trigger PagerDuty alert' },
      { type: 'opsgenie', category: 'notify', label: 'Opsgenie', icon: 'AlertTriangle', description: 'Create Opsgenie alert' },
    ],
  },
];

// AWS - All AWS Services
const awsCategories: NodeCategory[] = [
  {
    name: 'Storage & Data',
    icon: <Database className="w-3 h-3" />,
    nodes: [
      { type: 's3', category: 'aws', label: 'S3', icon: 'Cloud', description: 'S3 operations' },
      { type: 's3_sensor', category: 'aws', label: 'S3 Sensor', icon: 'Cloud', description: 'Wait for S3 object' },
      { type: 'athena', category: 'aws', label: 'Athena', icon: 'Database', description: 'Query S3 with SQL' },
      { type: 'dynamodb', category: 'aws', label: 'DynamoDB', icon: 'Database', description: 'DynamoDB ops' },
      { type: 'rds', category: 'aws', label: 'RDS', icon: 'Database', description: 'RDS operations' },
      { type: 'redshift', category: 'aws', label: 'Redshift', icon: 'Database', description: 'AWS Redshift' },
      { type: 'kinesis', category: 'aws', label: 'Kinesis', icon: 'Zap', description: 'Kinesis streaming' },
    ],
  },
  {
    name: 'ETL & Analytics',
    icon: <Zap className="w-3 h-3" />,
    nodes: [
      { type: 'glue_job', category: 'aws', label: 'Glue Job', icon: 'Zap', description: 'Run Glue ETL job' },
      { type: 'glue_crawler', category: 'aws', label: 'Glue Crawler', icon: 'Database', description: 'Run Glue crawler' },
      { type: 'glue_databrew', category: 'aws', label: 'DataBrew', icon: 'Database', description: 'Glue DataBrew job' },
      { type: 'emr', category: 'aws', label: 'EMR', icon: 'Server', description: 'AWS EMR Spark' },
      { type: 'appflow', category: 'aws', label: 'AppFlow', icon: 'Workflow', description: 'SaaS integration' },
      { type: 'datasync', category: 'aws', label: 'DataSync', icon: 'Cloud', description: 'Data transfer' },
      { type: 'dms', category: 'aws', label: 'DMS', icon: 'Database', description: 'Database migration' },
    ],
  },
  {
    name: 'Compute',
    icon: <Server className="w-3 h-3" />,
    nodes: [
      { type: 'lambda', category: 'aws', label: 'Lambda', icon: 'Zap', description: 'Invoke Lambda' },
      { type: 'step_function', category: 'aws', label: 'Step Functions', icon: 'Workflow', description: 'State machine' },
      { type: 'ecs', category: 'aws', label: 'ECS', icon: 'Box', description: 'Run ECS task' },
      { type: 'eks', category: 'aws', label: 'EKS', icon: 'Box', description: 'Run on EKS' },
      { type: 'batch', category: 'aws', label: 'Batch', icon: 'Zap', description: 'AWS Batch job' },
      { type: 'ec2', category: 'aws', label: 'EC2', icon: 'Server', description: 'EC2 operations' },
    ],
  },
  {
    name: 'AI/ML',
    icon: <Zap className="w-3 h-3" />,
    nodes: [
      { type: 'sagemaker', category: 'aws', label: 'SageMaker', icon: 'Zap', description: 'ML training/inference' },
      { type: 'bedrock', category: 'aws', label: 'Bedrock', icon: 'Zap', description: 'GenAI models' },
      { type: 'comprehend', category: 'aws', label: 'Comprehend', icon: 'Zap', description: 'NLP analysis' },
    ],
  },
  {
    name: 'Messaging & Events',
    icon: <Mail className="w-3 h-3" />,
    nodes: [
      { type: 'sns', category: 'aws', label: 'SNS', icon: 'Mail', description: 'Publish to SNS' },
      { type: 'sqs', category: 'aws', label: 'SQS', icon: 'MessageSquare', description: 'Send to SQS' },
      { type: 'eventbridge', category: 'aws', label: 'EventBridge', icon: 'Zap', description: 'Put events' },
    ],
  },
  {
    name: 'Management',
    icon: <Cloud className="w-3 h-3" />,
    nodes: [
      { type: 'cloudformation', category: 'aws', label: 'CloudFormation', icon: 'Layers', description: 'Stack operations' },
      { type: 'ssm', category: 'aws', label: 'SSM', icon: 'Terminal', description: 'Systems Manager' },
      { type: 'secrets_manager', category: 'aws', label: 'Secrets', icon: 'Cloud', description: 'Manage secrets' },
      { type: 'cloudwatch', category: 'aws', label: 'CloudWatch', icon: 'Clock', description: 'Metrics & logs' },
    ],
  },
];

// GCP - Google Cloud Platform Services
const gcpCategories: NodeCategory[] = [
  {
    name: 'Storage & Data',
    icon: <Database className="w-3 h-3" />,
    nodes: [
      { type: 'gcs', category: 'gcp', label: 'GCS', icon: 'Cloud', description: 'GCS operations' },
      { type: 'gcs_sensor', category: 'gcp', label: 'GCS Sensor', icon: 'Cloud', description: 'Wait for GCS object' },
      { type: 'bigquery', category: 'gcp', label: 'BigQuery', icon: 'Database', description: 'BigQuery SQL' },
      { type: 'bigquery_data_transfer', category: 'gcp', label: 'BQ Transfer', icon: 'Database', description: 'Data transfer service' },
      { type: 'dataflow', category: 'gcp', label: 'Dataflow', icon: 'Zap', description: 'Dataflow pipeline' },
      { type: 'cloud_sql', category: 'gcp', label: 'Cloud SQL', icon: 'Database', description: 'Cloud SQL queries' },
      { type: 'pubsub', category: 'gcp', label: 'Pub/Sub', icon: 'MessageSquare', description: 'Pub/Sub messaging' },
      { type: 'datafusion', category: 'gcp', label: 'DataFusion', icon: 'Workflow', description: 'Data integration' },
      { type: 'dataplex', category: 'gcp', label: 'Dataplex', icon: 'Database', description: 'Data governance' },
      { type: 'dataform', category: 'gcp', label: 'Dataform', icon: 'Code', description: 'SQL workflow' },
    ],
  },
  {
    name: 'Compute',
    icon: <Server className="w-3 h-3" />,
    nodes: [
      { type: 'dataproc', category: 'gcp', label: 'Dataproc', icon: 'Server', description: 'Dataproc Spark' },
      { type: 'cloud_run', category: 'gcp', label: 'Cloud Run', icon: 'Box', description: 'Serverless containers' },
      { type: 'cloud_function', category: 'gcp', label: 'Cloud Functions', icon: 'Zap', description: 'Serverless functions' },
      { type: 'gke', category: 'gcp', label: 'GKE', icon: 'Box', description: 'Kubernetes Engine' },
      { type: 'compute_engine', category: 'gcp', label: 'Compute Engine', icon: 'Server', description: 'VM instances' },
    ],
  },
  {
    name: 'AI/ML',
    icon: <Zap className="w-3 h-3" />,
    nodes: [
      { type: 'vertex_ai', category: 'gcp', label: 'Vertex AI', icon: 'Zap', description: 'ML platform' },
      { type: 'vision_ai', category: 'gcp', label: 'Vision AI', icon: 'Zap', description: 'Image analysis' },
      { type: 'natural_language', category: 'gcp', label: 'Natural Language', icon: 'Zap', description: 'NLP analysis' },
      { type: 'translate', category: 'gcp', label: 'Translate', icon: 'Globe', description: 'Translation API' },
      { type: 'speech', category: 'gcp', label: 'Speech', icon: 'Zap', description: 'Speech-to-Text/TTS' },
    ],
  },
  {
    name: 'Database',
    icon: <Database className="w-3 h-3" />,
    nodes: [
      { type: 'spanner', category: 'gcp', label: 'Spanner', icon: 'Database', description: 'Distributed SQL' },
      { type: 'bigtable', category: 'gcp', label: 'Bigtable', icon: 'Database', description: 'Wide-column NoSQL' },
      { type: 'firestore', category: 'gcp', label: 'Firestore', icon: 'Database', description: 'Document database' },
      { type: 'memorystore', category: 'gcp', label: 'Memorystore', icon: 'Database', description: 'Redis/Memcached' },
      { type: 'alloydb', category: 'gcp', label: 'AlloyDB', icon: 'Database', description: 'PostgreSQL compatible' },
    ],
  },
  {
    name: 'DevOps & BI',
    icon: <Workflow className="w-3 h-3" />,
    nodes: [
      { type: 'cloud_build', category: 'gcp', label: 'Cloud Build', icon: 'Workflow', description: 'CI/CD pipeline' },
      { type: 'cloud_tasks', category: 'gcp', label: 'Cloud Tasks', icon: 'Clock', description: 'Task queuing' },
      { type: 'workflows', category: 'gcp', label: 'Workflows', icon: 'Workflow', description: 'Serverless workflow' },
      { type: 'looker', category: 'gcp', label: 'Looker', icon: 'Database', description: 'BI platform' },
      { type: 'cloud_dlp', category: 'gcp', label: 'Cloud DLP', icon: 'Cloud', description: 'Data protection' },
    ],
  },
];

// Azure - Microsoft Azure Services
const azureCategories: NodeCategory[] = [
  {
    name: 'Storage & Data',
    icon: <Database className="w-3 h-3" />,
    nodes: [
      { type: 'azure_blob_sensor', category: 'azure', label: 'Blob Sensor', icon: 'Cloud', description: 'Azure Blob Storage' },
      { type: 'adls', category: 'azure', label: 'ADLS', icon: 'Cloud', description: 'Data Lake Storage' },
      { type: 'synapse', category: 'azure', label: 'Synapse', icon: 'Database', description: 'Azure Synapse' },
      { type: 'adf', category: 'azure', label: 'Data Factory', icon: 'Workflow', description: 'Azure Data Factory' },
      { type: 'data_explorer', category: 'azure', label: 'Data Explorer', icon: 'Database', description: 'Azure Data Explorer' },
    ],
  },
  {
    name: 'Compute',
    icon: <Server className="w-3 h-3" />,
    nodes: [
      { type: 'aci', category: 'azure', label: 'Container Instances', icon: 'Box', description: 'Azure Container Instances' },
      { type: 'azure_batch', category: 'azure', label: 'Batch', icon: 'Server', description: 'Azure Batch' },
    ],
  },
  {
    name: 'Database & Messaging',
    icon: <Database className="w-3 h-3" />,
    nodes: [
      { type: 'cosmos_db', category: 'azure', label: 'Cosmos DB', icon: 'Database', description: 'Azure Cosmos DB' },
      { type: 'service_bus', category: 'azure', label: 'Service Bus', icon: 'MessageSquare', description: 'Azure Service Bus' },
    ],
  },
  {
    name: 'Analytics & BI',
    icon: <Zap className="w-3 h-3" />,
    nodes: [
      { type: 'power_bi', category: 'azure', label: 'Power BI', icon: 'Database', description: 'Power BI refresh' },
    ],
  },
];

// Other - Multi-cloud / Cloud-agnostic tools
const otherCategories: NodeCategory[] = [
  {
    name: 'Multi-Cloud',
    icon: <Layers className="w-3 h-3" />,
    nodes: [
      { type: 'kubernetes_pod', category: 'other', label: 'K8s Pod', icon: 'Box', description: 'Kubernetes Pod' },
      { type: 'databricks', category: 'other', label: 'Databricks', icon: 'Zap', description: 'Databricks job' },
      { type: 'snowflake', category: 'other', label: 'Snowflake', icon: 'Database', description: 'Snowflake DW' },
      { type: 'delta_sensor', category: 'other', label: 'Delta Lake', icon: 'Database', description: 'Delta Lake table' },
      { type: 'trino', category: 'other', label: 'Trino/Presto', icon: 'Database', description: 'Trino SQL query' },
    ],
  },
  {
    name: 'File Transfer',
    icon: <Upload className="w-3 h-3" />,
    nodes: [
      { type: 'sftp', category: 'other', label: 'SFTP', icon: 'Upload', description: 'SFTP file transfer' },
      { type: 'ssh', category: 'other', label: 'SSH', icon: 'Terminal', description: 'SSH command execution' },
    ],
  },
  {
    name: 'Messaging',
    icon: <Radio className="w-3 h-3" />,
    nodes: [
      { type: 'kafka_produce', category: 'other', label: 'Kafka Produce', icon: 'Upload', description: 'Produce Kafka messages' },
      { type: 'kafka_consume', category: 'other', label: 'Kafka Consume', icon: 'Download', description: 'Consume Kafka messages' },
    ],
  },
];

// Data Quality - dbt, Great Expectations, Soda
const qualityCategories: NodeCategory[] = [
  {
    name: 'dbt',
    icon: <Code className="w-3 h-3" />,
    nodes: [
      { type: 'dbt_cloud', category: 'quality', label: 'dbt Cloud', icon: 'Cloud', description: 'Run dbt Cloud job' },
      { type: 'dbt_core', category: 'quality', label: 'dbt Core', icon: 'Code', description: 'Run dbt locally' },
    ],
  },
  {
    name: 'Testing',
    icon: <CheckCircle className="w-3 h-3" />,
    nodes: [
      { type: 'great_expectations', category: 'quality', label: 'Great Expectations', icon: 'CheckCircle', description: 'Data validation' },
      { type: 'soda_core', category: 'quality', label: 'Soda Core', icon: 'CheckCircle', description: 'Data observability' },
    ],
  },
];

// ELT Integration - Airbyte, Fivetran
const integrationCategories: NodeCategory[] = [
  {
    name: 'ELT Platforms',
    icon: <Link className="w-3 h-3" />,
    nodes: [
      { type: 'airbyte', category: 'integration', label: 'Airbyte', icon: 'Link', description: 'Airbyte sync' },
      { type: 'fivetran', category: 'integration', label: 'Fivetran', icon: 'Link', description: 'Fivetran connector sync' },
    ],
  },
];

// ============================================
// Icon Mapping
// ============================================

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  Code,
  Terminal,
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
  FileText,
  Server,
  Box,
  Layers,
  CheckCircle,
  Link,
  AlertTriangle,
  Upload,
  Download,
  Radio,
};

const getIcon = (iconName: string, className: string = 'w-4 h-4') => {
  const Icon = iconMap[iconName] || Circle;
  return <Icon className={className} />;
};

// Category colors - simplified
const categoryColors: Record<DagNodeCategory, string> = {
  etl: 'text-blue-400',
  action: 'text-green-400',
  sensor: 'text-yellow-400',
  control: 'text-purple-400',
  notify: 'text-pink-400',
  aws: 'text-orange-400',
  gcp: 'text-sky-400',
  azure: 'text-cyan-400',
  other: 'text-indigo-400',
  quality: 'text-emerald-400',
  integration: 'text-violet-400',
};

// ============================================
// Components
// ============================================

interface NodeItemProps {
  item: DraggableDagNodeItem;
  pageId?: string;
  pageName?: string;
  nodeCount?: number;
}

const NodeItem = ({ item, pageId, pageName, nodeCount }: NodeItemProps) => {
  const colorClass = categoryColors[item.category];

  const onDragStart = (e: React.DragEvent) => {
    const dragData = {
      type: item.type,
      category: item.category,
      label: pageName || item.label,
      pageId,
      pageName,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="node-item"
      draggable
      onDragStart={onDragStart}
    >
      {getIcon(item.icon, `w-4 h-4 ${colorClass}`)}
      <div className="flex-1 min-w-0">
        <span className="truncate block">{pageName || item.label}</span>
        {(item.description || nodeCount !== undefined) && (
          <span className="text-xs text-gray-500 truncate block">
            {nodeCount !== undefined ? `${nodeCount} nodes` : item.description}
          </span>
        )}
      </div>
    </div>
  );
};

interface CollapsibleCategoryProps {
  category: NodeCategory;
  defaultOpen?: boolean;
  searchTerm?: string;
  colorClass?: string;
}

const CollapsibleCategory = ({ category, defaultOpen = false, searchTerm = '', colorClass }: CollapsibleCategoryProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Filter nodes based on search term
  const filteredNodes = searchTerm
    ? category.nodes.filter(node =>
        node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : category.nodes;

  // Don't render category if no nodes match search
  if (filteredNodes.length === 0) return null;

  // Auto-expand if search matches
  const shouldBeOpen = searchTerm ? true : isOpen;

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400 hover:text-gray-200 hover:bg-panel-light rounded transition-colors"
      >
        {shouldBeOpen ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
        <span className={colorClass}>{category.icon}</span>
        <span className="flex-1 text-left">{category.name}</span>
        <span className="text-gray-600 text-[10px]">{filteredNodes.length}</span>
      </button>
      {shouldBeOpen && (
        <div className="ml-3 mt-0.5 space-y-0.5">
          {filteredNodes.map((node) => (
            <NodeItem key={node.type} item={node} />
          ))}
        </div>
      )}
    </div>
  );
};

interface MainSectionProps {
  title: string;
  icon: React.ReactNode;
  categories: NodeCategory[];
  searchTerm: string;
  defaultOpenFirst?: boolean;
  colorClass?: string;
}

const MainSection = ({ title, icon, categories, searchTerm, defaultOpenFirst = true, colorClass }: MainSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Check if any nodes match the search
  const hasMatchingNodes = searchTerm
    ? categories.some(cat =>
        cat.nodes.some(node =>
          node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : true;

  if (!hasMatchingNodes) return null;

  return (
    <div className="panel-section">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="panel-title flex items-center gap-2 w-full hover:text-gray-200 transition-colors"
      >
        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        <span className={colorClass}>{icon}</span>
        <span className="flex-1 text-left">{title}</span>
      </button>
      {isExpanded && (
        <div className="mt-1">
          {categories.map((category, idx) => (
            <CollapsibleCategory
              key={category.name}
              category={category}
              defaultOpen={defaultOpenFirst && idx === 0 && !searchTerm}
              searchTerm={searchTerm}
              colorClass={colorClass}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// ETL Pages Section Component
// ============================================

interface EtlPagesSectionProps {
  searchTerm: string;
}

const EtlPagesSection = ({ searchTerm }: EtlPagesSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Get ETL workflow pages from workspace
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  const etlPages = activeWorkspace?.pages.filter(isWorkflowPage) || [];

  // Filter pages based on search
  const filteredPages = searchTerm
    ? etlPages.filter(page => page.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : etlPages;

  if (searchTerm && filteredPages.length === 0) return null;

  return (
    <div className="panel-section">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="panel-title flex items-center gap-2 w-full hover:text-gray-200 transition-colors"
      >
        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        <FileText className="w-3 h-3 text-blue-400" />
        <span className="flex-1 text-left">ETL Pages</span>
        <span className="text-gray-600 text-[10px]">{filteredPages.length}</span>
      </button>
      {isExpanded && (
        <div className="mt-1 ml-3 space-y-0.5">
          {filteredPages.length > 0 ? (
            filteredPages.map((page) => (
              <NodeItem
                key={page.id}
                item={{
                  type: 'etl_task',
                  category: 'etl',
                  label: page.name,
                  icon: 'Workflow',
                  description: '',
                }}
                pageId={page.id}
                pageName={page.name}
                nodeCount={page.nodes?.length || 0}
              />
            ))
          ) : (
            <p className="text-xs text-gray-500 px-2 py-2 italic">
              No ETL pages yet. Create one to reference here.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// Main Sidebar Component
// ============================================

export const DagSidebar = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="w-60 bg-panel border-r border-gray-700 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-orange-400" />
          Airflow DAG
        </h1>
        <p className="text-xs text-gray-400 mt-1">Drag tasks to canvas</p>
      </div>

      {/* Search */}
      <div className="px-3 py-3 border-b border-gray-700">
        <div className="relative">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-9 py-2.5 bg-canvas border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:border-accent focus:outline-none"
          />
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* ETL Pages */}
        <EtlPagesSection searchTerm={searchTerm} />

        {/* Actions */}
        <MainSection
          title="Actions"
          icon={<Zap className="w-3 h-3" />}
          categories={actionCategories}
          searchTerm={searchTerm}
          defaultOpenFirst={true}
          colorClass="text-green-400"
        />

        {/* Sensors */}
        <MainSection
          title="Sensors"
          icon={<Clock className="w-3 h-3" />}
          categories={sensorCategories}
          searchTerm={searchTerm}
          defaultOpenFirst={true}
          colorClass="text-yellow-400"
        />

        {/* Control */}
        <MainSection
          title="Control Flow"
          icon={<GitBranch className="w-3 h-3" />}
          categories={controlCategories}
          searchTerm={searchTerm}
          defaultOpenFirst={true}
          colorClass="text-purple-400"
        />

        {/* Notifications */}
        <MainSection
          title="Notifications"
          icon={<Mail className="w-3 h-3" />}
          categories={notifyCategories}
          searchTerm={searchTerm}
          defaultOpenFirst={true}
          colorClass="text-pink-400"
        />

        {/* Data Quality */}
        <MainSection
          title="Data Quality"
          icon={<CheckCircle className="w-3 h-3" />}
          categories={qualityCategories}
          searchTerm={searchTerm}
          defaultOpenFirst={false}
          colorClass="text-emerald-400"
        />

        {/* ELT Integration */}
        <MainSection
          title="ELT Integration"
          icon={<Link className="w-3 h-3" />}
          categories={integrationCategories}
          searchTerm={searchTerm}
          defaultOpenFirst={false}
          colorClass="text-violet-400"
        />

        {/* AWS */}
        <MainSection
          title="AWS"
          icon={<Cloud className="w-3 h-3" />}
          categories={awsCategories}
          searchTerm={searchTerm}
          defaultOpenFirst={false}
          colorClass="text-orange-400"
        />

        {/* GCP */}
        <MainSection
          title="GCP"
          icon={<Cloud className="w-3 h-3" />}
          categories={gcpCategories}
          searchTerm={searchTerm}
          defaultOpenFirst={false}
          colorClass="text-sky-400"
        />

        {/* Azure */}
        <MainSection
          title="Azure"
          icon={<Cloud className="w-3 h-3" />}
          categories={azureCategories}
          searchTerm={searchTerm}
          defaultOpenFirst={false}
          colorClass="text-cyan-400"
        />

        {/* Other / Multi-cloud */}
        <MainSection
          title="Other"
          icon={<Layers className="w-3 h-3" />}
          categories={otherCategories}
          searchTerm={searchTerm}
          defaultOpenFirst={false}
          colorClass="text-indigo-400"
        />
      </div>
    </div>
  );
};
