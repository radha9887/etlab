import { useState } from 'react';
import { Save, CircleOff, Plus, X, Info } from 'lucide-react';
import { MultiColumnSelector } from '../shared';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData, ImputationMethod, MissingValueColumnConfig } from '../../../types';

interface MissingValueConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

const IMPUTATION_METHODS: { value: ImputationMethod; label: string; desc: string; needsConstant?: boolean }[] = [
  { value: 'drop', label: 'Drop Rows', desc: 'Remove rows with missing values' },
  { value: 'mean', label: 'Mean', desc: 'Fill with column mean (numeric only)' },
  { value: 'median', label: 'Median', desc: 'Fill with column median (numeric only)' },
  { value: 'mode', label: 'Mode', desc: 'Fill with most frequent value' },
  { value: 'constant', label: 'Constant', desc: 'Fill with a specific value', needsConstant: true },
  { value: 'forward', label: 'Forward Fill', desc: 'Use previous row value' },
  { value: 'backward', label: 'Backward Fill', desc: 'Use next row value' },
  { value: 'interpolate', label: 'Interpolate', desc: 'Linear interpolation (numeric only)' },
];

export const MissingValueConfig = ({ data, onUpdate, availableColumns }: MissingValueConfigProps) => {
  const config = data.config || {};

  const [mode, setMode] = useState<'global' | 'perColumn'>(
    (config.mode as 'global' | 'perColumn') || 'global'
  );
  const [globalMethod, setGlobalMethod] = useState<ImputationMethod>(
    (config.globalMethod as ImputationMethod) || 'drop'
  );
  const [globalConstant, setGlobalConstant] = useState<string>(
    String(config.globalConstant ?? '')
  );
  const [subset, setSubset] = useState<string>(
    (config.subset as string[])?.join(', ') || ''
  );
  const [columnConfigs, setColumnConfigs] = useState<MissingValueColumnConfig[]>(
    (config.columnConfigs as MissingValueColumnConfig[]) || []
  );

  const addColumnConfig = () => {
    setColumnConfigs([
      ...columnConfigs,
      { column: '', method: 'mean', constantValue: undefined }
    ]);
  };

  const updateColumnConfig = (index: number, field: keyof MissingValueColumnConfig, value: unknown) => {
    const newConfigs = [...columnConfigs];
    newConfigs[index] = { ...newConfigs[index], [field]: value };
    setColumnConfigs(newConfigs);
  };

  const removeColumnConfig = (index: number) => {
    setColumnConfigs(columnConfigs.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const subsetArray = subset
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    onUpdate({
      mode,
      globalMethod: mode === 'global' ? globalMethod : undefined,
      globalConstant: mode === 'global' && globalMethod === 'constant' ? globalConstant : undefined,
      subset: subsetArray.length > 0 ? subsetArray : undefined,
      columnConfigs: mode === 'perColumn' ? columnConfigs.filter(c => c.column) : undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="p-3 bg-orange-500/10 rounded border border-orange-500/30">
        <div className="flex items-start gap-2">
          <CircleOff className="w-4 h-4 text-orange-400 mt-0.5" />
          <div>
            <p className="text-xs text-orange-300 font-medium">Missing Value Handler</p>
            <p className="text-xs text-gray-400 mt-1">
              Handle null and missing values using various imputation strategies.
            </p>
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Handling Mode</label>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('global')}
            className={`flex-1 px-3 py-2 text-xs rounded transition-colors ${
              mode === 'global'
                ? 'bg-accent text-white'
                : 'bg-canvas text-gray-400 hover:bg-panel-light'
            }`}
          >
            Global
          </button>
          <button
            onClick={() => setMode('perColumn')}
            className={`flex-1 px-3 py-2 text-xs rounded transition-colors ${
              mode === 'perColumn'
                ? 'bg-accent text-white'
                : 'bg-canvas text-gray-400 hover:bg-panel-light'
            }`}
          >
            Per Column
          </button>
        </div>
        <p className="text-[10px] text-gray-500 mt-1">
          {mode === 'global'
            ? 'Apply same method to all columns'
            : 'Configure different methods per column'}
        </p>
      </div>

      {mode === 'global' && (
        <>
          {/* Global Method */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Imputation Method</label>
            <select
              value={globalMethod}
              onChange={(e) => setGlobalMethod(e.target.value as ImputationMethod)}
              className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-sm text-white focus:border-accent focus:outline-none"
            >
              {IMPUTATION_METHODS.map(m => (
                <option key={m.value} value={m.value}>
                  {m.label} - {m.desc}
                </option>
              ))}
            </select>
          </div>

          {/* Constant Value */}
          {globalMethod === 'constant' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Constant Value</label>
              <input
                type="text"
                value={globalConstant}
                onChange={(e) => setGlobalConstant(e.target.value)}
                placeholder="Enter replacement value"
                className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:border-accent focus:outline-none"
              />
            </div>
          )}

          {/* Column Subset */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Apply to Columns (optional)</label>
            <MultiColumnSelector
              value={subset}
              onChange={setSubset}
              columns={availableColumns}
              placeholder="All columns if empty"
            />
          </div>
        </>
      )}

      {mode === 'perColumn' && (
        <>
          {/* Per Column Configurations */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-400">Column Configurations</label>
              <button
                onClick={addColumnConfig}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-accent/20 text-accent rounded hover:bg-accent/30 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Column
              </button>
            </div>

            {columnConfigs.length === 0 ? (
              <div className="p-4 bg-canvas rounded border border-gray-700 text-center">
                <p className="text-xs text-gray-500">No column configurations yet</p>
                <button
                  onClick={addColumnConfig}
                  className="mt-2 text-xs text-accent hover:text-accent-hover"
                >
                  + Add your first column
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {columnConfigs.map((cc, index) => (
                  <div key={index} className="p-3 bg-canvas rounded border border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[10px] text-gray-500">Column {index + 1}</span>
                      <button
                        onClick={() => removeColumnConfig(index)}
                        className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <select
                        value={cc.column}
                        onChange={(e) => updateColumnConfig(index, 'column', e.target.value)}
                        className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none"
                      >
                        <option value="">Select column</option>
                        {availableColumns.map(col => (
                          <option key={col.name} value={col.name}>
                            {col.name} ({col.dataType})
                          </option>
                        ))}
                      </select>

                      <select
                        value={cc.method}
                        onChange={(e) => updateColumnConfig(index, 'method', e.target.value)}
                        className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none"
                      >
                        {IMPUTATION_METHODS.map(m => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>

                      {cc.method === 'constant' && (
                        <input
                          type="text"
                          value={cc.constantValue ?? ''}
                          onChange={(e) => updateColumnConfig(index, 'constantValue', e.target.value)}
                          placeholder="Constant value"
                          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white placeholder-gray-500 focus:border-accent focus:outline-none"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Method Info */}
      <div className="p-3 bg-canvas rounded border border-gray-700">
        <div className="flex items-center gap-1 mb-2">
          <Info className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] text-gray-400">Method Guide</span>
        </div>
        <div className="text-[10px] text-gray-500 space-y-1">
          <div><strong className="text-gray-400">Mean/Median:</strong> Best for numeric columns with normal distribution</div>
          <div><strong className="text-gray-400">Mode:</strong> Best for categorical columns</div>
          <div><strong className="text-gray-400">Forward/Backward Fill:</strong> Best for time-series data</div>
          <div><strong className="text-gray-400">Interpolate:</strong> Best for sequential numeric data</div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm transition-colors"
      >
        <Save className="w-4 h-4" /> Save Configuration
      </button>
    </div>
  );
};
