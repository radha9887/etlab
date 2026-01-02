import { useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { ColumnSelector, ExpressionBuilder } from '../shared';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData } from '../../../types';

interface AddColumnsConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

interface NewColumn {
  id: string;
  name: string;
  expression: string;
  expressionType: 'sql' | 'literal' | 'column';
}

export const AddColumnsConfig = ({ data, onUpdate, availableColumns }: AddColumnsConfigProps) => {
  const [newColumns, setNewColumns] = useState<NewColumn[]>(
    (data.config?.newColumns as NewColumn[]) ||
    [{ id: '1', name: '', expression: '', expressionType: 'sql' }]
  );

  const addColumn = () => {
    setNewColumns([...newColumns, { id: Date.now().toString(), name: '', expression: '', expressionType: 'sql' }]);
  };

  const removeColumn = (index: number) => {
    if (newColumns.length > 1) {
      setNewColumns(newColumns.filter((_, i) => i !== index));
    }
  };

  const updateColumn = (index: number, field: keyof NewColumn, value: string) => {
    const updated = [...newColumns];
    updated[index] = { ...updated[index], [field]: value };
    setNewColumns(updated);
  };

  const handleSave = () => {
    onUpdate({ newColumns });
  };

  // Convert availableColumns to the format expected by ExpressionBuilder
  const columnsForBuilder = availableColumns.map(col => ({
    name: col.name,
    dataType: col.dataType
  }));

  return (
    <div className="space-y-4">
      <div className="p-3 bg-panel rounded border border-gray-700">
        <p className="text-xs text-gray-400">Add new columns using expressions.</p>
      </div>

      <div className="space-y-3">
        {newColumns.map((col, idx) => (
          <div key={col.id} className="p-3 bg-panel rounded border border-gray-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Column {idx + 1}</span>
              {newColumns.length > 1 && (
                <button onClick={() => removeColumn(idx)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Column Name</label>
              <input
                type="text"
                value={col.name}
                onChange={(e) => updateColumn(idx, 'name', e.target.value)}
                placeholder="new_column"
                className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Expression Type</label>
              <div className="flex gap-1">
                <button
                  onClick={() => updateColumn(idx, 'expressionType', 'sql')}
                  className={`flex-1 px-2 py-1 text-xs rounded ${col.expressionType === 'sql' ? 'bg-accent text-white' : 'bg-canvas text-gray-400'}`}
                >
                  SQL Expr
                </button>
                <button
                  onClick={() => updateColumn(idx, 'expressionType', 'literal')}
                  className={`flex-1 px-2 py-1 text-xs rounded ${col.expressionType === 'literal' ? 'bg-accent text-white' : 'bg-canvas text-gray-400'}`}
                >
                  Literal
                </button>
                <button
                  onClick={() => updateColumn(idx, 'expressionType', 'column')}
                  className={`flex-1 px-2 py-1 text-xs rounded ${col.expressionType === 'column' ? 'bg-accent text-white' : 'bg-canvas text-gray-400'}`}
                >
                  Column Ref
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 mb-1">
                {col.expressionType === 'sql' ? 'SQL Expression' : col.expressionType === 'literal' ? 'Value' : 'Source Column'}
              </label>
              {col.expressionType === 'column' ? (
                <ColumnSelector
                  value={col.expression}
                  onChange={(val) => updateColumn(idx, 'expression', val)}
                  columns={availableColumns}
                  placeholder="Select column"
                />
              ) : col.expressionType === 'sql' ? (
                <ExpressionBuilder
                  value={col.expression}
                  onChange={(val) => updateColumn(idx, 'expression', val)}
                  availableColumns={columnsForBuilder}
                  placeholder="Enter expression or use function builder..."
                />
              ) : (
                <input
                  type="text"
                  value={col.expression}
                  onChange={(e) => updateColumn(idx, 'expression', e.target.value)}
                  placeholder="'default', 100, true"
                  className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white font-mono"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <button onClick={addColumn} className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover">
        <Plus className="w-3 h-3" /> Add Another Column
      </button>

      <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm">
        <Save className="w-4 h-4" /> Save Configuration
      </button>
    </div>
  );
};
