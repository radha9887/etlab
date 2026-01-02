import { useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { ColumnSelector, ToggleGroup } from '../shared';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData } from '../../../types';

interface SortConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

interface SortColumn {
  id: string;
  column: string;
  direction: 'asc' | 'desc';
  nulls: 'first' | 'last' | 'default';
}

export const SortConfig = ({ data, onUpdate, availableColumns }: SortConfigProps) => {
  const [sortColumns, setSortColumns] = useState<SortColumn[]>(
    (data.config?.sortColumns as SortColumn[]) || [{ id: '1', column: '', direction: 'asc', nulls: 'default' }]
  );

  const addSortColumn = () => {
    setSortColumns([...sortColumns, { id: Date.now().toString(), column: '', direction: 'asc', nulls: 'default' }]);
  };

  const updateSortColumn = (index: number, field: string, value: string) => {
    const updated = [...sortColumns];
    updated[index] = { ...updated[index], [field]: value };
    setSortColumns(updated);
  };

  const removeSortColumn = (index: number) => {
    if (sortColumns.length > 1) {
      setSortColumns(sortColumns.filter((_, i) => i !== index));
    }
  };

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const updated = [...sortColumns];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      setSortColumns(updated);
    } else if (direction === 'down' && index < sortColumns.length - 1) {
      const updated = [...sortColumns];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      setSortColumns(updated);
    }
  };

  const reverseAll = () => {
    setSortColumns(sortColumns.map(sc => ({ ...sc, direction: sc.direction === 'asc' ? 'desc' : 'asc' })));
  };

  const handleSave = () => {
    onUpdate({ sortColumns });
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-400">Sort Columns (in order)</label>
          <button onClick={reverseAll} className="text-xs text-accent hover:text-accent-hover">Reverse All</button>
        </div>

        <div className="space-y-2">
          {sortColumns.map((sc, idx) => (
            <div key={sc.id} className="p-2 bg-panel rounded border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-500 w-4">{idx + 1}.</span>
                <div className="flex-1">
                  <ColumnSelector
                    value={sc.column}
                    onChange={(val) => updateSortColumn(idx, 'column', val)}
                    columns={availableColumns}
                    placeholder="Select column"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ToggleGroup
                  options={[
                    { value: 'asc', label: 'ASC ↑' },
                    { value: 'desc', label: 'DESC ↓' }
                  ]}
                  value={sc.direction}
                  onChange={(v) => updateSortColumn(idx, 'direction', v)}
                  size="sm"
                />

                <select
                  value={sc.nulls}
                  onChange={(e) => updateSortColumn(idx, 'nulls', e.target.value)}
                  className="px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white"
                >
                  <option value="default">Nulls: Default</option>
                  <option value="first">Nulls First</option>
                  <option value="last">Nulls Last</option>
                </select>

                <div className="flex gap-1 ml-auto">
                  <button
                    onClick={() => moveColumn(idx, 'up')}
                    disabled={idx === 0}
                    className={`p-1 rounded ${idx === 0 ? 'text-gray-600' : 'text-gray-400 hover:text-white hover:bg-panel-light'}`}
                  >▲</button>
                  <button
                    onClick={() => moveColumn(idx, 'down')}
                    disabled={idx === sortColumns.length - 1}
                    className={`p-1 rounded ${idx === sortColumns.length - 1 ? 'text-gray-600' : 'text-gray-400 hover:text-white hover:bg-panel-light'}`}
                  >▼</button>
                  {sortColumns.length > 1 && (
                    <button onClick={() => removeSortColumn(idx)} className="p-1 text-red-400 hover:text-red-300">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={addSortColumn} className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover mt-2">
          <Plus className="w-3 h-3" /> Add Sort Column
        </button>
      </div>

      <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm transition-colors">
        <Save className="w-4 h-4" /> Save Configuration
      </button>
    </div>
  );
};
