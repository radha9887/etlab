import { useState } from 'react';
import { Save } from 'lucide-react';
import { ColumnSelector } from '../shared';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData } from '../../../types';

interface CrosstabConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

export const CrosstabConfig = ({ data, onUpdate, availableColumns }: CrosstabConfigProps) => {
  const [column1, setColumn1] = useState((data.config?.column1 as string) || '');
  const [column2, setColumn2] = useState((data.config?.column2 as string) || '');

  const handleSave = () => {
    onUpdate({
      column1,
      column2
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-panel rounded border border-gray-700">
        <p className="text-xs text-gray-400">
          Create a cross-tabulation (contingency table) of two columns.
          Shows the count of occurrences for each combination.
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Row Column</label>
        <ColumnSelector
          value={column1}
          onChange={setColumn1}
          columns={availableColumns}
          placeholder="Select first column (rows)"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          Values from this column become row labels
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Cross Column</label>
        <ColumnSelector
          value={column2}
          onChange={setColumn2}
          columns={availableColumns}
          placeholder="Select second column (columns)"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          Values from this column become column headers
        </p>
      </div>

      <div className="p-2 bg-canvas rounded border border-gray-700">
        <p className="text-[10px] text-gray-500 mb-2">
          <strong>Example Output:</strong>
        </p>
        <div className="text-[10px] text-gray-400 font-mono overflow-x-auto">
          <pre>{`| ${column1 || 'col1'}_${column2 || 'col2'} | A | B | C |
|----------|---|---|---|
| X        | 5 | 3 | 2 |
| Y        | 1 | 7 | 4 |`}</pre>
        </div>
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
