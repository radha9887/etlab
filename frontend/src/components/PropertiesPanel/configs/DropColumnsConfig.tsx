import { useState } from 'react';
import { Save } from 'lucide-react';
import { MultiColumnSelector } from '../shared';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData } from '../../../types';

interface DropColumnsConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

export const DropColumnsConfig = ({ data, onUpdate, availableColumns }: DropColumnsConfigProps) => {
  const [columns, setColumns] = useState((data.config?.columns as string) || '');

  const handleSave = () => {
    onUpdate({ columns });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-panel rounded border border-gray-700">
        <p className="text-xs text-gray-400">Remove selected columns from the DataFrame.</p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Columns to Drop</label>
        <MultiColumnSelector
          value={columns}
          onChange={setColumns}
          columns={availableColumns}
          placeholder="Select columns to remove"
        />
      </div>

      <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm">
        <Save className="w-4 h-4" /> Save
      </button>
    </div>
  );
};
