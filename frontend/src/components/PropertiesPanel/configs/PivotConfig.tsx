import { useState } from 'react';
import { Save, Info } from 'lucide-react';
import { ColumnSelector, MultiColumnSelector } from '../shared';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData } from '../../../types';

interface PivotConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

const aggregateFunctions = [
  { value: 'sum', label: 'Sum', description: 'Sum of values' },
  { value: 'avg', label: 'Average', description: 'Average of values' },
  { value: 'count', label: 'Count', description: 'Count of values' },
  { value: 'min', label: 'Min', description: 'Minimum value' },
  { value: 'max', label: 'Max', description: 'Maximum value' },
  { value: 'first', label: 'First', description: 'First value' },
  { value: 'last', label: 'Last', description: 'Last value' },
  { value: 'collect_list', label: 'Collect List', description: 'Collect as list' },
  { value: 'collect_set', label: 'Collect Set', description: 'Collect unique as set' },
];

export const PivotConfig = ({ data, onUpdate, availableColumns }: PivotConfigProps) => {
  const [groupByColumns, setGroupByColumns] = useState((data.config?.groupByColumns as string) || '');
  const [pivotColumn, setPivotColumn] = useState((data.config?.pivotColumn as string) || '');
  const [valueColumn, setValueColumn] = useState((data.config?.valueColumn as string) || '');
  const [aggFunction, setAggFunction] = useState((data.config?.aggFunction as string) || 'sum');
  const [pivotValues, setPivotValues] = useState((data.config?.pivotValues as string) || '');

  const handleSave = () => {
    onUpdate({
      groupByColumns,
      pivotColumn,
      valueColumn,
      aggFunction,
      pivotValues: pivotValues || undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-panel rounded border border-gray-700">
        <p className="text-xs text-gray-400">
          Transform rows into columns (opposite of unpivot/melt). Unique values in the pivot column become new columns.
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Group By Columns</label>
        <MultiColumnSelector
          value={groupByColumns}
          onChange={setGroupByColumns}
          columns={availableColumns}
          placeholder="Select group by columns"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          Columns to group by (kept as rows)
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Pivot Column *</label>
        <ColumnSelector
          value={pivotColumn}
          onChange={setPivotColumn}
          columns={availableColumns}
          placeholder="Select column to pivot"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          Unique values in this column become new column headers
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Value Column *</label>
        <ColumnSelector
          value={valueColumn}
          onChange={setValueColumn}
          columns={availableColumns}
          placeholder="Select value column"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          Values to aggregate for each pivot column
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Aggregate Function</label>
        <select
          value={aggFunction}
          onChange={(e) => setAggFunction(e.target.value)}
          className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white"
        >
          {aggregateFunctions.map((fn) => (
            <option key={fn.value} value={fn.value}>
              {fn.label} - {fn.description}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">
          Pivot Values (optional)
        </label>
        <input
          type="text"
          value={pivotValues}
          onChange={(e) => setPivotValues(e.target.value)}
          placeholder='e.g., "Q1", "Q2", "Q3", "Q4"'
          className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white font-mono"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          Limit to specific values (comma-separated). Leave empty for all unique values.
        </p>
      </div>

      <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-400">
          <p className="font-medium mb-1">Performance Tip:</p>
          <p>Specifying pivot values improves performance by avoiding a scan to find unique values.</p>
        </div>
      </div>

      <div className="p-2 bg-panel rounded border border-gray-700 text-[10px] text-gray-500">
        <p className="font-medium text-gray-400 mb-1">Example:</p>
        <p>Before: product, quarter, sales</p>
        <p>→ (A, Q1, 100), (A, Q2, 150), (B, Q1, 200)</p>
        <p className="mt-1">After: product, Q1, Q2</p>
        <p>→ (A, 100, 150), (B, 200, null)</p>
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
