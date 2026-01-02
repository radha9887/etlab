import {
  Filter,
  GitMerge,
  Layers,
  ArrowUpDown,
  Combine,
  Columns,
  Plus,
  Minus,
  Type,
  Hash,
  Slice,
  Server,
  HardDrive,
  FileSpreadsheet,
  FileJson,
  Database,
  Triangle,
  Radio,
  Settings,
  X,
  Copy,
  Trash2,
  Link,
  // Preprocessing icons
  ScanSearch,
  CircleOff,
  FileType,
  WrapText,
  FileDigit,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import type { Node, Edge } from '@xyflow/react';
import type { TransformType, SinkType, ETLNodeData } from '../../types';

interface MenuItem {
  id: string;
  type?: TransformType | SinkType | string;
  label: string;
  icon: React.ReactNode;
  category?: 'transform' | 'sink' | 'action';
  description: string;
  action?: string;
}

// Common actions for all nodes
const commonActions: MenuItem[] = [
  { id: 'configure', label: 'Configure', icon: <Settings className="w-4 h-4" />, category: 'action', description: 'Edit node settings', action: 'configure' },
  { id: 'duplicate', label: 'Duplicate', icon: <Copy className="w-4 h-4" />, category: 'action', description: 'Clone this node', action: 'duplicate' },
  { id: 'delete', label: 'Delete', icon: <Trash2 className="w-4 h-4" />, category: 'action', description: 'Remove this node', action: 'delete' },
];

// Transform options (what you can add after a node)
const transformItems: MenuItem[] = [
  { id: 'select', type: 'select', label: 'Select Columns', icon: <Columns className="w-4 h-4" />, category: 'transform', description: 'Choose specific columns' },
  { id: 'filter', type: 'filter', label: 'Filter Rows', icon: <Filter className="w-4 h-4" />, category: 'transform', description: 'Filter data by condition' },
  { id: 'join', type: 'join', label: 'Join Table', icon: <GitMerge className="w-4 h-4" />, category: 'transform', description: 'Join with another table' },
  { id: 'groupBy', type: 'groupBy', label: 'Group & Aggregate', icon: <Layers className="w-4 h-4" />, category: 'transform', description: 'Group and aggregate data' },
  { id: 'sort', type: 'sort', label: 'Sort', icon: <ArrowUpDown className="w-4 h-4" />, category: 'transform', description: 'Order rows' },
  { id: 'union', type: 'union', label: 'Union', icon: <Combine className="w-4 h-4" />, category: 'transform', description: 'Combine with another table' },
  { id: 'addColumn', type: 'addColumn', label: 'Add Column', icon: <Plus className="w-4 h-4" />, category: 'transform', description: 'Create derived column' },
  { id: 'dropColumn', type: 'dropColumn', label: 'Drop Columns', icon: <Minus className="w-4 h-4" />, category: 'transform', description: 'Remove columns' },
  { id: 'rename', type: 'rename', label: 'Rename Column', icon: <Type className="w-4 h-4" />, category: 'transform', description: 'Rename a column' },
  { id: 'distinct', type: 'distinct', label: 'Distinct', icon: <Hash className="w-4 h-4" />, category: 'transform', description: 'Remove duplicates' },
  { id: 'limit', type: 'limit', label: 'Limit Rows', icon: <Slice className="w-4 h-4" />, category: 'transform', description: 'Limit number of rows' },
  { id: 'window', type: 'window', label: 'Window Function', icon: <Server className="w-4 h-4" />, category: 'transform', description: 'Apply window function' },
];

// Preprocessing transforms
const preprocessingItems: MenuItem[] = [
  { id: 'profiler', type: 'profiler', label: 'Data Profiler', icon: <ScanSearch className="w-4 h-4" />, category: 'transform', description: 'Profile data quality' },
  { id: 'missingValue', type: 'missingValue', label: 'Handle Missing', icon: <CircleOff className="w-4 h-4" />, category: 'transform', description: 'Handle null values' },
  { id: 'duplicateHandler', type: 'duplicateHandler', label: 'Handle Duplicates', icon: <Copy className="w-4 h-4" />, category: 'transform', description: 'Remove duplicates' },
  { id: 'typeFixer', type: 'typeFixer', label: 'Fix Types', icon: <FileType className="w-4 h-4" />, category: 'transform', description: 'Convert data types' },
  { id: 'stringCleaner', type: 'stringCleaner', label: 'Clean Strings', icon: <WrapText className="w-4 h-4" />, category: 'transform', description: 'Clean text data' },
  { id: 'formatStandardizer', type: 'formatStandardizer', label: 'Standardize Format', icon: <FileDigit className="w-4 h-4" />, category: 'transform', description: 'Standardize formats' },
  { id: 'outlierHandler', type: 'outlierHandler', label: 'Handle Outliers', icon: <AlertTriangle className="w-4 h-4" />, category: 'transform', description: 'Detect/fix outliers' },
  { id: 'dataValidator', type: 'dataValidator', label: 'Validate Data', icon: <CheckCircle2 className="w-4 h-4" />, category: 'transform', description: 'Validate data rules' },
];

// Feature Engineering transforms - Hidden for now
// const featureEngineeringItems: MenuItem[] = [
//   { id: 'scaler', type: 'scaler', label: 'Scale Features', icon: <Scale className="w-4 h-4" />, category: 'transform', description: 'Normalize/scale values' },
//   { id: 'encoder', type: 'encoder', label: 'Encode Categories', icon: <Binary className="w-4 h-4" />, category: 'transform', description: 'Encode categorical data' },
//   { id: 'dateFeatures', type: 'dateFeatures', label: 'Date Features', icon: <Calendar className="w-4 h-4" />, category: 'transform', description: 'Extract date features' },
//   { id: 'textFeatures', type: 'textFeatures', label: 'Text Features', icon: <TextCursor className="w-4 h-4" />, category: 'transform', description: 'Extract text features' },
//   { id: 'trainTestSplit', type: 'trainTestSplit', label: 'Train/Test Split', icon: <Scissors className="w-4 h-4" />, category: 'transform', description: 'Split for ML' },
// ];

// Sink options
const sinkItems: MenuItem[] = [
  { id: 'writeParquet', type: 'parquet', label: 'Write Parquet', icon: <HardDrive className="w-4 h-4" />, category: 'sink', description: 'Save as Parquet file' },
  { id: 'writeCsv', type: 'csv', label: 'Write CSV', icon: <FileSpreadsheet className="w-4 h-4" />, category: 'sink', description: 'Save as CSV file' },
  { id: 'writeJson', type: 'json', label: 'Write JSON', icon: <FileJson className="w-4 h-4" />, category: 'sink', description: 'Save as JSON file' },
  { id: 'writeJdbc', type: 'jdbc', label: 'Write to Database', icon: <Database className="w-4 h-4" />, category: 'sink', description: 'Save to database' },
  { id: 'writeDelta', type: 'delta', label: 'Write Delta', icon: <Triangle className="w-4 h-4" />, category: 'sink', description: 'Save as Delta table' },
  { id: 'writeKafka', type: 'kafka', label: 'Write to Kafka', icon: <Radio className="w-4 h-4" />, category: 'sink', description: 'Send to Kafka topic' },
];


interface NodeContextMenuProps {
  position: { x: number; y: number };
  nodeId: string;
  nodeCategory: 'source' | 'transform' | 'sink' | 'action';
  nodeData: ETLNodeData;
  allNodes: Node<ETLNodeData>[];
  allEdges: Edge[];
  onSelect: (item: MenuItem, nodeId: string) => void;
  onAction: (action: string, nodeId: string) => void;
  onConnectInput: (sourceNodeId: string, targetNodeId: string, handleId?: string) => void;
  onConnectSecondInput: (sourceNodeId: string, targetNodeId: string) => void;
  onClose: () => void;
  isReadOnly?: boolean;
}

export const NodeContextMenu = ({
  position,
  nodeId,
  nodeCategory,
  nodeData,
  allNodes,
  allEdges,
  onSelect,
  onAction,
  onConnectInput,
  onConnectSecondInput,
  onClose,
  isReadOnly = false
}: NodeContextMenuProps) => {
  // Check if this is a node that needs second input (Join, Union, Intersect, Subtract, IntersectAll, ExceptAll)
  const isJoinOrUnion = nodeCategory === 'transform' &&
    'transformType' in nodeData &&
    (nodeData.transformType === 'join' || nodeData.transformType === 'union' ||
     nodeData.transformType === 'intersect' || nodeData.transformType === 'subtract' ||
     nodeData.transformType === 'intersectAll' || nodeData.transformType === 'exceptAll');

  // Check if this node needs input (transforms and sinks need input)
  const needsInput = nodeCategory === 'transform' || nodeCategory === 'sink';

  // Get existing primary input connection
  const existingPrimaryInput = allEdges.find(
    edge => edge.target === nodeId && (!edge.targetHandle || edge.targetHandle === 'input-1')
  );

  // Get nodes that are already connected to this node's input-2
  const existingSecondInput = allEdges.find(
    edge => edge.target === nodeId && edge.targetHandle === 'input-2'
  );

  // Get available nodes that can be connected as input
  // (sources and transforms that aren't already connected)
  const availableNodesForInput = allNodes.filter(node => {
    // Exclude the current node
    if (node.id === nodeId) return false;
    // Exclude sink nodes
    if (node.data.category === 'sink') return false;
    // Include sources and transforms
    return true;
  });

  // Get available nodes that can be connected as second input
  // (sources and transforms that aren't already connected to input-2)
  const availableNodesForSecondInput = allNodes.filter(node => {
    // Exclude the current node
    if (node.id === nodeId) return false;
    // Exclude sink nodes
    if (node.data.category === 'sink') return false;
    // Include sources and transforms
    return true;
  });

  // Get node-specific options - just configure for all node types
  const getNodeSpecificOptions = (): MenuItem[] => {
    return [{ id: 'configure', label: 'Configure', icon: <Settings className="w-4 h-4" />, category: 'action', description: 'Edit settings', action: 'configure' }];
  };

  const nodeSpecificOptions = getNodeSpecificOptions();

  // Determine which sections to show (hide edit options for read-only viewers)
  const showAddTransform = !isReadOnly && nodeCategory !== 'sink';
  const showAddSink = !isReadOnly && nodeCategory !== 'sink';
  const showConnectInput = !isReadOnly && needsInput && availableNodesForInput.length > 0;
  const showConnectSecondInput = !isReadOnly && isJoinOrUnion && availableNodesForSecondInput.length > 0;

  const handleItemClick = (item: MenuItem) => {
    if (item.action) {
      onAction(item.action, nodeId);
    } else if (item.type && item.category) {
      onSelect(item, nodeId);
    }
    onClose();
  };

  return (
      <div
        className="fixed z-50 bg-panel border border-gray-600 rounded-lg shadow-xl overflow-hidden"
        style={{
          left: Math.min(position.x, window.innerWidth - 260),
          top: Math.min(position.y, window.innerHeight - 400),
          minWidth: '240px',
          maxHeight: '450px',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-panel-light border-b border-gray-600">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              nodeCategory === 'source' ? 'bg-green-500' :
              nodeCategory === 'transform' ? 'bg-blue-500' : 'bg-orange-500'
            }`} />
            <span className="text-sm font-medium text-white truncate max-w-[160px]">
              {nodeData.label}
            </span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-panel rounded">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="max-h-[380px] overflow-y-auto">
          {/* Node Actions */}
          <div className="p-2 border-b border-gray-700">
            <div className="space-y-0.5">
              {nodeSpecificOptions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md
                           hover:bg-accent/20 text-left transition-colors group"
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

          {/* Connect Input Section (for transforms and sinks, hidden for viewers) */}
          {showConnectInput && (
            <div className="p-2 border-b border-gray-700">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider px-2 py-1 font-semibold flex items-center gap-1">
                <Link className="w-3 h-3" />
                {existingPrimaryInput ? 'Change Input Source' : 'Connect Input'}
              </div>
              {existingPrimaryInput && (
                <div className="px-2 py-1 mb-1 text-[10px] text-green-400 flex items-center gap-1">
                  <span>Currently connected: </span>
                  <span className="font-medium">
                    {allNodes.find(n => n.id === existingPrimaryInput.source)?.data.label || 'Unknown'}
                  </span>
                </div>
              )}
              <div className="space-y-0.5 max-h-[150px] overflow-y-auto">
                {availableNodesForInput.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => {
                      onConnectInput(node.id, nodeId, isJoinOrUnion ? 'input-1' : undefined);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md
                             hover:bg-green-500/20 text-left transition-colors group
                             ${existingPrimaryInput?.source === node.id ? 'bg-green-500/10 border border-green-500/30' : ''}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      node.data.category === 'source' ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">{node.data.label}</div>
                      <div className="text-[10px] text-gray-500">
                        {node.data.category === 'source' ? 'Source Table' : 'Transform Output'}
                      </div>
                    </div>
                    {existingPrimaryInput?.source === node.id ? (
                      <span className="text-[10px] text-green-400">Connected</span>
                    ) : (
                      <Link className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Connect Second Input Section (for Join/Union nodes, hidden for viewers) */}
          {showConnectSecondInput && (
            <div className="p-2 border-b border-gray-700">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider px-2 py-1 font-semibold flex items-center gap-1">
                <Link className="w-3 h-3" />
                {existingSecondInput ? 'Change Second Input' : 'Connect Second Table'}
              </div>
              {existingSecondInput && (
                <div className="px-2 py-1 mb-1 text-[10px] text-yellow-400 flex items-center gap-1">
                  <span>Currently connected: </span>
                  <span className="font-medium">
                    {allNodes.find(n => n.id === existingSecondInput.source)?.data.label || 'Unknown'}
                  </span>
                </div>
              )}
              <div className="space-y-0.5 max-h-[120px] overflow-y-auto">
                {availableNodesForSecondInput.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => {
                      onConnectSecondInput(node.id, nodeId);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md
                             hover:bg-purple-500/20 text-left transition-colors group"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      node.data.category === 'source' ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">{node.data.label}</div>
                      <div className="text-[10px] text-gray-500">
                        {node.data.category === 'source' ? 'Source Table' : 'Transform Output'}
                      </div>
                    </div>
                    <Link className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add Transform Section */}
          {showAddTransform && (
            <div className="p-2 border-b border-gray-700">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider px-2 py-1 font-semibold flex items-center gap-1">
                <Plus className="w-3 h-3" />
                Add Transformation
              </div>
              <div className="grid grid-cols-2 gap-1">
                {transformItems.slice(0, 8).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded
                             hover:bg-blue-500/20 text-left transition-colors group"
                  >
                    <div className="text-blue-400">
                      {item.icon}
                    </div>
                    <span className="text-xs text-gray-300 truncate">{item.label}</span>
                  </button>
                ))}
              </div>
              {/* More transforms in second row */}
              <div className="grid grid-cols-2 gap-1 mt-1">
                {transformItems.slice(8).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded
                             hover:bg-blue-500/20 text-left transition-colors group"
                  >
                    <div className="text-blue-400">
                      {item.icon}
                    </div>
                    <span className="text-xs text-gray-300 truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preprocessing Section */}
          {showAddTransform && (
            <div className="p-2 border-b border-gray-700">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider px-2 py-1 font-semibold flex items-center gap-1">
                <ScanSearch className="w-3 h-3" />
                Preprocessing
              </div>
              <div className="grid grid-cols-2 gap-1">
                {preprocessingItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded
                             hover:bg-purple-500/20 text-left transition-colors group"
                  >
                    <div className="text-purple-400">
                      {item.icon}
                    </div>
                    <span className="text-xs text-gray-300 truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Feature Engineering Section - Hidden for now
          {showAddTransform && (
            <div className="p-2 border-b border-gray-700">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider px-2 py-1 font-semibold flex items-center gap-1">
                <Scale className="w-3 h-3" />
                Feature Engineering
              </div>
              <div className="grid grid-cols-2 gap-1">
                {featureEngineeringItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded
                             hover:bg-green-500/20 text-left transition-colors group"
                  >
                    <div className="text-green-400">
                      {item.icon}
                    </div>
                    <span className="text-xs text-gray-300 truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          */}

          {/* Add Sink Section */}
          {showAddSink && (
            <div className="p-2 border-b border-gray-700">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider px-2 py-1 font-semibold flex items-center gap-1">
                <HardDrive className="w-3 h-3" />
                Write Output
              </div>
              <div className="grid grid-cols-2 gap-1">
                {sinkItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded
                             hover:bg-orange-500/20 text-left transition-colors group"
                  >
                    <div className="text-orange-400">
                      {item.icon}
                    </div>
                    <span className="text-xs text-gray-300 truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Common Actions (hide delete/duplicate for viewers) */}
          {!isReadOnly && (
          <div className="p-2">
            <div className="flex items-center gap-1">
              {commonActions.filter(a => a.action !== 'configure').map((item) => (
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
          )}
        </div>
      </div>
  );
};
