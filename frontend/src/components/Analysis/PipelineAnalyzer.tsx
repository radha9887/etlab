import { useMemo } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  CheckCircle,
  GitMerge,
  Filter,
  Layers,
  HardDrive,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { useWorkflowStore } from '../../stores/workflowStore';
import type { Node, Edge } from '@xyflow/react';
import type { ETLNodeData, TransformNodeData } from '../../types';

interface AnalysisIssue {
  id: string;
  severity: 'error' | 'warning' | 'tip';
  title: string;
  description: string;
  location: string;
  nodeId?: string;
  suggestion: string;
  autoFixable: boolean;
  icon: React.ReactNode;
}

// Analysis rules
const analyzeWorkflow = (
  nodes: Node<ETLNodeData>[],
  edges: Edge[]
): AnalysisIssue[] => {
  const issues: AnalysisIssue[] = [];

  // Helper: Get input nodes for a node
  const getInputNodes = (nodeId: string): Node<ETLNodeData>[] => {
    const inputEdges = edges.filter(e => e.target === nodeId);
    return inputEdges
      .map(e => nodes.find(n => n.id === e.source))
      .filter((n): n is Node<ETLNodeData> => n !== undefined);
  };

  // Helper: Get output nodes for a node
  const getOutputNodes = (nodeId: string): Node<ETLNodeData>[] => {
    const outputEdges = edges.filter(e => e.source === nodeId);
    return outputEdges
      .map(e => nodes.find(n => n.id === e.target))
      .filter((n): n is Node<ETLNodeData> => n !== undefined);
  };

  // Helper: Count how many times a node's output is used
  const getUsageCount = (nodeId: string): number => {
    return edges.filter(e => e.source === nodeId).length;
  };

  // Rule 1: Join without broadcast hint
  nodes.forEach(node => {
    if (node.data.category === 'transform') {
      const transformData = node.data as TransformNodeData;
      if (transformData.transformType === 'join') {
        const config = transformData.config || {};
        if (!config.broadcast || config.broadcast === 'none') {
          issues.push({
            id: `join-no-broadcast-${node.id}`,
            severity: 'warning',
            title: 'Join without Broadcast Hint',
            description: 'This join will shuffle both tables. If one table is small (<10MB), consider broadcasting it.',
            location: node.data.label,
            nodeId: node.id,
            suggestion: 'Add broadcast hint for the smaller table to avoid shuffle.',
            autoFixable: true,
            icon: <GitMerge className="w-4 h-4" />,
          });
        }
      }
    }
  });

  // Rule 2: Filter after Join (could push down)
  nodes.forEach(node => {
    if (node.data.category === 'transform') {
      const transformData = node.data as TransformNodeData;
      if (transformData.transformType === 'filter') {
        const inputs = getInputNodes(node.id);
        inputs.forEach(inputNode => {
          if (inputNode.data.category === 'transform') {
            const inputTransform = inputNode.data as TransformNodeData;
            if (inputTransform.transformType === 'join') {
              issues.push({
                id: `filter-after-join-${node.id}`,
                severity: 'warning',
                title: 'Filter After Join',
                description: 'Filtering after join processes more data than necessary.',
                location: `${inputNode.data.label} → ${node.data.label}`,
                nodeId: node.id,
                suggestion: 'Move filter before join to reduce data shuffled.',
                autoFixable: false,
                icon: <Filter className="w-4 h-4" />,
              });
            }
          }
        });
      }
    }
  });

  // Rule 3: DataFrame used multiple times without cache
  nodes.forEach(node => {
    const usageCount = getUsageCount(node.id);
    if (usageCount > 1) {
      // Check if there's a cache node after this
      const outputs = getOutputNodes(node.id);
      const hasCacheOutput = outputs.some(out => {
        if (out.data.category === 'transform') {
          const transform = out.data as TransformNodeData;
          return transform.transformType === 'cache' || transform.transformType === 'checkpoint';
        }
        return false;
      });

      if (!hasCacheOutput && node.data.category !== 'source') {
        issues.push({
          id: `no-cache-reuse-${node.id}`,
          severity: 'tip',
          title: 'Cache Opportunity',
          description: `"${node.data.label}" is used ${usageCount} times. Without caching, it will be recomputed each time.`,
          location: node.data.label,
          nodeId: node.id,
          suggestion: 'Add a Cache node after this transform to avoid recomputation.',
          autoFixable: true,
          icon: <HardDrive className="w-4 h-4" />,
        });
      }
    }
  });

  // Rule 4: Multiple consecutive shuffles
  nodes.forEach(node => {
    if (node.data.category === 'transform') {
      const transformData = node.data as TransformNodeData;
      const shuffleOps = ['join', 'groupBy', 'repartition', 'sort'];

      if (shuffleOps.includes(transformData.transformType)) {
        const inputs = getInputNodes(node.id);
        inputs.forEach(inputNode => {
          if (inputNode.data.category === 'transform') {
            const inputTransform = inputNode.data as TransformNodeData;
            if (shuffleOps.includes(inputTransform.transformType)) {
              issues.push({
                id: `consecutive-shuffle-${node.id}`,
                severity: 'warning',
                title: 'Consecutive Shuffle Operations',
                description: `Two shuffle operations in sequence: ${inputTransform.transformType} → ${transformData.transformType}`,
                location: `${inputNode.data.label} → ${node.data.label}`,
                nodeId: node.id,
                suggestion: 'Consider combining operations or adding repartition strategically.',
                autoFixable: false,
                icon: <Layers className="w-4 h-4" />,
              });
            }
          }
        });
      }
    }
  });

  // Rule 5: Cross join warning
  nodes.forEach(node => {
    if (node.data.category === 'transform') {
      const transformData = node.data as TransformNodeData;
      if (transformData.transformType === 'join') {
        const config = transformData.config || {};
        if (config.joinType === 'cross') {
          issues.push({
            id: `cross-join-${node.id}`,
            severity: 'error',
            title: 'Cross Join Detected',
            description: 'Cross joins create a Cartesian product (O(n×m)) and can cause OOM errors.',
            location: node.data.label,
            nodeId: node.id,
            suggestion: 'Verify this is intentional. Add filters or use a different join type.',
            autoFixable: false,
            icon: <AlertCircle className="w-4 h-4" />,
          });
        }
      }
    }
  });

  // Rule 6: GroupBy without cache before multiple uses
  nodes.forEach(node => {
    if (node.data.category === 'transform') {
      const transformData = node.data as TransformNodeData;
      if (transformData.transformType === 'groupBy') {
        const usageCount = getUsageCount(node.id);
        if (usageCount > 1) {
          issues.push({
            id: `groupby-reuse-${node.id}`,
            severity: 'tip',
            title: 'Aggregation Reused',
            description: `GroupBy "${node.data.label}" is used ${usageCount} times. Aggregations are expensive to recompute.`,
            location: node.data.label,
            nodeId: node.id,
            suggestion: 'Cache the aggregation result to avoid recomputing.',
            autoFixable: true,
            icon: <Layers className="w-4 h-4" />,
          });
        }
      }
    }
  });

  // Rule 7: No sink connected
  const hasSink = nodes.some(n => n.data.category === 'sink');
  const sinkNodes = nodes.filter(n => n.data.category === 'sink');
  const connectedSinks = sinkNodes.filter(sink =>
    edges.some(e => e.target === sink.id)
  );

  if (nodes.length > 0 && !hasSink) {
    issues.push({
      id: 'no-sink',
      severity: 'tip',
      title: 'No Output Defined',
      description: 'Pipeline has no sink (output) node. Data will not be written anywhere.',
      location: 'Pipeline',
      suggestion: 'Add a sink node to write results to storage.',
      autoFixable: false,
      icon: <Lightbulb className="w-4 h-4" />,
    });
  } else if (sinkNodes.length > 0 && connectedSinks.length === 0) {
    issues.push({
      id: 'disconnected-sink',
      severity: 'warning',
      title: 'Disconnected Sink',
      description: 'Sink node exists but has no input connected.',
      location: sinkNodes[0]?.data.label || 'Sink',
      suggestion: 'Connect the sink to your pipeline.',
      autoFixable: false,
      icon: <AlertTriangle className="w-4 h-4" />,
    });
  }

  return issues;
};

interface PipelineAnalyzerProps {
  onSelectNode?: (nodeId: string) => void;
}

export const PipelineAnalyzer = ({ onSelectNode }: PipelineAnalyzerProps) => {
  const { nodes, edges } = useWorkflowStore();

  const issues = useMemo(() => {
    return analyzeWorkflow(nodes as Node<ETLNodeData>[], edges);
  }, [nodes, edges]);

  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const tipCount = issues.filter(i => i.severity === 'tip').length;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'tip': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'tip': return <Lightbulb className="w-4 h-4 text-blue-400" />;
      default: return null;
    }
  };

  if (nodes.length === 0) {
    return (
      <div className="p-4 text-center">
        <Zap className="w-8 h-8 text-gray-600 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Add nodes to analyze your pipeline</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-3 p-3 bg-panel rounded border border-gray-700">
        <Zap className="w-5 h-5 text-accent" />
        <div className="flex-1">
          <p className="text-sm text-white font-medium">Pipeline Analysis</p>
          <p className="text-xs text-gray-500">{nodes.length} nodes, {edges.length} connections</p>
        </div>
        <div className="flex items-center gap-2">
          {errorCount > 0 && (
            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
              {errorCount} errors
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
              {warningCount} warnings
            </span>
          )}
          {tipCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
              {tipCount} tips
            </span>
          )}
        </div>
      </div>

      {/* No Issues */}
      {issues.length === 0 && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded text-center">
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-sm text-green-400 font-medium">Pipeline looks good!</p>
          <p className="text-xs text-gray-500 mt-1">No optimization issues detected</p>
        </div>
      )}

      {/* Issues List */}
      {issues.length > 0 && (
        <div className="space-y-2">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className={`p-3 rounded border ${getSeverityColor(issue.severity)} cursor-pointer hover:opacity-90 transition-opacity`}
              onClick={() => issue.nodeId && onSelectNode?.(issue.nodeId)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getSeverityIcon(issue.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{issue.title}</span>
                    {issue.nodeId && (
                      <ChevronRight className="w-3 h-3 text-gray-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{issue.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-gray-500 bg-panel px-2 py-0.5 rounded">
                      {issue.location}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-2 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" />
                    {issue.suggestion}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analysis Rules Reference */}
      <div className="p-3 bg-canvas rounded border border-gray-700">
        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Analysis Rules</p>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="flex items-center gap-1 text-gray-500">
            <GitMerge className="w-3 h-3" /> Join optimization
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Filter className="w-3 h-3" /> Filter pushdown
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <HardDrive className="w-3 h-3" /> Cache detection
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Layers className="w-3 h-3" /> Shuffle analysis
          </div>
        </div>
      </div>
    </div>
  );
};
