import { useMemo } from 'react';
import {
  HardDrive,
  Plus,
  Database,
  Layers,
  GitMerge,
  CheckCircle,
  Info,
} from 'lucide-react';
import { useWorkflowStore } from '../../stores/workflowStore';
import type { Node, Edge } from '@xyflow/react';
import type { ETLNodeData, TransformNodeData } from '../../types';

interface CacheCandidate {
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  usageCount: number;
  consumers: string[];
  recommendedLevel: string;
  estimatedBenefit: 'high' | 'medium' | 'low';
  reason: string;
}

// Analyze workflow for cache opportunities
const findCacheCandidates = (
  nodes: Node<ETLNodeData>[],
  edges: Edge[]
): CacheCandidate[] => {
  const candidates: CacheCandidate[] = [];

  // Helper: Get output nodes for a node
  const getOutputNodes = (nodeId: string): Node<ETLNodeData>[] => {
    const outputEdges = edges.filter(e => e.source === nodeId);
    return outputEdges
      .map(e => nodes.find(n => n.id === e.target))
      .filter((n): n is Node<ETLNodeData> => n !== undefined);
  };

  // Helper: Check if node already has cache after it
  const hasCacheAfter = (nodeId: string): boolean => {
    const outputs = getOutputNodes(nodeId);
    return outputs.some(out => {
      if (out.data.category === 'transform') {
        const transform = out.data as TransformNodeData;
        return transform.transformType === 'cache' || transform.transformType === 'checkpoint';
      }
      return false;
    });
  };

  // Expensive operations that benefit most from caching
  const expensiveOps = ['join', 'groupBy', 'window', 'sort'];

  nodes.forEach(node => {
    // Skip sources and sinks
    if (node.data.category !== 'transform') return;

    // Skip if already followed by cache
    if (hasCacheAfter(node.id)) return;

    const outputs = getOutputNodes(node.id);
    const usageCount = outputs.length;

    // Only suggest caching if used multiple times
    if (usageCount <= 1) return;

    const transformData = node.data as TransformNodeData;
    const isExpensive = expensiveOps.includes(transformData.transformType);

    // Determine benefit level
    let benefit: 'high' | 'medium' | 'low' = 'low';
    let reason = '';

    if (isExpensive && usageCount > 1) {
      benefit = 'high';
      reason = `Expensive ${transformData.transformType} operation used ${usageCount} times`;
    } else if (usageCount >= 3) {
      benefit = 'high';
      reason = `Used ${usageCount} times - significant recomputation`;
    } else if (usageCount === 2) {
      benefit = isExpensive ? 'medium' : 'low';
      reason = `Used twice${isExpensive ? ' with expensive operation' : ''}`;
    }

    // Recommend storage level based on operation type
    let recommendedLevel = 'MEMORY_AND_DISK';
    if (transformData.transformType === 'groupBy' || transformData.transformType === 'window') {
      recommendedLevel = 'MEMORY_AND_DISK'; // Aggregations can be large
    } else if (transformData.transformType === 'filter' || transformData.transformType === 'select') {
      recommendedLevel = 'MEMORY_ONLY'; // Usually smaller after filtering
    }

    candidates.push({
      nodeId: node.id,
      nodeLabel: node.data.label,
      nodeType: transformData.transformType,
      usageCount,
      consumers: outputs.map(o => o.data.label),
      recommendedLevel,
      estimatedBenefit: benefit,
      reason,
    });
  });

  // Sort by benefit (high first)
  return candidates.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.estimatedBenefit] - order[b.estimatedBenefit];
  });
};

interface CacheAdvisorProps {
  onSelectNode?: (nodeId: string) => void;
  onAddCache?: (afterNodeId: string, storageLevel: string) => void;
}

export const CacheAdvisor = ({ onSelectNode, onAddCache }: CacheAdvisorProps) => {
  const { nodes, edges } = useWorkflowStore();

  const candidates = useMemo(() => {
    return findCacheCandidates(nodes as Node<ETLNodeData>[], edges);
  }, [nodes, edges]);

  const getBenefitColor = (benefit: string) => {
    switch (benefit) {
      case 'high': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
      default: return 'text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'join': return <GitMerge className="w-3 h-3" />;
      case 'groupBy': return <Layers className="w-3 h-3" />;
      default: return <Database className="w-3 h-3" />;
    }
  };

  if (nodes.length === 0) {
    return (
      <div className="p-4 text-center">
        <HardDrive className="w-8 h-8 text-gray-600 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Add nodes to find cache opportunities</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 bg-panel rounded border border-gray-700">
        <HardDrive className="w-5 h-5 text-accent" />
        <div className="flex-1">
          <p className="text-sm text-white font-medium">Cache Advisor</p>
          <p className="text-xs text-gray-500">
            {candidates.length} cache {candidates.length === 1 ? 'opportunity' : 'opportunities'} found
          </p>
        </div>
      </div>

      {/* No Candidates */}
      {candidates.length === 0 && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded text-center">
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-sm text-green-400 font-medium">No caching needed!</p>
          <p className="text-xs text-gray-500 mt-1">
            All reused DataFrames are already cached or only used once
          </p>
        </div>
      )}

      {/* Candidates List */}
      {candidates.length > 0 && (
        <div className="space-y-2">
          {candidates.map((candidate) => (
            <div
              key={candidate.nodeId}
              className={`p-3 rounded border ${getBenefitColor(candidate.estimatedBenefit)}`}
            >
              <div className="flex items-start justify-between">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => onSelectNode?.(candidate.nodeId)}
                >
                  <div className="flex items-center gap-2">
                    {getTypeIcon(candidate.nodeType)}
                    <span className="text-sm font-medium">{candidate.nodeLabel}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      candidate.estimatedBenefit === 'high' ? 'bg-green-500/30' :
                      candidate.estimatedBenefit === 'medium' ? 'bg-yellow-500/30' :
                      'bg-gray-500/30'
                    }`}>
                      {candidate.estimatedBenefit.toUpperCase()} BENEFIT
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mt-1">{candidate.reason}</p>

                  <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-500">
                    <span>Used by:</span>
                    {candidate.consumers.slice(0, 3).map((consumer, i) => (
                      <span key={i} className="bg-panel px-1.5 py-0.5 rounded">
                        {consumer}
                      </span>
                    ))}
                    {candidate.consumers.length > 3 && (
                      <span>+{candidate.consumers.length - 3} more</span>
                    )}
                  </div>
                </div>

                {onAddCache && (
                  <button
                    onClick={() => onAddCache(candidate.nodeId, candidate.recommendedLevel)}
                    className="flex items-center gap-1 px-2 py-1 bg-accent/20 text-accent text-xs rounded hover:bg-accent/30 transition-colors"
                    title="Add cache node"
                  >
                    <Plus className="w-3 h-3" />
                    Cache
                  </button>
                )}
              </div>

              <div className="mt-2 pt-2 border-t border-gray-700/50">
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-gray-500">Recommended:</span>
                  <code className="bg-panel px-1.5 py-0.5 rounded text-accent">
                    .persist({candidate.recommendedLevel})
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Storage Levels Reference */}
      <div className="p-3 bg-canvas rounded border border-gray-700">
        <div className="flex items-center gap-1 mb-2">
          <Info className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] text-gray-400">Storage Levels</span>
        </div>
        <div className="space-y-1 text-[10px] text-gray-500">
          <div className="flex justify-between">
            <span>MEMORY_ONLY</span>
            <span>Fast, may fail if data doesn't fit</span>
          </div>
          <div className="flex justify-between">
            <span>MEMORY_AND_DISK</span>
            <span>Safe default, spills to disk</span>
          </div>
          <div className="flex justify-between">
            <span>MEMORY_ONLY_SER</span>
            <span>Compact, slower access</span>
          </div>
          <div className="flex justify-between">
            <span>DISK_ONLY</span>
            <span>Large data, slow access</span>
          </div>
        </div>
      </div>
    </div>
  );
};
