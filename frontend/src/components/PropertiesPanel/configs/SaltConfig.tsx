import { useState, useEffect } from 'react';
import { Shuffle, Info, AlertTriangle } from 'lucide-react';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData } from '../../../types';

interface SaltConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

export const SaltConfig = ({ data, onUpdate, availableColumns }: SaltConfigProps) => {
  const config = data.config || {};

  const [column, setColumn] = useState<string>(config.column as string || '');
  const [saltBuckets, setSaltBuckets] = useState<number>(config.saltBuckets as number || 10);
  const [saltColumnName, setSaltColumnName] = useState<string>(config.saltColumnName as string || 'salted_key');
  const [includeOriginal, setIncludeOriginal] = useState<boolean>(config.includeOriginal !== false);

  useEffect(() => {
    onUpdate({
      column,
      saltBuckets,
      saltColumnName,
      includeOriginal,
    });
  }, [column, saltBuckets, saltColumnName, includeOriginal]);

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 mt-0.5" />
          <div className="text-xs text-gray-300">
            <p className="font-medium text-blue-400 mb-1">Salting for Skewed Joins</p>
            <p>
              Salting distributes skewed keys across multiple partitions by appending
              a random bucket number. Use this when a small number of keys dominate
              the data distribution.
            </p>
          </div>
        </div>
      </div>

      {/* Column to Salt */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">Column to Salt</label>
        <select
          value={column}
          onChange={(e) => setColumn(e.target.value)}
          className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-sm text-white focus:border-accent focus:outline-none"
        >
          <option value="">Select column...</option>
          {availableColumns.map((col) => (
            <option key={col.name} value={col.name}>{col.name} ({col.dataType})</option>
          ))}
        </select>
        <p className="text-[10px] text-gray-500 mt-1">
          The join key column with skewed distribution
        </p>
      </div>

      {/* Salt Buckets */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">Number of Salt Buckets</label>
        <input
          type="number"
          min="2"
          max="100"
          value={saltBuckets}
          onChange={(e) => setSaltBuckets(parseInt(e.target.value) || 10)}
          className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-sm text-white focus:border-accent focus:outline-none"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          More buckets = better distribution but more overhead (typical: 10-50)
        </p>
      </div>

      {/* Salted Column Name */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">Salted Column Name</label>
        <input
          type="text"
          value={saltColumnName}
          onChange={(e) => setSaltColumnName(e.target.value)}
          placeholder="salted_key"
          className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-sm text-white focus:border-accent focus:outline-none"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          Name for the new salted column (format: key_0, key_1, ...)
        </p>
      </div>

      {/* Include Original */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="includeOriginal"
          checked={includeOriginal}
          onChange={(e) => setIncludeOriginal(e.target.checked)}
          className="w-4 h-4 rounded border-gray-600 bg-canvas text-accent focus:ring-accent focus:ring-offset-0"
        />
        <label htmlFor="includeOriginal" className="text-sm text-gray-300">
          Keep original column
        </label>
      </div>

      {/* Usage Warning */}
      <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
          <div className="text-xs text-gray-300">
            <p className="font-medium text-yellow-400 mb-1">Important</p>
            <p>
              Both sides of the join need matching salt. For the smaller table,
              you'll need to explode it with all salt values (0 to {saltBuckets - 1}).
            </p>
          </div>
        </div>
      </div>

      {/* Code Preview */}
      <div className="p-3 bg-canvas rounded border border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <Shuffle className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] text-gray-400 uppercase">Generated Code Preview</span>
        </div>
        <pre className="text-[10px] text-accent overflow-x-auto whitespace-pre-wrap">
{`# Salt the skewed key
SALT_BUCKETS = ${saltBuckets}
df = df.withColumn(
    "${saltColumnName}",
    F.concat(
        F.col("${column || 'key'}"),
        F.lit("_"),
        (F.rand() * SALT_BUCKETS).cast("int").cast("string")
    )
)`}
        </pre>
      </div>

      {/* Workflow Tips */}
      <div className="p-3 bg-canvas rounded border border-gray-700">
        <p className="text-[10px] text-gray-400 uppercase mb-2">Workflow for Salted Joins</p>
        <ol className="text-[10px] text-gray-500 space-y-1 list-decimal list-inside">
          <li>Salt the large (skewed) DataFrame</li>
          <li>Explode the small DataFrame with all salt values</li>
          <li>Join on the salted key</li>
          <li>Drop the salt column after join</li>
        </ol>
      </div>
    </div>
  );
};
