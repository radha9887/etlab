import { useState } from 'react';
import { Save } from 'lucide-react';
import { MultiColumnSelector } from '../shared';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData } from '../../../types';

interface DistinctConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

export const DistinctConfig = ({ data, onUpdate, availableColumns }: DistinctConfigProps) => {
  const [subset, setSubset] = useState((data.config?.subset as string) || '');

  const handleSave = () => {
    onUpdate({ subset: subset || undefined });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-panel rounded border border-gray-700">
        <p className="text-xs text-gray-400">Remove duplicate rows from the DataFrame.</p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Subset Columns (optional)</label>
        <MultiColumnSelector
          value={subset}
          onChange={setSubset}
          columns={availableColumns}
          placeholder="Select columns to check for duplicates"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          Leave empty to check all columns, or select specific columns for uniqueness
        </p>
      </div>

      <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm">
        <Save className="w-4 h-4" /> Save
      </button>
    </div>
  );
};
