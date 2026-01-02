import { useState } from 'react';
import { Save } from 'lucide-react';
import { ColumnSelector } from '../shared';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData } from '../../../types';

interface FlattenConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

export const FlattenConfig = ({ data, onUpdate, availableColumns }: FlattenConfigProps) => {
  const [column, setColumn] = useState((data.config?.column as string) || '');
  const [prefix, setPrefix] = useState((data.config?.prefix as string) || '');
  const [separator, setSeparator] = useState((data.config?.separator as string) || '_');

  // Filter to show only struct type columns
  const structColumns = availableColumns.filter(
    col => col.dataType.toLowerCase().includes('struct') || col.dataType.toLowerCase().includes('row')
  );

  const handleSave = () => {
    onUpdate({
      column,
      prefix,
      separator
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-panel rounded border border-gray-700">
        <p className="text-xs text-gray-400">
          Flatten nested struct columns into separate columns.
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Struct Column</label>
        <ColumnSelector
          value={column}
          onChange={setColumn}
          columns={structColumns.length > 0 ? structColumns : availableColumns}
          placeholder="Select struct column to flatten"
        />
        {structColumns.length === 0 && availableColumns.length > 0 && (
          <p className="text-[10px] text-yellow-500 mt-1">
            No struct columns detected. Select any column or type manually.
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Column Prefix (optional)</label>
        <input
          type="text"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          placeholder="e.g., address"
          className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          Prefix for flattened column names. Leave empty to use original struct name.
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Separator</label>
        <input
          type="text"
          value={separator}
          onChange={(e) => setSeparator(e.target.value)}
          placeholder="_"
          className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          Separator between prefix and field name (default: _)
        </p>
      </div>

      <div className="p-2 bg-canvas rounded border border-gray-700">
        <p className="text-[10px] text-gray-500">
          <strong>Example:</strong> For struct column "address" with fields (city, zip),
          creates columns: address_city, address_zip
        </p>
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
