import { useState, useMemo } from 'react';
import {
  Layers,
  Calculator,
  Server,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useWorkflowStore } from '../../stores/workflowStore';
import type { Node } from '@xyflow/react';
import type { ETLNodeData, TransformNodeData } from '../../types';

interface ClusterConfig {
  executors: number;
  coresPerExecutor: number;
  memoryPerExecutor: number; // GB
  estimatedDataSize: number; // GB
}

interface PartitionRecommendation {
  nodeId: string;
  nodeLabel: string;
  currentPartitions: number | null;
  recommendedPartitions: number;
  reason: string;
  action: 'repartition' | 'coalesce' | 'optimal';
}

const DEFAULT_CLUSTER: ClusterConfig = {
  executors: 4,
  coresPerExecutor: 4,
  memoryPerExecutor: 8,
  estimatedDataSize: 10,
};

// Calculate optimal partitions based on cluster config and data size
const calculateOptimalPartitions = (config: ClusterConfig): number => {
  const totalCores = config.executors * config.coresPerExecutor;

  // Rule 1: 2-4 partitions per core for parallelism
  const byParallelism = totalCores * 3;

  // Rule 2: ~128MB per partition is ideal
  const byDataSize = Math.ceil(config.estimatedDataSize / 0.128);

  // Rule 3: At least as many partitions as cores
  const minPartitions = totalCores;

  // Take the max, but cap at reasonable limit
  const optimal = Math.max(minPartitions, Math.min(byParallelism, byDataSize));

  // Round to a nice number
  return Math.ceil(optimal / 10) * 10;
};

// Analyze workflow for partition issues
const analyzePartitions = (
  nodes: Node<ETLNodeData>[],
  optimalPartitions: number
): PartitionRecommendation[] => {
  const recommendations: PartitionRecommendation[] = [];

  nodes.forEach(node => {
    if (node.data.category === 'transform') {
      const transformData = node.data as TransformNodeData;

      // Check repartition nodes
      if (transformData.transformType === 'repartition') {
        const config = transformData.config || {};
        const currentPartitions = config.numPartitions as number || null;

        if (currentPartitions) {
          if (currentPartitions < optimalPartitions * 0.5) {
            recommendations.push({
              nodeId: node.id,
              nodeLabel: node.data.label,
              currentPartitions,
              recommendedPartitions: optimalPartitions,
              reason: `Current ${currentPartitions} partitions may cause under-utilization`,
              action: 'repartition',
            });
          } else if (currentPartitions > optimalPartitions * 2) {
            recommendations.push({
              nodeId: node.id,
              nodeLabel: node.data.label,
              currentPartitions,
              recommendedPartitions: optimalPartitions,
              reason: `Current ${currentPartitions} partitions may cause excessive overhead`,
              action: 'coalesce',
            });
          }
        }
      }

      // Check for shuffle operations that might benefit from explicit partitioning
      const shuffleOps = ['join', 'groupBy', 'window'];
      if (shuffleOps.includes(transformData.transformType)) {
        const config = transformData.config || {};
        if (!config.numPartitions) {
          recommendations.push({
            nodeId: node.id,
            nodeLabel: node.data.label,
            currentPartitions: null,
            recommendedPartitions: optimalPartitions,
            reason: `${transformData.transformType} will use spark.sql.shuffle.partitions (default 200)`,
            action: 'repartition',
          });
        }
      }
    }
  });

  return recommendations;
};

interface PartitionAdvisorProps {
  onSelectNode?: (nodeId: string) => void;
}

export const PartitionAdvisor = ({ onSelectNode }: PartitionAdvisorProps) => {
  const { nodes } = useWorkflowStore();
  const [config, setConfig] = useState<ClusterConfig>(DEFAULT_CLUSTER);
  const [showConfig, setShowConfig] = useState(true);

  const optimalPartitions = useMemo(() => {
    return calculateOptimalPartitions(config);
  }, [config]);

  const recommendations = useMemo(() => {
    return analyzePartitions(nodes as Node<ETLNodeData>[], optimalPartitions);
  }, [nodes, optimalPartitions]);

  const totalCores = config.executors * config.coresPerExecutor;
  const totalMemory = config.executors * config.memoryPerExecutor;

  const handleConfigChange = (key: keyof ClusterConfig, value: number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  if (nodes.length === 0) {
    return (
      <div className="p-4 text-center">
        <Layers className="w-8 h-8 text-gray-600 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Add nodes to get partition recommendations</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cluster Configuration */}
      <div className="bg-panel rounded border border-gray-700">
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="w-full p-3 flex items-center justify-between hover:bg-panel-light transition-colors"
        >
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-white">Cluster Configuration</span>
          </div>
          {showConfig ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {showConfig && (
          <div className="p-3 border-t border-gray-700 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-gray-500 uppercase">Executors</label>
                <input
                  type="number"
                  min="1"
                  value={config.executors}
                  onChange={(e) => handleConfigChange('executors', parseInt(e.target.value) || 1)}
                  className="w-full mt-1 px-2 py-1.5 bg-canvas border border-gray-600 rounded text-sm text-white focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase">Cores/Executor</label>
                <input
                  type="number"
                  min="1"
                  value={config.coresPerExecutor}
                  onChange={(e) => handleConfigChange('coresPerExecutor', parseInt(e.target.value) || 1)}
                  className="w-full mt-1 px-2 py-1.5 bg-canvas border border-gray-600 rounded text-sm text-white focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase">Memory (GB)</label>
                <input
                  type="number"
                  min="1"
                  value={config.memoryPerExecutor}
                  onChange={(e) => handleConfigChange('memoryPerExecutor', parseInt(e.target.value) || 1)}
                  className="w-full mt-1 px-2 py-1.5 bg-canvas border border-gray-600 rounded text-sm text-white focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase">Data Size (GB)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={config.estimatedDataSize}
                  onChange={(e) => handleConfigChange('estimatedDataSize', parseFloat(e.target.value) || 0.1)}
                  className="w-full mt-1 px-2 py-1.5 bg-canvas border border-gray-600 rounded text-sm text-white focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            {/* Cluster Summary */}
            <div className="flex items-center gap-4 pt-2 border-t border-gray-700 text-[10px] text-gray-500">
              <span>Total Cores: {totalCores}</span>
              <span>Total Memory: {totalMemory} GB</span>
            </div>
          </div>
        )}
      </div>

      {/* Optimal Partitions */}
      <div className="p-3 bg-accent/10 border border-accent/30 rounded">
        <div className="flex items-center gap-3">
          <Calculator className="w-5 h-5 text-accent" />
          <div className="flex-1">
            <p className="text-sm text-white font-medium">Recommended Partitions</p>
            <p className="text-2xl font-bold text-accent">{optimalPartitions}</p>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-gray-400">
          <p>Formula: max(cores × 3, data_size_gb ÷ 0.128)</p>
          <p className="mt-1">
            Based on {totalCores} cores and {config.estimatedDataSize} GB data
          </p>
        </div>
      </div>

      {/* Spark Config Suggestion */}
      <div className="p-3 bg-canvas rounded border border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] text-gray-400 uppercase">Suggested Spark Config</span>
        </div>
        <code className="block text-xs text-accent bg-panel p-2 rounded">
          spark.sql.shuffle.partitions = {optimalPartitions}
        </code>
      </div>

      {/* Recommendations */}
      {recommendations.length === 0 ? (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded text-center">
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-sm text-green-400 font-medium">Partitioning looks good!</p>
          <p className="text-xs text-gray-500 mt-1">
            No partition issues detected in your pipeline
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[10px] text-gray-500 uppercase">Recommendations</p>
          {recommendations.map((rec) => (
            <div
              key={rec.nodeId}
              onClick={() => onSelectNode?.(rec.nodeId)}
              className="p-3 rounded border border-yellow-500/30 bg-yellow-500/10 cursor-pointer hover:bg-yellow-500/20 transition-colors"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-yellow-400">{rec.nodeLabel}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      rec.action === 'coalesce'
                        ? 'bg-blue-500/30 text-blue-400'
                        : 'bg-orange-500/30 text-orange-400'
                    }`}>
                      {rec.action.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{rec.reason}</p>
                  <div className="flex items-center gap-2 mt-2 text-[10px]">
                    {rec.currentPartitions && (
                      <span className="text-gray-500">
                        Current: {rec.currentPartitions}
                      </span>
                    )}
                    <span className="text-accent">
                      Recommended: {rec.recommendedPartitions}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Partition Guidelines */}
      <div className="p-3 bg-canvas rounded border border-gray-700">
        <div className="flex items-center gap-1 mb-2">
          <HardDrive className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] text-gray-400 uppercase">Guidelines</span>
        </div>
        <div className="space-y-1 text-[10px] text-gray-500">
          <div className="flex justify-between">
            <span>Ideal partition size</span>
            <span>~128 MB</span>
          </div>
          <div className="flex justify-between">
            <span>Min partitions</span>
            <span>= total cores</span>
          </div>
          <div className="flex justify-between">
            <span>Max partitions</span>
            <span>= cores × 4</span>
          </div>
          <div className="flex justify-between">
            <span>Use coalesce when</span>
            <span>reducing partitions</span>
          </div>
          <div className="flex justify-between">
            <span>Use repartition when</span>
            <span>increasing or rebalancing</span>
          </div>
        </div>
      </div>
    </div>
  );
};
