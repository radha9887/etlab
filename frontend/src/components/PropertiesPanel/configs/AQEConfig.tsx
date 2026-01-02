import { useState, useEffect } from 'react';
import { Zap, Info, Settings } from 'lucide-react';
import type { TransformNodeData } from '../../../types';

interface AQEConfigProps {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

export const AQEConfig = ({ data, onUpdate }: AQEConfigProps) => {
  const config = data.config || {};

  const [enabled, setEnabled] = useState<boolean>(config.enabled !== false);
  const [coalescePartitions, setCoalescePartitions] = useState<boolean>(config.coalescePartitions !== false);
  const [skewJoin, setSkewJoin] = useState<boolean>(config.skewJoin !== false);
  const [skewedPartitionFactor, setSkewedPartitionFactor] = useState<number>(
    (config.skewedPartitionFactor as number) || 5
  );
  const [skewedPartitionThreshold, setSkewedPartitionThreshold] = useState<string>(
    (config.skewedPartitionThreshold as string) || '256m'
  );
  const [broadcastThreshold, setBroadcastThreshold] = useState<number>(
    (config.broadcastThreshold as number) || 10
  );
  const [localShuffleReader, setLocalShuffleReader] = useState<boolean>(
    config.localShuffleReader !== false
  );

  useEffect(() => {
    onUpdate({
      enabled,
      coalescePartitions,
      skewJoin,
      skewedPartitionFactor,
      skewedPartitionThreshold,
      broadcastThreshold,
      localShuffleReader,
    });
  }, [enabled, coalescePartitions, skewJoin, skewedPartitionFactor, skewedPartitionThreshold, broadcastThreshold, localShuffleReader]);

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 mt-0.5" />
          <div className="text-xs text-gray-300">
            <p className="font-medium text-blue-400 mb-1">Adaptive Query Execution (Spark 3.0+)</p>
            <p>
              AQE dynamically optimizes query plans at runtime based on actual data statistics.
              It can coalesce partitions, handle skewed joins, and optimize broadcast joins.
            </p>
          </div>
        </div>
      </div>

      {/* Main Toggle */}
      <div className="p-3 bg-panel rounded border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-white">Enable AQE</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent"></div>
          </label>
        </div>
      </div>

      {enabled && (
        <>
          {/* Coalesce Partitions */}
          <div className="p-3 bg-canvas rounded border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-400">Auto Coalesce Partitions</label>
              <input
                type="checkbox"
                checked={coalescePartitions}
                onChange={(e) => setCoalescePartitions(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-canvas text-accent focus:ring-accent focus:ring-offset-0"
              />
            </div>
            <p className="text-[10px] text-gray-500">
              Automatically merge small partitions after shuffle to reduce overhead
            </p>
          </div>

          {/* Skew Join Handling */}
          <div className="p-3 bg-canvas rounded border border-gray-700 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Skew Join Optimization</label>
              <input
                type="checkbox"
                checked={skewJoin}
                onChange={(e) => setSkewJoin(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-canvas text-accent focus:ring-accent focus:ring-offset-0"
              />
            </div>

            {skewJoin && (
              <>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">
                    Skewed Partition Factor
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="20"
                    value={skewedPartitionFactor}
                    onChange={(e) => setSkewedPartitionFactor(parseInt(e.target.value) || 5)}
                    className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-sm text-white focus:border-accent focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Partition is skewed if size &gt; median × factor
                  </p>
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">
                    Skewed Partition Threshold
                  </label>
                  <select
                    value={skewedPartitionThreshold}
                    onChange={(e) => setSkewedPartitionThreshold(e.target.value)}
                    className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-sm text-white focus:border-accent focus:outline-none"
                  >
                    <option value="64m">64 MB</option>
                    <option value="128m">128 MB</option>
                    <option value="256m">256 MB (default)</option>
                    <option value="512m">512 MB</option>
                    <option value="1g">1 GB</option>
                  </select>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Minimum size to consider for skew handling
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Broadcast Threshold */}
          <div className="p-3 bg-canvas rounded border border-gray-700">
            <label className="text-xs text-gray-400 block mb-1">
              Broadcast Join Threshold (MB)
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={broadcastThreshold}
              onChange={(e) => setBroadcastThreshold(parseInt(e.target.value) || 10)}
              className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-sm text-white focus:border-accent focus:outline-none"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Tables smaller than this will be broadcast (-1 to disable)
            </p>
          </div>

          {/* Local Shuffle Reader */}
          <div className="p-3 bg-canvas rounded border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-400">Local Shuffle Reader</label>
              <input
                type="checkbox"
                checked={localShuffleReader}
                onChange={(e) => setLocalShuffleReader(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-canvas text-accent focus:ring-accent focus:ring-offset-0"
              />
            </div>
            <p className="text-[10px] text-gray-500">
              Read shuffle data locally when possible to reduce network I/O
            </p>
          </div>
        </>
      )}

      {/* Code Preview */}
      <div className="p-3 bg-canvas rounded border border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] text-gray-400 uppercase">Generated Configuration</span>
        </div>
        <pre className="text-[10px] text-accent overflow-x-auto whitespace-pre-wrap">
{`spark.conf.set("spark.sql.adaptive.enabled", "${enabled}")
${enabled ? `spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "${coalescePartitions}")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "${skewJoin}")${skewJoin ? `
spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionFactor", "${skewedPartitionFactor}")
spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes", "${skewedPartitionThreshold}")` : ''}
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", "${broadcastThreshold * 1024 * 1024}")
spark.conf.set("spark.sql.adaptive.localShuffleReader.enabled", "${localShuffleReader}")` : ''}`}
        </pre>
      </div>

      {/* AQE Benefits */}
      <div className="p-3 bg-canvas rounded border border-gray-700">
        <p className="text-[10px] text-gray-400 uppercase mb-2">AQE Benefits</p>
        <ul className="text-[10px] text-gray-500 space-y-1">
          <li>• Dynamically coalesces shuffle partitions</li>
          <li>• Converts sort-merge join to broadcast join</li>
          <li>• Handles data skew in joins</li>
          <li>• Optimizes based on actual runtime statistics</li>
        </ul>
      </div>
    </div>
  );
};
