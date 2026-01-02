import { useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { MultiColumnSelector } from '../shared';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData } from '../../../types';

interface ReplaceConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

interface ReplaceMapping {
  id: string;
  oldValue: string;
  newValue: string;
}

export const ReplaceConfig = ({ data, onUpdate, availableColumns }: ReplaceConfigProps) => {
  const [subset, setSubset] = useState((data.config?.subset as string) || '');
  const [replacements, setReplacements] = useState<ReplaceMapping[]>(
    (data.config?.replacements as ReplaceMapping[]) ||
    [{ id: '1', oldValue: '', newValue: '' }]
  );

  const addReplacement = () => {
    setReplacements([...replacements, { id: Date.now().toString(), oldValue: '', newValue: '' }]);
  };

  const removeReplacement = (index: number) => {
    if (replacements.length > 1) {
      setReplacements(replacements.filter((_, i) => i !== index));
    }
  };

  const updateReplacement = (index: number, field: 'oldValue' | 'newValue', value: string) => {
    const updated = [...replacements];
    updated[index] = { ...updated[index], [field]: value };
    setReplacements(updated);
  };

  const handleSave = () => {
    const validReplacements = replacements.filter((r) => r.oldValue !== '');
    onUpdate({
      subset: subset || undefined,
      replacements: validReplacements,
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-panel rounded border border-gray-700">
        <p className="text-xs text-gray-400">
          Replace specific values in columns with new values.
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Apply to Columns (optional)</label>
        <MultiColumnSelector
          value={subset}
          onChange={setSubset}
          columns={availableColumns}
          placeholder="All columns (leave empty)"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          Leave empty to apply to all columns
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-2">Value Replacements</label>
        <div className="space-y-2">
          {replacements.map((r, idx) => (
            <div key={r.id} className="flex items-center gap-2">
              <input
                type="text"
                value={r.oldValue}
                onChange={(e) => updateReplacement(idx, 'oldValue', e.target.value)}
                placeholder="Old value"
                className="flex-1 px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
              />
              <span className="text-gray-500">→</span>
              <input
                type="text"
                value={r.newValue}
                onChange={(e) => updateReplacement(idx, 'newValue', e.target.value)}
                placeholder="New value"
                className="flex-1 px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
              />
              {replacements.length > 1 && (
                <button
                  onClick={() => removeReplacement(idx)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addReplacement}
          className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover mt-2"
        >
          <Plus className="w-3 h-3" /> Add Replacement
        </button>
      </div>

      <div className="p-2 bg-panel rounded border border-gray-700 text-[10px] text-gray-500">
        <p className="font-medium text-gray-400 mb-1">Notes:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Values are matched exactly (case-sensitive)</li>
          <li>Use empty string for newValue to replace with null</li>
          <li>Numbers and strings are handled automatically</li>
        </ul>
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
