import { useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { ColumnSelector } from '../shared';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData } from '../../../types';

interface RenameConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

interface RenameMapping {
  id: string;
  oldName: string;
  newName: string;
}

export const RenameConfig = ({ data, onUpdate, availableColumns }: RenameConfigProps) => {
  const [renameMappings, setRenameMappings] = useState<RenameMapping[]>(
    (data.config?.renameMappings as RenameMapping[]) ||
    [{ id: '1', oldName: '', newName: '' }]
  );

  const addMapping = () => {
    setRenameMappings([...renameMappings, { id: Date.now().toString(), oldName: '', newName: '' }]);
  };

  const removeMapping = (index: number) => {
    if (renameMappings.length > 1) {
      setRenameMappings(renameMappings.filter((_, i) => i !== index));
    }
  };

  const updateMapping = (index: number, field: 'oldName' | 'newName', value: string) => {
    const updated = [...renameMappings];
    updated[index] = { ...updated[index], [field]: value };
    setRenameMappings(updated);
  };

  const handleSave = () => {
    // Filter out empty mappings
    const validMappings = renameMappings.filter(m => m.oldName && m.newName);
    onUpdate({ renameMappings: validMappings });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-gray-400 mb-2">Column Renames</label>
        <div className="space-y-2">
          {renameMappings.map((mapping, idx) => (
            <div key={mapping.id} className="p-2 bg-panel rounded border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1">
                  <label className="block text-[10px] text-gray-500 mb-1">Current Name</label>
                  <ColumnSelector
                    value={mapping.oldName}
                    onChange={(val) => updateMapping(idx, 'oldName', val)}
                    columns={availableColumns}
                    placeholder="Select column"
                  />
                </div>
                <div className="flex items-center pt-4">
                  <span className="text-gray-500">→</span>
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] text-gray-500 mb-1">New Name</label>
                  <input
                    type="text"
                    value={mapping.newName}
                    onChange={(e) => updateMapping(idx, 'newName', e.target.value)}
                    placeholder="new_column_name"
                    className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none"
                  />
                </div>
                {renameMappings.length > 1 && (
                  <button
                    onClick={() => removeMapping(idx)}
                    className="text-red-400 hover:text-red-300 pt-4"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addMapping}
          className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover mt-2"
        >
          <Plus className="w-3 h-3" /> Add Rename
        </button>
      </div>

      <p className="text-[10px] text-gray-500">
        Rename columns without modifying data. Original column is replaced with new name.
      </p>

      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm transition-colors"
      >
        <Save className="w-4 h-4" /> Save Configuration
      </button>
    </div>
  );
};
