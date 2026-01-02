import { useState, useMemo } from 'react';
import { Save, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { MultiColumnSelector, ExpressionBuilder, FormField } from '../shared';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData } from '../../../types';

interface SelectConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

interface ComputedColumn {
  id: string;
  expression: string;
  alias: string;
}

export const SelectConfig = ({ data, onUpdate, availableColumns }: SelectConfigProps) => {
  const [columns, setColumns] = useState((data.config?.columns as string) || '');
  const [computedColumns, setComputedColumns] = useState<ComputedColumn[]>(
    (data.config?.computedColumns as ComputedColumn[]) || []
  );
  const [showComputed, setShowComputed] = useState(computedColumns.length > 0);

  const addComputedColumn = () => {
    setComputedColumns([...computedColumns, {
      id: Date.now().toString(),
      expression: '',
      alias: ''
    }]);
    setShowComputed(true);
  };

  const removeComputedColumn = (index: number) => {
    setComputedColumns(computedColumns.filter((_, i) => i !== index));
  };

  const updateComputedColumn = (index: number, field: keyof ComputedColumn, value: string) => {
    const updated = [...computedColumns];
    updated[index] = { ...updated[index], [field]: value };
    setComputedColumns(updated);
  };

  const handleSave = () => {
    onUpdate({
      columns,
      computedColumns: computedColumns.filter(c => c.expression && c.alias)
    });
  };

  // Convert availableColumns to the format expected by ExpressionBuilder
  const columnsForBuilder = availableColumns.map(col => ({
    name: col.name,
    dataType: col.dataType
  }));

  // Validation
  const validation = useMemo(() => {
    const errors: string[] = [];

    // Check for computed columns without alias
    const invalidComputed = computedColumns.filter(c => c.expression && !c.alias);
    if (invalidComputed.length > 0) {
      errors.push('All computed columns need an alias');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [computedColumns]);

  return (
    <div className="space-y-4">
      {/* Column Selection */}
      <FormField label="Select Columns" help="Leave empty or type * for all columns">
        <MultiColumnSelector
          value={columns}
          onChange={setColumns}
          columns={availableColumns}
          placeholder="Select columns"
        />
      </FormField>

      {/* Computed Columns Section */}
      <div className="border border-gray-700 rounded">
        <button
          onClick={() => setShowComputed(!showComputed)}
          className="w-full flex items-center justify-between p-2 text-xs text-gray-400 hover:bg-panel"
        >
          <span className="flex items-center gap-2">
            {showComputed ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            Computed Columns
            {computedColumns.length > 0 && (
              <span className="px-1.5 py-0.5 bg-accent/20 text-accent rounded text-[10px]">
                {computedColumns.length}
              </span>
            )}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              addComputedColumn();
            }}
            className="text-accent hover:text-accent-hover"
          >
            <Plus className="w-3 h-3" />
          </button>
        </button>

        {showComputed && (
          <div className="p-2 border-t border-gray-700 space-y-3">
            <p className="text-[10px] text-gray-500">
              Add new columns using expressions. Supports all functions including window functions.
            </p>

            {computedColumns.length === 0 ? (
              <button
                onClick={addComputedColumn}
                className="w-full p-3 border border-dashed border-gray-600 rounded text-xs text-gray-400 hover:border-accent hover:text-accent"
              >
                + Add computed column
              </button>
            ) : (
              computedColumns.map((col, idx) => (
                <div key={col.id} className="p-3 bg-panel rounded border border-gray-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Column {idx + 1}</span>
                    <button
                      onClick={() => removeComputedColumn(idx)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Expression */}
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">Expression</label>
                    <ExpressionBuilder
                      value={col.expression}
                      onChange={(val) => updateComputedColumn(idx, 'expression', val)}
                      availableColumns={columnsForBuilder}
                      placeholder="e.g., col1 * 2, CONCAT(first, ' ', last)"
                    />
                  </div>

                  {/* Alias */}
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">Column Name (Alias)</label>
                    <input
                      type="text"
                      value={col.alias}
                      onChange={(e) => updateComputedColumn(idx, 'alias', e.target.value)}
                      placeholder="new_column_name"
                      className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>
              ))
            )}

            {computedColumns.length > 0 && (
              <button
                onClick={addComputedColumn}
                className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover"
              >
                <Plus className="w-3 h-3" /> Add Another
              </button>
            )}
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
