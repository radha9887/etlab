import { useState } from 'react';
import { Save, Plus, Trash2, GripVertical } from 'lucide-react';
import { ColumnSelector } from '../shared';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData } from '../../../types';

interface RollupConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

interface Aggregation {
  id: string;
  column: string;
  function: string;
  alias: string;
}

interface RollupColumn {
  id: string;
  column: string;
}

export const RollupConfig = ({ data, onUpdate, availableColumns }: RollupConfigProps) => {
  const [rollupColumns, setRollupColumns] = useState<RollupColumn[]>(
    (data.config?.rollupColumns as RollupColumn[]) || [{ id: '1', column: '' }]
  );
  const [aggregations, setAggregations] = useState<Aggregation[]>(
    (data.config?.aggregations as Aggregation[]) || [{ id: '1', column: '', function: 'count', alias: '' }]
  );

  const aggFunctionGroups = [
    {
      label: 'Count',
      functions: [
        { value: 'count', label: 'count', needsColumn: false },
        { value: 'countDistinct', label: 'countDistinct', needsColumn: true },
      ]
    },
    {
      label: 'Sum/Average',
      functions: [
        { value: 'sum', label: 'sum', needsColumn: true },
        { value: 'avg', label: 'avg', needsColumn: true },
      ]
    },
    {
      label: 'Min/Max',
      functions: [
        { value: 'min', label: 'min', needsColumn: true },
        { value: 'max', label: 'max', needsColumn: true },
      ]
    },
  ];

  const allFunctions = aggFunctionGroups.flatMap(g => g.functions);

  // Rollup column management
  const addRollupColumn = () => {
    setRollupColumns([...rollupColumns, { id: Date.now().toString(), column: '' }]);
  };

  const removeRollupColumn = (index: number) => {
    if (rollupColumns.length > 1) {
      setRollupColumns(rollupColumns.filter((_, i) => i !== index));
    }
  };

  const updateRollupColumn = (index: number, column: string) => {
    const updated = [...rollupColumns];
    updated[index] = { ...updated[index], column };
    setRollupColumns(updated);
  };

  // Aggregation management
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
      rollupColumns,
      aggregations
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-panel rounded border border-gray-700">
        <p className="text-xs text-gray-400">
          Create hierarchical rollup aggregates. Order matters - produces
          subtotals for each level of the hierarchy.
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-2">Rollup Columns (hierarchical order)</label>
        <div className="space-y-1">
          {rollupColumns.map((rc, idx) => (
            <div key={rc.id} className="flex items-center gap-2">
              <GripVertical className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500 w-4">{idx + 1}.</span>
              <div className="flex-1">
                <ColumnSelector
                  value={rc.column}
                  onChange={(val) => updateRollupColumn(idx, val)}
                  columns={availableColumns}
                  placeholder="Select column"
                />
              </div>
              {rollupColumns.length > 1 && (
                <button onClick={() => removeRollupColumn(idx)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button onClick={addRollupColumn} className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover mt-2">
          <Plus className="w-3 h-3" /> Add Column
        </button>
        <p className="text-[10px] text-gray-500 mt-1">
          Example: Year, Quarter, Month produces subtotals at each level
        </p>
      </div>

      <div className="border-t border-gray-700 pt-4">
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
