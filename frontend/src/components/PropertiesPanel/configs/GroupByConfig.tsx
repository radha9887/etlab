import { useState, useMemo } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { ColumnSelector, MultiColumnSelector, FormField, ToggleButton } from '../shared';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData } from '../../../types';

interface GroupByConfigProps extends WithAvailableColumns {
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

export const GroupByConfig = ({ data, onUpdate, availableColumns }: GroupByConfigProps) => {
  const [groupByColumns, setGroupByColumns] = useState((data.config?.groupByColumns as string) || '');
  const [aggregations, setAggregations] = useState<Aggregation[]>(
    (data.config?.aggregations as Aggregation[]) || [{ id: '1', column: '', function: 'count', alias: '' }]
  );
  const [enablePivot, setEnablePivot] = useState((data.config?.enablePivot as boolean) || false);
  const [pivotColumn, setPivotColumn] = useState((data.config?.pivotColumn as string) || '');
  const [pivotValues, setPivotValues] = useState((data.config?.pivotValues as string) || '');

  const aggFunctionGroups = [
    {
      label: 'Count',
      functions: [
        { value: 'count', label: 'count', desc: 'Count non-null values', needsColumn: false },
        { value: 'countDistinct', label: 'countDistinct', desc: 'Count unique values', needsColumn: true },
        { value: 'approxCountDistinct', label: 'approx_count_distinct', desc: 'Approximate distinct count', needsColumn: true },
      ]
    },
    {
      label: 'Sum/Average',
      functions: [
        { value: 'sum', label: 'sum', desc: 'Sum of values', needsColumn: true },
        { value: 'sumDistinct', label: 'sumDistinct', desc: 'Sum of distinct values', needsColumn: true },
        { value: 'avg', label: 'avg', desc: 'Average', needsColumn: true },
        { value: 'mean', label: 'mean', desc: 'Mean (same as avg)', needsColumn: true },
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
    {
      label: 'Collect',
      functions: [
        { value: 'collect_list', label: 'collect_list', desc: 'Collect to array (with duplicates)', needsColumn: true },
        { value: 'collect_set', label: 'collect_set', desc: 'Collect to set (unique)', needsColumn: true },
      ]
    },
    {
      label: 'Statistics',
      functions: [
        { value: 'stddev', label: 'stddev', desc: 'Sample standard deviation', needsColumn: true },
        { value: 'stddev_pop', label: 'stddev_pop', desc: 'Population std dev', needsColumn: true },
        { value: 'variance', label: 'variance', desc: 'Sample variance', needsColumn: true },
        { value: 'var_pop', label: 'var_pop', desc: 'Population variance', needsColumn: true },
        { value: 'percentile_approx', label: 'percentile_approx', desc: 'Approximate percentile', needsColumn: true, needsParams: true },
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
      groupByColumns,
      aggregations,
      enablePivot,
      pivotColumn: enablePivot ? pivotColumn : undefined,
      pivotValues: enablePivot ? pivotValues : undefined
    });
  };

  // Validation
  const validation = useMemo(() => {
    const errors: string[] = [];

    if (!groupByColumns.trim()) {
      errors.push('Select at least one column to group by');
    }

    const validAggs = aggregations.filter(a => a.alias);
    if (validAggs.length === 0) {
      errors.push('At least one aggregation with an alias is required');
    }

    if (enablePivot && !pivotColumn) {
      errors.push('Pivot column is required when pivot is enabled');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [groupByColumns, aggregations, enablePivot, pivotColumn]);

  return (
    <div className="space-y-4">
      <FormField label="Group By Columns">
        <MultiColumnSelector
          value={groupByColumns}
          onChange={setGroupByColumns}
          columns={availableColumns}
          placeholder="Select columns to group by"
        />
      </FormField>

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

                {fnConfig?.needsParams && (
                  <input
                    type="text"
                    value={agg.params || ''}
                    onChange={(e) => updateAggregation(idx, 'params', e.target.value)}
                    placeholder="0.5 for median, or [0.25, 0.5, 0.75]"
                    className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white"
                  />
                )}

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

                <p className="text-[10px] text-gray-500">{fnConfig?.desc}</p>
              </div>
            );
          })}
        </div>
        <button onClick={addAggregation} className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover mt-2">
          <Plus className="w-3 h-3" /> Add Aggregation
        </button>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <ToggleButton
          active={enablePivot}
          onChange={setEnablePivot}
          label="Enable Pivot"
        />

        {enablePivot && (
          <div className="space-y-2 mt-3 pl-4 border-l-2 border-accent/30">
            <FormField label="Pivot Column">
              <ColumnSelector
                value={pivotColumn}
                onChange={setPivotColumn}
                columns={availableColumns}
                placeholder="Select pivot column"
              />
            </FormField>
            <FormField label="Pivot Values (optional)" help="Specify values for better performance. Leave empty to auto-detect.">
              <input
                type="text"
                value={pivotValues}
                onChange={(e) => setPivotValues(e.target.value)}
                placeholder="Q1, Q2, Q3, Q4"
                className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
              />
            </FormField>
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {!validation.isValid && (
        <div className="p-2 bg-red-500/10 border border-red-500/30 rounded">
          <ul className="text-xs text-red-400 space-y-1">
            {validation.errors.map((err, i) => (
              <li key={i}>• {err}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={!validation.isValid}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded text-sm transition-colors ${
          validation.isValid
            ? 'bg-accent hover:bg-accent-hover text-white'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
      >
        <Save className="w-4 h-4" /> Save Configuration
      </button>
    </div>
  );
};
