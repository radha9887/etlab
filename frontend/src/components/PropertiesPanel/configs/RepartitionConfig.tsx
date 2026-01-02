import { useState } from 'react';
import { Save } from 'lucide-react';
import { MultiColumnSelector } from '../shared';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData } from '../../../types';

interface RepartitionConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

export const RepartitionConfig = ({ data, onUpdate, availableColumns }: RepartitionConfigProps) => {
  const [numPartitions, setNumPartitions] = useState((data.config?.numPartitions as number) || 0);
  const [partitionBy, setPartitionBy] = useState((data.config?.partitionBy as string) || '');
  const [mode, setMode] = useState<'repartition' | 'coalesce'>(
    (data.config?.mode as 'repartition' | 'coalesce') || 'repartition'
  );

  const handleSave = () => {
    onUpdate({
      numPartitions: numPartitions || undefined,
      partitionBy: partitionBy || undefined,
      mode,
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-panel rounded border border-gray-700">
        <p className="text-xs text-gray-400">
          Control the number of partitions for parallel processing.
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-2">Mode</label>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('repartition')}
            className={`flex-1 px-3 py-2 text-xs rounded ${
              mode === 'repartition' ? 'bg-accent text-white' : 'bg-panel text-gray-400'
            }`}
          >
            Repartition
          </button>
          <button
            onClick={() => setMode('coalesce')}
            className={`flex-1 px-3 py-2 text-xs rounded ${
              mode === 'coalesce' ? 'bg-accent text-white' : 'bg-panel text-gray-400'
            }`}
          >
            Coalesce
          </button>
        </div>
        <p className="text-[10px] text-gray-500 mt-1">
          {mode === 'repartition'
            ? 'Full shuffle - can increase or decrease partitions'
            : 'No shuffle - can only decrease partitions (faster)'}
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Number of Partitions</label>
        <input
          type="number"
          value={numPartitions || ''}
          onChange={(e) => setNumPartitions(parseInt(e.target.value) || 0)}
          placeholder="e.g., 200"
          min="1"
          className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          Target number of partitions (leave empty if using partition columns)
        </p>
      </div>

      {mode === 'repartition' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Partition By Columns (optional)</label>
          <MultiColumnSelector
            value={partitionBy}
            onChange={setPartitionBy}
            columns={availableColumns}
            placeholder="Select partition columns"
          />
          <p className="text-[10px] text-gray-500 mt-1">
            Rows with same values will be in same partition
          </p>
        </div>
      )}

      <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded">
        <p className="text-xs text-blue-400">
          {mode === 'repartition'
            ? 'Tip: Use repartition before wide operations (joins, groupBy) for better parallelism'
            : 'Tip: Use coalesce before writing to reduce output files'}
        </p>
      </div>

      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm transition-colors"
      >
        <Save className="w-4 h-4" /> Save Configuration
      </button>
    </div>
  );
};
