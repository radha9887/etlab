import {
  Settings,
  X,
  Eye,
  Copy,
  Trash2,
  Link,
  Play,
  Clock,
  GitBranch,
  Mail,
  MessageSquare,
  Database,
  Cloud,
  Terminal,
  Code,
  FileCode,
  Workflow,
  Timer,
  Globe,
  ExternalLink,
  Server,
  Box,
  Layers,
} from 'lucide-react';
import type { Node, Edge } from '@xyflow/react';
import type { DagTaskNodeData, DagNodeType, DagNodeCategory } from '../../types';

interface MenuItem {
  id: string;
  type?: DagNodeType;
  label: string;
  icon: React.ReactNode;
  category?: DagNodeCategory | 'action';
  description: string;
  action?: string;
}

// Common actions for all nodes
const commonActions: MenuItem[] = [
  { id: 'configure', label: 'Configure', icon: <Settings className="w-4 h-4" />, category: 'action', description: 'Edit task settings', action: 'configure' },
  { id: 'preview', label: 'View Code', icon: <Eye className="w-4 h-4" />, category: 'action', description: 'Preview generated code', action: 'preview' },
  { id: 'duplicate', label: 'Duplicate', icon: <Copy className="w-4 h-4" />, category: 'action', description: 'Clone this task', action: 'duplicate' },
  { id: 'delete', label: 'Delete', icon: <Trash2 className="w-4 h-4" />, category: 'action', description: 'Remove this task', action: 'delete' },
];

// ETL Task options
const etlTaskItems: MenuItem[] = [
  { id: 'etl_task', type: 'etl_task', label: 'ETL Task', icon: <Workflow className="w-4 h-4" />, category: 'etl', description: 'Run ETL page' },
];

// Action/Operator items
const actionItems: MenuItem[] = [
  { id: 'spark_submit', type: 'spark_submit', label: 'Spark Submit', icon: <Play className="w-4 h-4" />, category: 'action', description: 'Submit Spark job' },
  { id: 'python', type: 'python', label: 'Python', icon: <Code className="w-4 h-4" />, category: 'action', description: 'Run Python code' },
  { id: 'bash', type: 'bash', label: 'Bash', icon: <Terminal className="w-4 h-4" />, category: 'action', description: 'Run shell command' },
  { id: 'sql_execute', type: 'sql_execute', label: 'SQL Execute', icon: <Database className="w-4 h-4" />, category: 'action', description: 'Execute SQL query' },
];

// Sensor items
const sensorItems: MenuItem[] = [
  { id: 'file_sensor', type: 'file_sensor', label: 'File Sensor', icon: <FileCode className="w-4 h-4" />, category: 'sensor', description: 'Wait for file' },
  { id: 's3_sensor', type: 's3_sensor', label: 'S3 Sensor', icon: <Cloud className="w-4 h-4" />, category: 'sensor', description: 'Wait for S3 object' },
  { id: 'sql_sensor', type: 'sql_sensor', label: 'SQL Sensor', icon: <Database className="w-4 h-4" />, category: 'sensor', description: 'Wait for SQL result' },
  { id: 'http_sensor', type: 'http_sensor', label: 'HTTP Sensor', icon: <Globe className="w-4 h-4" />, category: 'sensor', description: 'Wait for HTTP endpoint' },
  { id: 'external_sensor', type: 'external_sensor', label: 'External Task', icon: <ExternalLink className="w-4 h-4" />, category: 'sensor', description: 'Wait for external DAG' },
];

// Control flow items
const controlItems: MenuItem[] = [
  { id: 'branch', type: 'branch', label: 'Branch', icon: <GitBranch className="w-4 h-4" />, category: 'control', description: 'Conditional branching' },
  { id: 'trigger_dag', type: 'trigger_dag', label: 'Trigger DAG', icon: <Play className="w-4 h-4" />, category: 'control', description: 'Trigger another DAG' },
  { id: 'dummy', type: 'dummy', label: 'Dummy', icon: <Timer className="w-4 h-4" />, category: 'control', description: 'Empty placeholder' },
];

// Notification items
const notifyItems: MenuItem[] = [
  { id: 'email', type: 'email', label: 'Email', icon: <Mail className="w-4 h-4" />, category: 'notify', description: 'Send email notification' },
  { id: 'slack', type: 'slack', label: 'Slack', icon: <MessageSquare className="w-4 h-4" />, category: 'notify', description: 'Send Slack message' },
];

// Cloud compute items - mapped to cloud provider categories
const cloudComputeItems: MenuItem[] = [
  { id: 'kubernetes_pod', type: 'kubernetes_pod', label: 'Kubernetes Pod', icon: <Box className="w-4 h-4" />, category: 'other', description: 'Run K8s container' },
  { id: 'databricks', type: 'databricks', label: 'Databricks', icon: <Layers className="w-4 h-4" />, category: 'other', description: 'Run Databricks job' },
  { id: 'emr', type: 'emr', label: 'AWS EMR', icon: <Server className="w-4 h-4" />, category: 'aws', description: 'Run EMR step' },
  { id: 'dataproc', type: 'dataproc', label: 'GCP Dataproc', icon: <Server className="w-4 h-4" />, category: 'gcp', description: 'Run Dataproc job' },
];

// Get category color - simplified cloud provider grouping
const getCategoryColor = (category: DagNodeCategory | 'action'): string => {
  switch (category) {
    case 'etl': return 'bg-blue-500';
    case 'action': return 'bg-green-500';
    case 'sensor': return 'bg-amber-500';
    case 'control': return 'bg-purple-500';
    case 'notify': return 'bg-pink-500';
    case 'aws': return 'bg-orange-500';
    case 'gcp': return 'bg-sky-500';
    case 'azure': return 'bg-cyan-500';
    case 'other': return 'bg-indigo-500';
    default: return 'bg-gray-500';
  }
};

const getCategoryHoverBg = (category: DagNodeCategory | 'action'): string => {
  switch (category) {
    case 'etl': return 'hover:bg-blue-500/20';
    case 'action': return 'hover:bg-green-500/20';
    case 'sensor': return 'hover:bg-amber-500/20';
    case 'control': return 'hover:bg-purple-500/20';
    case 'notify': return 'hover:bg-pink-500/20';
    case 'aws': return 'hover:bg-orange-500/20';
    case 'gcp': return 'hover:bg-sky-500/20';
    case 'azure': return 'hover:bg-cyan-500/20';
    case 'other': return 'hover:bg-indigo-500/20';
    default: return 'hover:bg-gray-500/20';
  }
};

const getCategoryTextColor = (category: DagNodeCategory | 'action'): string => {
  switch (category) {
    case 'etl': return 'text-blue-400';
    case 'action': return 'text-green-400';
    case 'sensor': return 'text-amber-400';
    case 'control': return 'text-purple-400';
    case 'notify': return 'text-pink-400';
    case 'aws': return 'text-orange-400';
    case 'gcp': return 'text-sky-400';
    case 'azure': return 'text-cyan-400';
    case 'other': return 'text-indigo-400';
    default: return 'text-gray-400';
  }
};

interface DagNodeContextMenuProps {
  position: { x: number; y: number };
  nodeId: string;
  nodeData: DagTaskNodeData;
  allNodes: Node<DagTaskNodeData>[];
  allEdges: Edge[];
  onSelect: (item: MenuItem, nodeId: string) => void;
  onAction: (action: string, nodeId: string) => void;
  onConnectInput: (sourceNodeId: string, targetNodeId: string) => void;
  onClose: () => void;
}

export const DagNodeContextMenu = ({
  position,
  nodeId,
  nodeData,
  allNodes,
  allEdges,
  onSelect,
  onAction,
  onConnectInput,
  onClose
}: DagNodeContextMenuProps) => {

  // Get existing input connection
  const existingInput = allEdges.find(
    edge => edge.target === nodeId
  );

  // Get available nodes that can be connected as input (all nodes except current and its descendants)
  const availableNodesForInput = allNodes.filter(node => {
    if (node.id === nodeId) return false;
    // Check if connecting would create a cycle (simple check - just exclude nodes that are downstream)
    const isDownstream = allEdges.some(edge => edge.source === nodeId && edge.target === node.id);
    return !isDownstream;
  });

  const handleItemClick = (item: MenuItem) => {
    if (item.action) {
      onAction(item.action, nodeId);
    } else if (item.type && item.category) {
      onSelect(item, nodeId);
    }
    onClose();
  };

  const renderMenuSection = (title: string, items: MenuItem[], icon: React.ReactNode) => (
    <div className="p-2 border-b border-gray-700">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider px-2 py-1 font-semibold flex items-center gap-1">
        {icon}
        {title}
      </div>
      <div className="grid grid-cols-2 gap-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={`flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors group ${getCategoryHoverBg(item.category || 'action')}`}
          >
            <div className={getCategoryTextColor(item.category || 'action')}>
              {item.icon}
            </div>
            <span className="text-xs text-gray-300 truncate">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Menu */}
      <div
        className="fixed z-50 bg-panel border border-gray-600 rounded-lg shadow-xl overflow-hidden"
        style={{
          left: Math.min(position.x, window.innerWidth - 280),
          top: Math.min(position.y, window.innerHeight - 500),
          minWidth: '260px',
          maxHeight: '500px',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-panel-light border-b border-gray-600">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${getCategoryColor(nodeData.category)}`} />
            <span className="text-sm font-medium text-white truncate max-w-[180px]">
              {nodeData.label}
            </span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-panel rounded">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="max-h-[450px] overflow-y-auto">
          {/* Task Options */}
          <div className="p-2 border-b border-gray-700">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider px-2 py-1 font-semibold">
              Task Options
            </div>
            <div className="space-y-0.5">
              {commonActions.slice(0, 2).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/20 text-left transition-colors group"
                >
                  <div className="text-gray-400 group-hover:text-accent">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white">{item.label}</div>
                    <div className="text-[10px] text-gray-500">{item.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Connect Input Section */}
          {availableNodesForInput.length > 0 && (
            <div className="p-2 border-b border-gray-700">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider px-2 py-1 font-semibold flex items-center gap-1">
                <Link className="w-3 h-3" />
                {existingInput ? 'Change Upstream Task' : 'Connect Upstream Task'}
              </div>
              {existingInput && (
                <div className="px-2 py-1 mb-1 text-[10px] text-green-400 flex items-center gap-1">
                  <span>Currently connected: </span>
                  <span className="font-medium">
                    {allNodes.find(n => n.id === existingInput.source)?.data.label || 'Unknown'}
                  </span>
                </div>
              )}
              <div className="space-y-0.5 max-h-[150px] overflow-y-auto">
                {availableNodesForInput.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => {
                      onConnectInput(node.id, nodeId);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md
                             hover:bg-green-500/20 text-left transition-colors group
                             ${existingInput?.source === node.id ? 'bg-green-500/10 border border-green-500/30' : ''}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${getCategoryColor(node.data.category)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">{node.data.label}</div>
                      <div className="text-[10px] text-gray-500 capitalize">
                        {node.data.category.replace('_', ' ')}
                      </div>
                    </div>
                    {existingInput?.source === node.id ? (
                      <span className="text-[10px] text-green-400">Connected</span>
                    ) : (
                      <Link className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add ETL Task */}
          {renderMenuSection('ETL Tasks', etlTaskItems, <Workflow className="w-3 h-3" />)}

          {/* Add Operators */}
          {renderMenuSection('Operators', actionItems, <Play className="w-3 h-3" />)}

          {/* Add Sensors */}
          {renderMenuSection('Sensors', sensorItems, <Clock className="w-3 h-3" />)}

          {/* Add Control Flow */}
          {renderMenuSection('Control Flow', controlItems, <GitBranch className="w-3 h-3" />)}

          {/* Add Notifications */}
          {renderMenuSection('Notifications', notifyItems, <Mail className="w-3 h-3" />)}

          {/* Add Cloud Compute */}
          {renderMenuSection('Cloud Compute', cloudComputeItems, <Cloud className="w-3 h-3" />)}

          {/* Common Actions */}
          <div className="p-2">
            <div className="flex items-center gap-1">
              {commonActions.slice(2).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded
                           hover:bg-gray-700 text-left transition-colors
                           ${item.action === 'delete' ? 'hover:bg-red-500/20' : ''}`}
                  title={item.description}
                >
                  <div className={`${item.action === 'delete' ? 'text-red-400' : 'text-gray-400'}`}>
                    {item.icon}
                  </div>
                  <span className="text-[10px] text-gray-400">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
