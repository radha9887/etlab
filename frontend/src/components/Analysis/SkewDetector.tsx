import { useMemo } from 'react';
import {
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Info,
  Shuffle,
  GitMerge,
  Layers,
} from 'lucide-react';
import { useWorkflowStore } from '../../stores/workflowStore';
import type { Node, Edge } from '@xyflow/react';
import type { ETLNodeData, TransformNodeData } from '../../types';

interface SkewRisk {
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  riskLevel: 'high' | 'medium' | 'low';
  reason: string;
  keyColumns: string[];
  suggestion: string;
}

// Analyze workflow for potential skew issues
const detectSkewRisks = (
  nodes: Node<ETLNodeData>[],
  edges: Edge[]
): SkewRisk[] => {
  const risks: SkewRisk[] = [];

  // Helper to check if node is followed by salt
  const hasSaltAfter = (nodeId: string): boolean => {
    const outputEdges = edges.filter(e => e.source === nodeId);
    return outputEdges.some(e => {
      const targetNode = nodes.find(n => n.id === e.target);
      if (targetNode?.data.category === 'transform') {
        const transform = targetNode.data as TransformNodeData;
        return transform.transformType === 'salt';
      }
      return false;
    });
  };

  nodes.forEach(node => {
    if (node.data.category !== 'transform') return;

    const transformData = node.data as TransformNodeData;
    const config = transformData.config || {};

    // Check joins for skew risk
    if (transformData.transformType === 'join') {
      const leftKey = config.leftKey as string || '';
      const rightKey = config.rightKey as string || '';
      const joinType = config.joinType as string || 'inner';

      // Common skew-prone patterns
      const skewProneKeys = ['user_id', 'customer_id', 'product_id', 'category', 'country', 'null'];
      const hasSkewProneKey = skewProneKeys.some(k =>
        leftKey.toLowerCase().includes(k) || rightKey.toLowerCase().includes(k)
      );

      if (hasSkewProneKey && !hasSaltAfter(node.id)) {
        risks.push({
          nodeId: node.id,
          nodeLabel: node.data.label,
          nodeType: 'join',
          riskLevel: 'medium',
          reason: `Join on "${leftKey}" may have skewed key distribution`,
          keyColumns: [leftKey, rightKey].filter(Boolean),
          suggestion: 'Consider salting the skewed key or using broadcast for the smaller table',
        });
      }

      // Left/right outer joins are more prone to skew from nulls
      if (joinType === 'left' || joinType === 'right' || joinType === 'full') {
        risks.push({
          nodeId: node.id,
          nodeLabel: node.data.label,
          nodeType: 'join',
          riskLevel: 'low',
          reason: `${joinType} join may produce null keys that concentrate in one partition`,
          keyColumns: [leftKey, rightKey].filter(Boolean),
          suggestion: 'Handle nulls separately before join or enable AQE skew handling',
        });
      }
    }

    // Check groupBy for skew risk
    if (transformData.transformType === 'groupBy') {
      const groupByColumns = config.columns as string[] || [];

      // Single column groupBy is more prone to skew
      if (groupByColumns.length === 1) {
        const col = groupByColumns[0];
        const skewProneColumns = ['category', 'country', 'status', 'type', 'region', 'user_id'];
        const isSkewProne = skewProneColumns.some(k => col.toLowerCase().includes(k));

        if (isSkewProne) {
          risks.push({
            nodeId: node.id,
            nodeLabel: node.data.label,
            nodeType: 'groupBy',
            riskLevel: 'medium',
            reason: `GroupBy on "${col}" may have uneven distribution`,
            keyColumns: groupByColumns,
            suggestion: 'Consider two-phase aggregation: partial + final, or enable AQE',
          });
        }
      }

      // Check for high-cardinality groupBy that might cause memory issues
      const highCardinalityHints = ['id', 'timestamp', 'datetime', 'uuid'];
      const hasHighCardinality = groupByColumns.some(col =>
        highCardinalityHints.some(hint => col.toLowerCase().includes(hint))
      );

      if (hasHighCardinality) {
        risks.push({
          nodeId: node.id,
          nodeLabel: node.data.label,
          nodeType: 'groupBy',
          riskLevel: 'high',
          reason: `GroupBy on high-cardinality column may cause memory pressure`,
          keyColumns: groupByColumns,
          suggestion: 'Reduce cardinality first (e.g., truncate timestamp to hour/day)',
        });
      }
    }

    // Check window functions for skew
    if (transformData.transformType === 'window') {
      const partitionBy = config.partitionBy as string[] || [];

      if (partitionBy.length === 1) {
        risks.push({
          nodeId: node.id,
          nodeLabel: node.data.label,
          nodeType: 'window',
          riskLevel: 'low',
          reason: `Window partitioned by single column "${partitionBy[0]}" may have skew`,
          keyColumns: partitionBy,
          suggestion: 'Monitor partition sizes; consider adding secondary partition key',
        });
      }
    }
  });

  // Sort by risk level
  return risks.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.riskLevel] - order[b.riskLevel];
  });
};

interface SkewDetectorProps {
  onSelectNode?: (nodeId: string) => void;
}

export const SkewDetector = ({ onSelectNode }: SkewDetectorProps) => {
  const { nodes, edges } = useWorkflowStore();

  const risks = useMemo(() => {
    return detectSkewRisks(nodes as Node<ETLNodeData>[], edges);
  }, [nodes, edges]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'join': return <GitMerge className="w-3 h-3" />;
      case 'groupBy': return <Layers className="w-3 h-3" />;
      case 'window': return <BarChart3 className="w-3 h-3" />;
      default: return <Shuffle className="w-3 h-3" />;
    }
  };

  if (nodes.length === 0) {
    return (
      <div className="p-4 text-center">
        <BarChart3 className="w-8 h-8 text-gray-600 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Add nodes to detect skew risks</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 bg-panel rounded border border-gray-700">
        <BarChart3 className="w-5 h-5 text-accent" />
        <div className="flex-1">
          <p className="text-sm text-white font-medium">Skew Detection</p>
          <p className="text-xs text-gray-500">
            {risks.length} potential skew {risks.length === 1 ? 'risk' : 'risks'} found
          </p>
        </div>
      </div>

      {/* No Risks */}
      {risks.length === 0 && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded text-center">
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-sm text-green-400 font-medium">No skew risks detected!</p>
          <p className="text-xs text-gray-500 mt-1">
            Your pipeline operations look balanced
          </p>
        </div>
      )}

      {/* Risks List */}
      {risks.length > 0 && (
        <div className="space-y-2">
          {risks.map((risk, index) => (
            <div
              key={`${risk.nodeId}-${index}`}
              onClick={() => onSelectNode?.(risk.nodeId)}
              className={`p-3 rounded border cursor-pointer hover:opacity-90 transition-opacity ${getRiskColor(risk.riskLevel)}`}
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  {risk.riskLevel === 'high' ? (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  ) : risk.riskLevel === 'medium' ? (
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <Info className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(risk.nodeType)}
                    <span className="text-sm font-medium">{risk.nodeLabel}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      risk.riskLevel === 'high' ? 'bg-red-500/30' :
                      risk.riskLevel === 'medium' ? 'bg-yellow-500/30' :
                      'bg-blue-500/30'
                    }`}>
                      {risk.riskLevel.toUpperCase()} RISK
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{risk.reason}</p>

                  {risk.keyColumns.length > 0 && (
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-500">
                      <span>Keys:</span>
                      {risk.keyColumns.map((col, i) => (
                        <span key={i} className="bg-panel px-1.5 py-0.5 rounded">
                          {col}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 pt-2 border-t border-gray-700/50">
                    <p className="text-[10px] text-gray-300 flex items-center gap-1">
                      <Shuffle className="w-3 h-3" />
                      {risk.suggestion}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skew Handling Reference */}
      <div className="p-3 bg-canvas rounded border border-gray-700">
        <div className="flex items-center gap-1 mb-2">
          <Info className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] text-gray-400 uppercase">Skew Handling Techniques</span>
        </div>
        <div className="space-y-2 text-[10px] text-gray-500">
          <div>
            <span className="text-gray-400 font-medium">Salting:</span>
            <span className="ml-1">Add random suffix to distribute keys</span>
          </div>
          <div>
            <span className="text-gray-400 font-medium">Broadcast:</span>
            <span className="ml-1">Replicate small table to all executors</span>
          </div>
          <div>
            <span className="text-gray-400 font-medium">Two-phase Agg:</span>
            <span className="ml-1">Partial aggregate then final aggregate</span>
          </div>
          <div>
            <span className="text-gray-400 font-medium">AQE (Spark 3.0+):</span>
            <span className="ml-1">Automatic skew join optimization</span>
          </div>
        </div>
      </div>

      {/* AQE Config Suggestion */}
      <div className="p-3 bg-canvas rounded border border-gray-700">
        <p className="text-[10px] text-gray-400 uppercase mb-2">Enable AQE Skew Handling</p>
        <pre className="text-[10px] text-accent overflow-x-auto">
{`spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")`}
        </pre>
      </div>
    </div>
  );
};
