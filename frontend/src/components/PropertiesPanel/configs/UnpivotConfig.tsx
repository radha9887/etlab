import { useState } from 'react';
import { Save } from 'lucide-react';
import { MultiColumnSelector } from '../shared';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData } from '../../../types';

interface UnpivotConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

export const UnpivotConfig = ({ data, onUpdate, availableColumns }: UnpivotConfigProps) => {
  const [idColumns, setIdColumns] = useState((data.config?.idColumns as string) || '');
  const [valueColumns, setValueColumns] = useState((data.config?.valueColumns as string) || '');
  const [variableColName, setVariableColName] = useState((data.config?.variableColName as string) || 'variable');
  const [valueColName, setValueColName] = useState((data.config?.valueColName as string) || 'value');

  const handleSave = () => {
    onUpdate({
      idColumns,
      valueColumns,
      variableColName,
      valueColName,
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-panel rounded border border-gray-700">
        <p className="text-xs text-gray-400">
          Transform columns into rows (opposite of pivot). Also known as "melt".
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">ID Columns (keep as-is)</label>
        <MultiColumnSelector
          value={idColumns}
          onChange={setIdColumns}
          columns={availableColumns}
          placeholder="Select ID columns"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          Columns to keep unchanged (identifier columns)
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Value Columns (to unpivot)</label>
        <MultiColumnSelector
          value={valueColumns}
          onChange={setValueColumns}
          columns={availableColumns}
          placeholder="Select columns to unpivot"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          Columns to transform into rows
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Variable Column Name</label>
          <input
            type="text"
            value={variableColName}
            onChange={(e) => setVariableColName(e.target.value)}
            placeholder="variable"
            className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Value Column Name</label>
          <input
            type="text"
            value={valueColName}
            onChange={(e) => setValueColName(e.target.value)}
            placeholder="value"
            className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white"
          />
        </div>
      </div>

      <div className="p-2 bg-panel rounded border border-gray-700 text-[10px] text-gray-500">
        <p className="font-medium text-gray-400 mb-1">Example:</p>
        <p>Before: id, Q1, Q2, Q3, Q4</p>
        <p>After: id, variable (Q1/Q2/Q3/Q4), value</p>
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
