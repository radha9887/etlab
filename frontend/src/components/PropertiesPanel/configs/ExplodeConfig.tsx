import { useState } from 'react';
import { Save } from 'lucide-react';
import { ColumnSelector } from '../shared';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData } from '../../../types';

interface ExplodeConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

export const ExplodeConfig = ({ data, onUpdate, availableColumns }: ExplodeConfigProps) => {
  const [column, setColumn] = useState((data.config?.column as string) || '');
  const [mode, setMode] = useState<'explode' | 'explode_outer' | 'posexplode' | 'posexplode_outer'>(
    (data.config?.mode as 'explode' | 'explode_outer' | 'posexplode' | 'posexplode_outer') || 'explode'
  );
  const [alias, setAlias] = useState((data.config?.alias as string) || '');

  const modes = [
    { value: 'explode', label: 'Explode', desc: 'Flatten array/map, skip nulls' },
    { value: 'explode_outer', label: 'Explode Outer', desc: 'Flatten array/map, keep nulls' },
    { value: 'posexplode', label: 'Pos Explode', desc: 'Flatten with position index' },
    { value: 'posexplode_outer', label: 'Pos Explode Outer', desc: 'Flatten with position, keep nulls' },
  ];

  const handleSave = () => {
    onUpdate({
      column,
      mode,
      alias: alias || undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-panel rounded border border-gray-700">
        <p className="text-xs text-gray-400">
          Flatten an array or map column into multiple rows.
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Column to Explode</label>
        <ColumnSelector
          value={column}
          onChange={setColumn}
          columns={availableColumns}
          placeholder="Select array/map column"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          Select an array or map column to flatten
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-2">Explode Mode</label>
        <div className="grid grid-cols-2 gap-1">
          {modes.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value as typeof mode)}
              className={`px-2 py-2 text-xs rounded transition-colors ${
                mode === m.value
                  ? 'bg-accent text-white'
                  : 'bg-panel text-gray-400 hover:bg-panel-light'
              }`}
              title={m.desc}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-500 mt-1">
          {modes.find((m) => m.value === mode)?.desc}
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Output Alias (optional)</label>
        <input
          type="text"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder="exploded_col"
          className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          Name for the exploded column (defaults to 'col' or 'key'/'value' for maps)
        </p>
      </div>

      {mode.includes('pos') && (
        <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded">
          <p className="text-xs text-blue-400">
            Position explode adds a 'pos' column with the array index (0-based)
          </p>
        </div>
      )}

      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm transition-colors"
      >
        <Save className="w-4 h-4" /> Save Configuration
      </button>
    </div>
  );
};
