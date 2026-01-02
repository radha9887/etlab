import { useState, useEffect } from 'react';
import type { TransformNodeData } from '../../../types';

interface ColumnInfo {
  name: string;
  dataType: string;
  source: string;
}

interface PerformanceConfigProps {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
  availableColumns?: ColumnInfo[];
}

// ============================================
// SparkConfig - Session Configuration
// ============================================
export const SparkConfigConfig = ({ data, onUpdate }: PerformanceConfigProps) => {
  const config = data.config || {};

  // Memory settings
  const [executorMemory, setExecutorMemory] = useState(config.executorMemory as string || '4g');
  const [driverMemory, setDriverMemory] = useState(config.driverMemory as string || '2g');
  const [executorCores, setExecutorCores] = useState(config.executorCores as number || 4);
  const [numExecutors, setNumExecutors] = useState(config.numExecutors as number || 2);

  // Shuffle settings
  const [shufflePartitions, setShufflePartitions] = useState(config.shufflePartitions as number || 200);
  const [broadcastThreshold, setBroadcastThreshold] = useState(config.broadcastThreshold as number || 10);

  // Dynamic allocation
  const [dynamicAllocation, setDynamicAllocation] = useState(config.dynamicAllocation as boolean ?? false);
  const [minExecutors, setMinExecutors] = useState(config.minExecutors as number || 1);
  const [maxExecutors, setMaxExecutors] = useState(config.maxExecutors as number || 10);
  const [initialExecutors, setInitialExecutors] = useState(config.initialExecutors as number || 2);

  // Compression
  const [compression, setCompression] = useState(config.compression as string || 'snappy');

  // Serialization
  const [serializer, setSerializer] = useState(config.serializer as string || 'org.apache.spark.serializer.KryoSerializer');
  const [kryoRegistrationRequired, setKryoRegistrationRequired] = useState(config.kryoRegistrationRequired as boolean ?? false);

  // Additional settings
  const [adaptiveEnabled, setAdaptiveEnabled] = useState(config.adaptiveEnabled as boolean ?? true);
  const [arrowEnabled, setArrowEnabled] = useState(config.arrowEnabled as boolean ?? true);

  // Custom configs
  const [customConfigs, setCustomConfigs] = useState<Array<{key: string; value: string}>>(
    (config.customConfigs as Array<{key: string; value: string}>) || []
  );

  useEffect(() => {
    onUpdate({
      executorMemory,
      driverMemory,
      executorCores,
      numExecutors,
      shufflePartitions,
      broadcastThreshold,
      dynamicAllocation,
      minExecutors,
      maxExecutors,
      initialExecutors,
      compression,
      serializer,
      kryoRegistrationRequired,
      adaptiveEnabled,
      arrowEnabled,
      customConfigs,
    });
  }, [
    executorMemory, driverMemory, executorCores, numExecutors,
    shufflePartitions, broadcastThreshold,
    dynamicAllocation, minExecutors, maxExecutors, initialExecutors,
    compression, serializer, kryoRegistrationRequired,
    adaptiveEnabled, arrowEnabled, customConfigs,
  ]);

  const addCustomConfig = () => {
    setCustomConfigs([...customConfigs, { key: '', value: '' }]);
  };

  const updateCustomConfig = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...customConfigs];
    updated[index][field] = value;
    setCustomConfigs(updated);
  };

  const removeCustomConfig = (index: number) => {
    setCustomConfigs(customConfigs.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Memory Configuration */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Memory</h4>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Executor Memory</label>
          <input
            type="text"
            value={executorMemory}
            onChange={(e) => setExecutorMemory(e.target.value)}
            placeholder="4g"
            className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-sm text-white"
          />
          <p className="text-xs text-gray-500 mt-1">e.g., 4g, 8g, 16g</p>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Driver Memory</label>
          <input
            type="text"
            value={driverMemory}
            onChange={(e) => setDriverMemory(e.target.value)}
            placeholder="2g"
            className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-sm text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Executor Cores</label>
            <input
              type="number"
              value={executorCores}
              onChange={(e) => setExecutorCores(Number(e.target.value))}
              min={1}
              className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Num Executors</label>
            <input
              type="number"
              value={numExecutors}
              onChange={(e) => setNumExecutors(Number(e.target.value))}
              min={1}
              className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-sm text-white"
            />
          </div>
        </div>
      </div>

      {/* Shuffle Configuration */}
      <div className="space-y-3 pt-3 border-t border-gray-700">
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Shuffle</h4>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Shuffle Partitions</label>
          <input
            type="number"
            value={shufflePartitions}
            onChange={(e) => setShufflePartitions(Number(e.target.value))}
            min={1}
            className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-sm text-white"
          />
          <p className="text-xs text-gray-500 mt-1">Default: 200. Lower for small data, higher for large.</p>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Broadcast Threshold (MB)</label>
          <input
            type="number"
            value={broadcastThreshold}
            onChange={(e) => setBroadcastThreshold(Number(e.target.value))}
            min={-1}
            className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-sm text-white"
          />
          <p className="text-xs text-gray-500 mt-1">Tables smaller than this are broadcast. -1 to disable.</p>
        </div>
      </div>

      {/* Dynamic Allocation */}
      <div className="space-y-3 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Dynamic Allocation</h4>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={dynamicAllocation}
              onChange={(e) => setDynamicAllocation(e.target.checked)}
              className="rounded border-gray-600 bg-canvas text-accent focus:ring-accent"
            />
            <span className="text-xs text-gray-300">Enable</span>
          </label>
        </div>

        {dynamicAllocation && (
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Min</label>
              <input
                type="number"
                value={minExecutors}
                onChange={(e) => setMinExecutors(Number(e.target.value))}
                min={0}
                className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Initial</label>
              <input
                type="number"
                value={initialExecutors}
                onChange={(e) => setInitialExecutors(Number(e.target.value))}
                min={0}
                className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Max</label>
              <input
                type="number"
                value={maxExecutors}
                onChange={(e) => setMaxExecutors(Number(e.target.value))}
                min={1}
                className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-sm text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Compression */}
      <div className="space-y-3 pt-3 border-t border-gray-700">
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Compression</h4>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Codec</label>
          <select
            value={compression}
            onChange={(e) => setCompression(e.target.value)}
            className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-sm text-white"
          >
            <option value="snappy">Snappy (Fast)</option>
            <option value="lz4">LZ4 (Balanced)</option>
            <option value="zstd">ZSTD (Best Compression)</option>
            <option value="gzip">GZIP (Compatible)</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>

      {/* Serialization */}
      <div className="space-y-3 pt-3 border-t border-gray-700">
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Serialization</h4>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Serializer</label>
          <select
            value={serializer}
            onChange={(e) => setSerializer(e.target.value)}
            className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-sm text-white"
          >
            <option value="org.apache.spark.serializer.KryoSerializer">Kryo (Recommended)</option>
            <option value="org.apache.spark.serializer.JavaSerializer">Java (Default)</option>
          </select>
        </div>

        {serializer.includes('Kryo') && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={kryoRegistrationRequired}
              onChange={(e) => setKryoRegistrationRequired(e.target.checked)}
              className="rounded border-gray-600 bg-canvas text-accent focus:ring-accent"
            />
            <span className="text-xs text-gray-300">Require Kryo Registration</span>
          </label>
        )}
      </div>

      {/* Additional Settings */}
      <div className="space-y-3 pt-3 border-t border-gray-700">
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Additional Settings</h4>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={adaptiveEnabled}
            onChange={(e) => setAdaptiveEnabled(e.target.checked)}
            className="rounded border-gray-600 bg-canvas text-accent focus:ring-accent"
          />
          <span className="text-xs text-gray-300">Enable Adaptive Query Execution</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={arrowEnabled}
            onChange={(e) => setArrowEnabled(e.target.checked)}
            className="rounded border-gray-600 bg-canvas text-accent focus:ring-accent"
          />
          <span className="text-xs text-gray-300">Enable Apache Arrow</span>
        </label>
      </div>

      {/* Custom Configs */}
      <div className="space-y-3 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Custom Configs</h4>
          <button
            onClick={addCustomConfig}
            className="text-xs text-accent hover:text-accent/80"
          >
            + Add Config
          </button>
        </div>

        {customConfigs.map((cfg, idx) => (
          <div key={idx} className="flex gap-2 items-start">
            <input
              type="text"
              value={cfg.key}
              onChange={(e) => updateCustomConfig(idx, 'key', e.target.value)}
              placeholder="spark.sql.xxx"
              className="flex-1 px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white"
            />
            <input
              type="text"
              value={cfg.value}
              onChange={(e) => updateCustomConfig(idx, 'value', e.target.value)}
              placeholder="value"
              className="flex-1 px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white"
            />
            <button
              onClick={() => removeCustomConfig(idx)}
              className="p-1.5 text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// Bucketing - Pre-shuffle for Writes
// ============================================
export const BucketingConfig = ({ data, onUpdate, availableColumns = [] }: PerformanceConfigProps) => {
  const config = data.config || {};

  const [numBuckets, setNumBuckets] = useState(config.numBuckets as number || 32);
  const [bucketColumns, setBucketColumns] = useState<string[]>(
    (config.bucketColumns as string[]) || []
  );
  const [sortColumns, setSortColumns] = useState<string[]>(
    (config.sortColumns as string[]) || []
  );
  const [enableSort, setEnableSort] = useState(config.enableSort as boolean ?? false);
  const [outputPath, setOutputPath] = useState(config.outputPath as string || '');
  const [outputFormat, setOutputFormat] = useState(config.outputFormat as string || 'parquet');
  const [tableName, setTableName] = useState(config.tableName as string || '');
  const [mode, setMode] = useState(config.mode as string || 'overwrite');

  useEffect(() => {
    onUpdate({
      numBuckets,
      bucketColumns,
      sortColumns: enableSort ? sortColumns : [],
      enableSort,
      outputPath,
      outputFormat,
      tableName,
      mode,
    });
  }, [numBuckets, bucketColumns, sortColumns, enableSort, outputPath, outputFormat, tableName, mode]);

  const toggleBucketColumn = (columnName: string) => {
    if (bucketColumns.includes(columnName)) {
      setBucketColumns(bucketColumns.filter(c => c !== columnName));
    } else {
      setBucketColumns([...bucketColumns, columnName]);
    }
  };

  const toggleSortColumn = (columnName: string) => {
    if (sortColumns.includes(columnName)) {
      setSortColumns(sortColumns.filter(c => c !== columnName));
    } else {
      setSortColumns([...sortColumns, columnName]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Bucket Configuration */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Bucket Configuration</h4>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Number of Buckets</label>
          <input
            type="number"
            value={numBuckets}
            onChange={(e) => setNumBuckets(Number(e.target.value))}
            min={1}
            max={10000}
            className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-sm text-white"
          />
          <p className="text-xs text-gray-500 mt-1">Power of 2 recommended (32, 64, 128, 256)</p>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Bucket Columns</label>
          {availableColumns.length > 0 ? (
            <div className="max-h-32 overflow-y-auto border border-gray-600 rounded p-2 space-y-1">
              {availableColumns.map(col => (
                <label key={col.name} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bucketColumns.includes(col.name)}
                    onChange={() => toggleBucketColumn(col.name)}
                    className="rounded border-gray-600 bg-canvas text-accent focus:ring-accent"
                  />
                  <span className="text-xs text-gray-300">{col.name}</span>
                </label>
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={bucketColumns.join(', ')}
              onChange={(e) => setBucketColumns(e.target.value.split(',').map(c => c.trim()).filter(c => c))}
              placeholder="col1, col2"
              className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-sm text-white"
            />
          )}
          {bucketColumns.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">Selected: {bucketColumns.join(', ')}</p>
          )}
        </div>
      </div>

      {/* Sort Configuration */}
      <div className="space-y-3 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Sort Within Buckets</h4>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enableSort}
              onChange={(e) => setEnableSort(e.target.checked)}
              className="rounded border-gray-600 bg-canvas text-accent focus:ring-accent"
            />
            <span className="text-xs text-gray-300">Enable</span>
          </label>
        </div>

        {enableSort && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Sort Columns</label>
            {availableColumns.length > 0 ? (
              <div className="max-h-32 overflow-y-auto border border-gray-600 rounded p-2 space-y-1">
                {availableColumns.map(col => (
                  <label key={col.name} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sortColumns.includes(col.name)}
                      onChange={() => toggleSortColumn(col.name)}
                      className="rounded border-gray-600 bg-canvas text-accent focus:ring-accent"
                    />
                    <span className="text-xs text-gray-300">{col.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={sortColumns.join(', ')}
                onChange={(e) => setSortColumns(e.target.value.split(',').map(c => c.trim()).filter(c => c))}
                placeholder="col1, col2"
                className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-sm text-white"
              />
            )}
          </div>
        )}
      </div>

      {/* Output Configuration */}
      <div className="space-y-3 pt-3 border-t border-gray-700">
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Output</h4>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Table Name</label>
          <input
            type="text"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="database.bucketed_table"
            className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-sm text-white"
          />
          <p className="text-xs text-gray-500 mt-1">Required for bucketing (saveAsTable)</p>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Output Format</label>
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-sm text-white"
          >
            <option value="parquet">Parquet</option>
            <option value="orc">ORC</option>
            <option value="delta">Delta Lake</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Write Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-sm text-white"
          >
            <option value="overwrite">Overwrite</option>
            <option value="append">Append</option>
            <option value="errorifexists">Error If Exists</option>
            <option value="ignore">Ignore</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Output Path (Optional)</label>
          <input
            type="text"
            value={outputPath}
            onChange={(e) => setOutputPath(e.target.value)}
            placeholder="path/to/output"
            className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-sm text-white"
          />
        </div>
      </div>

      {/* Info */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-300 space-y-1">
        <p className="font-medium">When to use Bucketing:</p>
        <ul className="list-disc list-inside space-y-0.5 text-blue-200">
          <li>Frequent joins on the same columns</li>
          <li>Large tables joined repeatedly</li>
          <li>Avoiding shuffle in joins/aggregations</li>
        </ul>
      </div>
    </div>
  );
};
