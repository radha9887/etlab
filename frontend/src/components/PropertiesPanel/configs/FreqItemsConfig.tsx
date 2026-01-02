import { useState } from 'react';
import { Save } from 'lucide-react';
import { MultiColumnSelector } from '../shared';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData } from '../../../types';

interface FreqItemsConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

export const FreqItemsConfig = ({ data, onUpdate, availableColumns }: FreqItemsConfigProps) => {
  const [columns, setColumns] = useState((data.config?.columns as string) || '');
  const [support, setSupport] = useState((data.config?.support as number) || 0.01);

  const handleSave = () => {
    onUpdate({
      columns,
      support
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-panel rounded border border-gray-700">
        <p className="text-xs text-gray-400">
          Find frequent items in columns. Returns items that appear in at least
          the specified fraction of rows.
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Columns</label>
        <MultiColumnSelector
          value={columns}
          onChange={setColumns}
          columns={availableColumns}
          placeholder="Select columns to analyze"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">
          Support Threshold: {(support * 100).toFixed(1)}%
        </label>
        <input
          type="range"
          min="0.001"
          max="0.5"
          step="0.001"
          value={support}
          onChange={(e) => setSupport(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>0.1%</span>
          <span>50%</span>
        </div>
        <p className="text-[10px] text-gray-500 mt-1">
          Items appearing in at least {(support * 100).toFixed(1)}% of rows will be returned.
          Lower values find rarer items but take longer.
        </p>
      </div>

      <div className="p-2 bg-canvas rounded border border-gray-700">
        <p className="text-[10px] text-gray-500">
          <strong>Note:</strong> Results are approximate. The algorithm may return
          false positives (items slightly below threshold) but no false negatives.
        </p>
      </div>

      <div className="p-2 bg-canvas rounded border border-gray-700">
        <p className="text-[10px] text-gray-500">
          <strong>Output:</strong> Creates columns named {'{column}_freqItems'} containing
          arrays of frequent values for each analyzed column.
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
