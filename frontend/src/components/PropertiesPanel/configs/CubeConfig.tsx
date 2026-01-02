import { useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { ColumnSelector, MultiColumnSelector } from '../shared';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData } from '../../../types';

interface CubeConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

interface Aggregation {
  id: string;
  column: string;
  function: string;
  alias: string;
  params?: string;
}

export const CubeConfig = ({ data, onUpdate, availableColumns }: CubeConfigProps) => {
  const [cubeColumns, setCubeColumns] = useState((data.config?.cubeColumns as string) || '');
  const [aggregations, setAggregations] = useState<Aggregation[]>(
    (data.config?.aggregations as Aggregation[]) || [{ id: '1', column: '', function: 'count', alias: '' }]
  );

  const aggFunctionGroups = [
    {
      label: 'Count',
      functions: [
        { value: 'count', label: 'count', desc: 'Count non-null values', needsColumn: false },
        { value: 'countDistinct', label: 'countDistinct', desc: 'Count unique values', needsColumn: true },
      ]
    },
    {
      label: 'Sum/Average',
      functions: [
        { value: 'sum', label: 'sum', desc: 'Sum of values', needsColumn: true },
        { value: 'avg', label: 'avg', desc: 'Average', needsColumn: true },
      ]
    },
    {
      label: 'Min/Max',
      functions: [
        { value: 'min', label: 'min', desc: 'Minimum value', needsColumn: true },
        { value: 'max', label: 'max', desc: 'Maximum value', needsColumn: true },
      ]
    },
    {
      label: 'First/Last',
      functions: [
        { value: 'first', label: 'first', desc: 'First value in group', needsColumn: true },
        { value: 'last', label: 'last', desc: 'Last value in group', needsColumn: true },
      ]
    },
  ];

  const allFunctions = aggFunctionGroups.flatMap(g => g.functions);

  const addAggregation = () => {
    setAggregations([...aggregations, { id: Date.now().toString(), column: '', function: 'count', alias: '' }]);
  };

  const removeAggregation = (index: number) => {
    if (aggregations.length > 1) {
      setAggregations(aggregations.filter((_, i) => i !== index));
    }
  };

  const updateAggregation = (index: number, field: string, value: string) => {
    const updated = [...aggregations];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'function' || field === 'column') {
      const agg = updated[index];
      if (!agg.alias) {
        agg.alias = agg.column ? `${agg.function}_${agg.column}` : agg.function;
      }
    }
    setAggregations(updated);
  };

  const getFunctionConfig = (fn: string) => allFunctions.find(f => f.value === fn);

  const handleSave = () => {
    onUpdate({
      cubeColumns,
      aggregations
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-panel rounded border border-gray-700">
        <p className="text-xs text-gray-400">
          Create a multi-dimensional cube for all combinations of cube columns.
          Generates subtotals for every combination.
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Cube Columns</label>
        <MultiColumnSelector
          value={cubeColumns}
          onChange={setCubeColumns}
          columns={availableColumns}
          placeholder="Select columns for cube"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          Generates aggregates for all 2^n combinations of these columns
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-2">Aggregations</label>
        <div className="space-y-2">
          {aggregations.map((agg, idx) => {
            const fnConfig = getFunctionConfig(agg.function);
            return (
              <div key={agg.id} className="p-2 bg-panel rounded border border-gray-700 space-y-2">
                <div className="flex items-center gap-2">
                  <select
                    value={agg.function}
                    onChange={(e) => updateAggregation(idx, 'function', e.target.value)}
                    className="px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white flex-1"
                  >
                    {aggFunctionGroups.map((group) => (
                      <optgroup key={group.label} label={group.label}>
                        {group.functions.map((fn) => (
                          <option key={fn.value} value={fn.value}>{fn.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <span className="text-gray-500 text-xs">(</span>
                  {fnConfig?.needsColumn !== false ? (
                    <div className="flex-1">
                      <ColumnSelector
                        value={agg.column}
                        onChange={(val) => updateAggregation(idx, 'column', val)}
                        columns={availableColumns}
                        placeholder="column"
                      />
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">*</span>
                  )}
                  <span className="text-gray-500 text-xs">)</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-xs">AS</span>
                  <input
                    type="text"
                    value={agg.alias}
                    onChange={(e) => updateAggregation(idx, 'alias', e.target.value)}
                    placeholder="alias"
                    className="flex-1 px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white"
                  />
                  {aggregations.length > 1 && (
                    <button onClick={() => removeAggregation(idx)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={addAggregation} className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover mt-2">
          <Plus className="w-3 h-3" /> Add Aggregation
        </button>
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
