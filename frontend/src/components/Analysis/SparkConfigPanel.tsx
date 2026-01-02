import { useState, useMemo } from 'react';
import {
  Settings,
  Server,
  Cpu,
  HardDrive,
  Zap,
  Copy,
  Check,
  Download,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';

interface ClusterConfig {
  executors: number;
  coresPerExecutor: number;
  memoryPerExecutor: number; // GB
  driverMemory: number; // GB
}

type WorkloadType = 'etl' | 'join-heavy' | 'aggregation' | 'ml' | 'streaming';

interface SparkConfig {
  key: string;
  value: string;
  description: string;
  category: string;
}

const DEFAULT_CLUSTER: ClusterConfig = {
  executors: 4,
  coresPerExecutor: 4,
  memoryPerExecutor: 8,
  driverMemory: 4,
};

const WORKLOAD_PRESETS: Record<WorkloadType, { label: string; description: string }> = {
  'etl': { label: 'ETL Batch', description: 'Standard ETL transformations' },
  'join-heavy': { label: 'Join Heavy', description: 'Multiple large joins' },
  'aggregation': { label: 'Aggregation', description: 'GroupBy and window functions' },
  'ml': { label: 'ML Training', description: 'Machine learning workloads' },
  'streaming': { label: 'Streaming', description: 'Structured streaming' },
};

// Generate recommended Spark configurations based on cluster and workload
const generateSparkConfigs = (
  cluster: ClusterConfig,
  workload: WorkloadType
): SparkConfig[] => {
  const totalCores = cluster.executors * cluster.coresPerExecutor;

  const configs: SparkConfig[] = [];

  // Core configurations
  configs.push({
    key: 'spark.executor.instances',
    value: String(cluster.executors),
    description: 'Number of executor instances',
    category: 'Resources',
  });

  configs.push({
    key: 'spark.executor.cores',
    value: String(cluster.coresPerExecutor),
    description: 'Cores per executor',
    category: 'Resources',
  });

  configs.push({
    key: 'spark.executor.memory',
    value: `${cluster.memoryPerExecutor}g`,
    description: 'Memory per executor',
    category: 'Resources',
  });

  configs.push({
    key: 'spark.driver.memory',
    value: `${cluster.driverMemory}g`,
    description: 'Driver memory',
    category: 'Resources',
  });

  // Calculate executor memory overhead (10% of executor memory, min 384MB)
  const memoryOverhead = Math.max(384, Math.round(cluster.memoryPerExecutor * 1024 * 0.1));
  configs.push({
    key: 'spark.executor.memoryOverhead',
    value: `${memoryOverhead}m`,
    description: 'Off-heap memory for JVM overhead',
    category: 'Resources',
  });

  // Shuffle partitions based on workload
  let shufflePartitions = totalCores * 2;
  if (workload === 'join-heavy') {
    shufflePartitions = totalCores * 3;
  } else if (workload === 'aggregation') {
    shufflePartitions = totalCores * 2;
  } else if (workload === 'ml') {
    shufflePartitions = totalCores * 4;
  }
  // Round to nice number
  shufflePartitions = Math.ceil(shufflePartitions / 10) * 10;

  configs.push({
    key: 'spark.sql.shuffle.partitions',
    value: String(shufflePartitions),
    description: 'Number of partitions for shuffles',
    category: 'Shuffle',
  });

  // Broadcast threshold based on workload
  let broadcastThreshold = 10 * 1024 * 1024; // 10MB default
  if (workload === 'join-heavy') {
    broadcastThreshold = 50 * 1024 * 1024; // 50MB for join-heavy
  } else if (workload === 'ml') {
    broadcastThreshold = 100 * 1024 * 1024; // 100MB for ML
  }

  configs.push({
    key: 'spark.sql.autoBroadcastJoinThreshold',
    value: String(broadcastThreshold),
    description: `Auto broadcast threshold (${Math.round(broadcastThreshold / 1024 / 1024)}MB)`,
    category: 'Join',
  });

  // AQE - Always enable for Spark 3.0+
  configs.push({
    key: 'spark.sql.adaptive.enabled',
    value: 'true',
    description: 'Enable Adaptive Query Execution',
    category: 'AQE',
  });

  configs.push({
    key: 'spark.sql.adaptive.coalescePartitions.enabled',
    value: 'true',
    description: 'Auto coalesce shuffle partitions',
    category: 'AQE',
  });

  if (workload === 'join-heavy' || workload === 'aggregation') {
    configs.push({
      key: 'spark.sql.adaptive.skewJoin.enabled',
      value: 'true',
      description: 'Handle skewed joins automatically',
      category: 'AQE',
    });

    configs.push({
      key: 'spark.sql.adaptive.skewJoin.skewedPartitionFactor',
      value: '5',
      description: 'Partition is skewed if size > median × factor',
      category: 'AQE',
    });

    configs.push({
      key: 'spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes',
      value: '256m',
      description: 'Minimum size to consider for skew',
      category: 'AQE',
    });
  }

  // Serialization
  configs.push({
    key: 'spark.serializer',
    value: 'org.apache.spark.serializer.KryoSerializer',
    description: 'Faster serialization than Java default',
    category: 'Serialization',
  });

  // Dynamic allocation for ETL
  if (workload === 'etl' || workload === 'aggregation') {
    configs.push({
      key: 'spark.dynamicAllocation.enabled',
      value: 'true',
      description: 'Scale executors based on workload',
      category: 'Dynamic Allocation',
    });

    configs.push({
      key: 'spark.dynamicAllocation.minExecutors',
      value: '1',
      description: 'Minimum number of executors',
      category: 'Dynamic Allocation',
    });

    configs.push({
      key: 'spark.dynamicAllocation.maxExecutors',
      value: String(cluster.executors * 2),
      description: 'Maximum number of executors',
      category: 'Dynamic Allocation',
    });
  }

  // ML specific configs
  if (workload === 'ml') {
    configs.push({
      key: 'spark.sql.execution.arrow.pyspark.enabled',
      value: 'true',
      description: 'Enable Arrow for Pandas UDFs',
      category: 'ML',
    });

    configs.push({
      key: 'spark.sql.execution.arrow.maxRecordsPerBatch',
      value: '10000',
      description: 'Batch size for Arrow transfers',
      category: 'ML',
    });
  }

  // Streaming specific configs
  if (workload === 'streaming') {
    configs.push({
      key: 'spark.streaming.backpressure.enabled',
      value: 'true',
      description: 'Enable backpressure handling',
      category: 'Streaming',
    });

    configs.push({
      key: 'spark.sql.streaming.checkpointLocation',
      value: '/checkpoint',
      description: 'Checkpoint directory for streaming',
      category: 'Streaming',
    });
  }

  return configs;
};

export const SparkConfigPanel = () => {
  const [cluster, setCluster] = useState<ClusterConfig>(DEFAULT_CLUSTER);
  const [workload, setWorkload] = useState<WorkloadType>('etl');
  const [showClusterConfig, setShowClusterConfig] = useState(true);
  const [copied, setCopied] = useState(false);

  const configs = useMemo(() => {
    return generateSparkConfigs(cluster, workload);
  }, [cluster, workload]);

  const totalCores = cluster.executors * cluster.coresPerExecutor;
  const totalMemory = cluster.executors * cluster.memoryPerExecutor;

  const handleClusterChange = (key: keyof ClusterConfig, value: number) => {
    setCluster(prev => ({ ...prev, [key]: value }));
  };

  // Group configs by category
  const groupedConfigs = useMemo(() => {
    const groups: Record<string, SparkConfig[]> = {};
    configs.forEach(config => {
      if (!groups[config.category]) {
        groups[config.category] = [];
      }
      groups[config.category].push(config);
    });
    return groups;
  }, [configs]);

  // Generate code format
  const generateCode = (): string => {
    const lines = ['# Spark Configuration', ''];
    configs.forEach(config => {
      lines.push(`spark.conf.set("${config.key}", "${config.value}")`);
    });
    return lines.join('\n');
  };

  // Generate spark-defaults.conf format
  const generateSparkDefaults = (): string => {
    const lines = ['# spark-defaults.conf', '# Generated by ETLab', ''];
    configs.forEach(config => {
      lines.push(`${config.key}=${config.value}`);
    });
    return lines.join('\n');
  };

  const copyToClipboard = async (format: 'code' | 'conf') => {
    const text = format === 'code' ? generateCode() : generateSparkDefaults();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadConfig = () => {
    const content = generateSparkDefaults();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spark-defaults.conf';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Cluster Configuration */}
      <div className="bg-panel rounded border border-gray-700">
        <button
          onClick={() => setShowClusterConfig(!showClusterConfig)}
          className="w-full p-3 flex items-center justify-between hover:bg-panel-light transition-colors"
        >
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-white">Cluster Configuration</span>
          </div>
          {showClusterConfig ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {showClusterConfig && (
          <div className="p-3 border-t border-gray-700 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
                  <Cpu className="w-3 h-3" /> Executors
                </label>
                <input
                  type="number"
                  min="1"
                  value={cluster.executors}
                  onChange={(e) => handleClusterChange('executors', parseInt(e.target.value) || 1)}
                  className="w-full mt-1 px-2 py-1.5 bg-canvas border border-gray-600 rounded text-sm text-white focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
                  <Cpu className="w-3 h-3" /> Cores/Executor
                </label>
                <input
                  type="number"
                  min="1"
                  value={cluster.coresPerExecutor}
                  onChange={(e) => handleClusterChange('coresPerExecutor', parseInt(e.target.value) || 1)}
                  className="w-full mt-1 px-2 py-1.5 bg-canvas border border-gray-600 rounded text-sm text-white focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
                  <HardDrive className="w-3 h-3" /> Executor Memory (GB)
                </label>
                <input
                  type="number"
                  min="1"
                  value={cluster.memoryPerExecutor}
                  onChange={(e) => handleClusterChange('memoryPerExecutor', parseInt(e.target.value) || 1)}
                  className="w-full mt-1 px-2 py-1.5 bg-canvas border border-gray-600 rounded text-sm text-white focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
                  <HardDrive className="w-3 h-3" /> Driver Memory (GB)
                </label>
                <input
                  type="number"
                  min="1"
                  value={cluster.driverMemory}
                  onChange={(e) => handleClusterChange('driverMemory', parseInt(e.target.value) || 1)}
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

      {/* Workload Type */}
      <div className="p-3 bg-panel rounded border border-gray-700">
        <label className="text-[10px] text-gray-500 uppercase block mb-2">Workload Type</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(WORKLOAD_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => setWorkload(key as WorkloadType)}
              className={`p-2 rounded border text-left transition-colors ${
                workload === key
                  ? 'border-accent bg-accent/10 text-white'
                  : 'border-gray-600 bg-canvas text-gray-400 hover:border-gray-500'
              }`}
            >
              <p className="text-xs font-medium">{preset.label}</p>
              <p className="text-[10px] text-gray-500">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Generated Configurations */}
      <div className="bg-panel rounded border border-gray-700">
        <div className="p-3 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-white">Generated Configuration</span>
              <span className="text-[10px] text-gray-500">({configs.length} settings)</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => copyToClipboard('code')}
                className="p-1.5 hover:bg-panel-light rounded text-gray-400 hover:text-white transition-colors"
                title="Copy as Python code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={downloadConfig}
                className="p-1.5 hover:bg-panel-light rounded text-gray-400 hover:text-white transition-colors"
                title="Download spark-defaults.conf"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 space-y-3 max-h-64 overflow-y-auto">
          {Object.entries(groupedConfigs).map(([category, categoryConfigs]) => (
            <div key={category}>
              <p className="text-[10px] text-gray-500 uppercase mb-1">{category}</p>
              <div className="space-y-1">
                {categoryConfigs.map(config => (
                  <div
                    key={config.key}
                    className="flex items-start justify-between p-2 bg-canvas rounded text-[10px]"
                  >
                    <div className="flex-1 min-w-0">
                      <code className="text-accent block truncate">{config.key}</code>
                      <span className="text-gray-500">{config.description}</span>
                    </div>
                    <code className="text-white ml-2 flex-shrink-0">{config.value}</code>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code Preview */}
      <div className="p-3 bg-canvas rounded border border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] text-gray-400 uppercase">Python Code</span>
        </div>
        <pre className="text-[10px] text-accent overflow-x-auto whitespace-pre max-h-32 overflow-y-auto">
{generateCode()}
        </pre>
      </div>

      {/* Tips */}
      <div className="p-3 bg-canvas rounded border border-gray-700">
        <div className="flex items-center gap-1 mb-2">
          <Info className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] text-gray-400 uppercase">Tips</span>
        </div>
        <ul className="text-[10px] text-gray-500 space-y-1">
          <li>• Set executor memory to ~75% of node memory to leave room for OS</li>
          <li>• Use 4-5 cores per executor for optimal parallelism</li>
          <li>• Enable AQE (Spark 3.0+) for automatic optimization</li>
          <li>• For large joins, increase broadcast threshold</li>
        </ul>
      </div>
    </div>
  );
};
