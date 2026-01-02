import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import {
  Database,
  FileJson,
  FileSpreadsheet,
  Server,
  Radio,
  Cloud,
  Triangle,
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
  HardDrive,
  Slice,
  Settings,
  AlertCircle,
  CheckCircle,
  X,
  Percent,
  Eraser,
  PaintBucket,
  CircleDot,
  MinusCircle,
  Split,
  RotateCcw,
  Grid3x3,
  RefreshCw,
  // Preprocessing icons
  ScanSearch,
  CircleOff,
  Copy,
  WrapText,
  AlertTriangle,
  CheckCircle2,
  FileType,
  FileDigit,
  Ungroup,
  Box,
  BarChart3,
  TableProperties,
  ListChecks,
  FileBarChart,
  // Feature Engineering icons
  Scale,
  Binary,
  Calendar,
  TextCursor,
  Scissors,
  // Optimization icons
  GitBranch,
  Trash2,
  FileSearch,
  Podcast,
  Shuffle,
  Zap,
  // Action icons
  Eye,
  List,
  Info,
} from 'lucide-react';
import type { ETLNodeData } from '../../types';
import { useWorkflowStore } from '../../stores/workflowStore';

const getIcon = (data: ETLNodeData) => {
  const className = 'w-4 h-4';

  if (data.category === 'source') {
    const icons: Record<string, React.ReactNode> = {
      csv: <FileSpreadsheet className={className} />,
      parquet: <HardDrive className={className} />,
      json: <FileJson className={className} />,
      jdbc: <Database className={className} />,
      kafka: <Radio className={className} />,
      s3: <Cloud className={className} />,
      delta: <Triangle className={className} />,
    };
    return icons[data.sourceType] || <Database className={className} />;
  }

  if (data.category === 'transform') {
    const icons: Record<string, React.ReactNode> = {
      select: <Columns className={className} />,
      filter: <Filter className={className} />,
      join: <GitMerge className={className} />,
      groupBy: <Layers className={className} />,
      sort: <ArrowUpDown className={className} />,
      union: <Combine className={className} />,
      window: <Server className={className} />,
      addColumn: <Plus className={className} />,
      dropColumn: <Minus className={className} />,
      rename: <Type className={className} />,
      distinct: <Hash className={className} />,
      limit: <Slice className={className} />,
      sample: <Percent className={className} />,
      dropna: <Eraser className={className} />,
      fillna: <PaintBucket className={className} />,
      intersect: <CircleDot className={className} />,
      subtract: <MinusCircle className={className} />,
      explode: <Split className={className} />,
      unpivot: <RotateCcw className={className} />,
      repartition: <Grid3x3 className={className} />,
      cache: <HardDrive className={className} />,
      replace: <RefreshCw className={className} />,
      intersectAll: <CircleDot className={className} />,
      exceptAll: <MinusCircle className={className} />,
      // Advanced transforms
      flatten: <Ungroup className={className} />,
      cube: <Box className={className} />,
      rollup: <BarChart3 className={className} />,
      crosstab: <TableProperties className={className} />,
      freqItems: <ListChecks className={className} />,
      describe: <FileBarChart className={className} />,
      // Preprocessing transforms
      profiler: <ScanSearch className={className} />,
      missingValue: <CircleOff className={className} />,
      duplicateHandler: <Copy className={className} />,
      typeFixer: <FileType className={className} />,
      stringCleaner: <WrapText className={className} />,
      outlierHandler: <AlertTriangle className={className} />,
      dataValidator: <CheckCircle2 className={className} />,
      formatStandardizer: <FileDigit className={className} />,
      // Feature Engineering transforms
      scaler: <Scale className={className} />,
      encoder: <Binary className={className} />,
      dateFeatures: <Calendar className={className} />,
      textFeatures: <TextCursor className={className} />,
      trainTestSplit: <Scissors className={className} />,
      // Optimization transforms
      checkpoint: <GitBranch className={className} />,
      unpersist: <Trash2 className={className} />,
      explain: <FileSearch className={className} />,
      broadcast: <Podcast className={className} />,
      salt: <Shuffle className={className} />,
      aqe: <Zap className={className} />,
    };
    return icons[data.transformType] || <Settings className={className} />;
  }

  if (data.category === 'sink') {
    const icons: Record<string, React.ReactNode> = {
      csv: <FileSpreadsheet className={className} />,
      parquet: <HardDrive className={className} />,
      json: <FileJson className={className} />,
      jdbc: <Database className={className} />,
      kafka: <Radio className={className} />,
      delta: <Triangle className={className} />,
    };
    return icons[data.sinkType] || <Database className={className} />;
  }

  if (data.category === 'action') {
    const icons: Record<string, React.ReactNode> = {
      show: <Eye className={className} />,
      printSchema: <FileSearch className={className} />,
      count: <Hash className={className} />,
      take: <List className={className} />,
      first: <List className={className} />,
      head: <List className={className} />,
      columns: <Columns className={className} />,
      dtypes: <Info className={className} />,
      isEmpty: <CircleOff className={className} />,
    };
    return icons[data.actionType] || <Eye className={className} />;
  }

  return <Database className={className} />;
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'source':
      return 'border-green-500 bg-green-500/10';
    case 'transform':
      return 'border-blue-500 bg-blue-500/10';
    case 'sink':
      return 'border-orange-500 bg-orange-500/10';
    case 'action':
      return 'border-purple-500 bg-purple-500/10';
    default:
      return 'border-gray-500 bg-gray-500/10';
  }
};

const getCategoryBadgeColor = (category: string) => {
  switch (category) {
    case 'source':
      return 'bg-green-500/20 text-green-400';
    case 'transform':
      return 'bg-blue-500/20 text-blue-400';
    case 'sink':
      return 'bg-orange-500/20 text-orange-400';
    case 'action':
      return 'bg-purple-500/20 text-purple-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};

interface ETLNodeProps extends NodeProps {
  data: ETLNodeData;
}

export const ETLNode = memo(({ id, data, selected }: ETLNodeProps) => {
  const deleteNode = useWorkflowStore((state) => state.deleteNode);

  // Input handle: all except sources
  const showSourceHandle = data.category !== 'source';
  // Output handle: sources and transforms only (not sinks or actions)
  const showTargetHandle = data.category !== 'sink' && data.category !== 'action';

  // Nodes that need 2 input handles (Join, Union, Intersect, Subtract, IntersectAll, ExceptAll)
  const isJoinNode = data.category === 'transform' && data.transformType === 'join';
  const isUnionNode = data.category === 'transform' && data.transformType === 'union';
  const isIntersectNode = data.category === 'transform' && data.transformType === 'intersect';
  const isSubtractNode = data.category === 'transform' && data.transformType === 'subtract';
  const isIntersectAllNode = data.category === 'transform' && data.transformType === 'intersectAll';
  const isExceptAllNode = data.category === 'transform' && data.transformType === 'exceptAll';
  const needsDualInput = isJoinNode || isUnionNode || isIntersectNode || isSubtractNode || isIntersectAllNode || isExceptAllNode;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(id);
  };

  return (
    <div
      className={`
        min-w-[160px] rounded-lg border-2 shadow-lg group relative
        ${getCategoryColor(data.category)}
        ${selected ? 'ring-2 ring-accent ring-offset-2 ring-offset-canvas' : ''}
        transition-all duration-150
      `}
    >
      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600
                   rounded-full flex items-center justify-center
                   opacity-0 group-hover:opacity-100 transition-opacity
                   shadow-lg z-10"
        title="Remove node"
      >
        <X className="w-3 h-3 text-white" />
      </button>

      {/* Input Handles */}
      {showSourceHandle && !needsDualInput && (
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-accent !border-white !w-3 !h-3"
        />
      )}

      {/* Multiple input handles for Join/Union/Intersect/Subtract */}
      {needsDualInput && (
        <>
          <Handle
            type="target"
            position={Position.Left}
            id="input-1"
            className="!bg-accent !border-white !w-3 !h-3"
            style={{ top: '30%' }}
          />
          <Handle
            type="target"
            position={Position.Left}
            id="input-2"
            className="!bg-accent !border-white !w-3 !h-3"
            style={{ top: '70%' }}
          />
        </>
      )}

      {/* Output Handle */}
      {showTargetHandle && (
        <Handle
          type="source"
          position={Position.Right}
          className="!bg-accent !border-white !w-3 !h-3"
        />
      )}

      {/* Node Content */}
      <div className="p-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1.5 rounded ${getCategoryBadgeColor(data.category)}`}>
            {getIcon(data)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {data.label}
            </div>
            <div className="text-xs text-gray-400 capitalize">
              {data.category}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-1 text-xs">
          {data.configured ? (
            <>
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="text-green-400">Configured</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-400">Not configured</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

ETLNode.displayName = 'ETLNode';
