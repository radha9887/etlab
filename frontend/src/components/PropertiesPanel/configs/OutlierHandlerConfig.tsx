import { useState } from 'react';
import { Save, AlertTriangle, Plus, X, Info } from 'lucide-react';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData, OutlierMethod, OutlierAction } from '../../../types';

interface OutlierHandlerConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

interface OutlierColumnConfig {
  column: string;
  method: OutlierMethod;
  threshold: number;
  action: OutlierAction;
  capMin?: number;
  capMax?: number;
}

const OUTLIER_METHODS: { value: OutlierMethod; label: string; desc: string; defaultThreshold: number }[] = [
  { value: 'iqr', label: 'IQR', desc: 'Interquartile Range (Q1-1.5*IQR to Q3+1.5*IQR)', defaultThreshold: 1.5 },
  { value: 'zscore', label: 'Z-Score', desc: 'Standard deviations from mean', defaultThreshold: 3 },
  { value: 'percentile', label: 'Percentile', desc: 'Values outside percentile range', defaultThreshold: 5 },
  { value: 'mad', label: 'MAD', desc: 'Median Absolute Deviation', defaultThreshold: 3 },
];

const OUTLIER_ACTIONS: { value: OutlierAction; label: string; desc: string }[] = [
  { value: 'remove', label: 'Remove Rows', desc: 'Delete rows with outliers' },
  { value: 'cap', label: 'Cap/Winsorize', desc: 'Cap values at threshold boundaries' },
  { value: 'null', label: 'Set to NULL', desc: 'Replace outliers with NULL' },
  { value: 'flag', label: 'Flag Only', desc: 'Add flag column, keep values' },
];

export const OutlierHandlerConfig = ({ data, onUpdate, availableColumns }: OutlierHandlerConfigProps) => {
  const config = data.config || {};

  const [mode, setMode] = useState<'global' | 'perColumn'>(
    (config.mode as 'global' | 'perColumn') || 'global'
  );
  const [globalMethod, setGlobalMethod] = useState<OutlierMethod>(
    (config.globalMethod as OutlierMethod) || 'iqr'
  );
  const [globalThreshold, setGlobalThreshold] = useState<number>(
    (config.globalThreshold as number) || 1.5
  );
  const [globalAction, setGlobalAction] = useState<OutlierAction>(
    (config.globalAction as OutlierAction) || 'cap'
  );
  const [flagColumn, setFlagColumn] = useState<string>(
    (config.flagColumn as string) || 'is_outlier'
  );
  const [columnConfigs, setColumnConfigs] = useState<OutlierColumnConfig[]>(
    (config.columnConfigs as OutlierColumnConfig[]) || []
  );

  // Filter to show only numeric columns
  const numericColumns = availableColumns.filter(
    col => ['integer', 'long', 'float', 'double', 'decimal', 'int', 'bigint', 'number', 'numeric'].some(
      t => col.dataType.toLowerCase().includes(t)
    )
  );

  const addColumnConfig = () => {
    setColumnConfigs([
      ...columnConfigs,
      { column: '', method: 'iqr', threshold: 1.5, action: 'cap' }
    ]);
  };

  const updateColumnConfig = (index: number, field: keyof OutlierColumnConfig, value: unknown) => {
    const newConfigs = [...columnConfigs];
    newConfigs[index] = { ...newConfigs[index], [field]: value };

    // Update default threshold when method changes
    if (field === 'method') {
      const methodInfo = OUTLIER_METHODS.find(m => m.value === value);
      if (methodInfo) {
        newConfigs[index].threshold = methodInfo.defaultThreshold;
      }
    }

    setColumnConfigs(newConfigs);
  };

  const removeColumnConfig = (index: number) => {
    setColumnConfigs(columnConfigs.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onUpdate({
      mode,
      globalMethod: mode === 'global' ? globalMethod : undefined,
      globalThreshold: mode === 'global' ? globalThreshold : undefined,
      globalAction: mode === 'global' ? globalAction : undefined,
      columnConfigs: mode === 'perColumn' ? columnConfigs.filter(c => c.column) : undefined,
      flagColumn: (globalAction === 'flag' || columnConfigs.some(c => c.action === 'flag')) ? flagColumn : undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="p-3 bg-orange-500/10 rounded border border-orange-500/30">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5" />
          <div>
            <p className="text-xs text-orange-300 font-medium">Outlier Handler</p>
            <p className="text-xs text-gray-400 mt-1">
              Detect and handle outliers in numeric columns using statistical methods.
            </p>
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Detection Mode</label>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('global')}
            className={`flex-1 px-3 py-2 text-xs rounded transition-colors ${
              mode === 'global' ? 'bg-accent text-white' : 'bg-panel text-gray-400 hover:bg-panel-light'
            }`}
          >
            Global Settings
          </button>
          <button
            onClick={() => setMode('perColumn')}
            className={`flex-1 px-3 py-2 text-xs rounded transition-colors ${
              mode === 'perColumn' ? 'bg-accent text-white' : 'bg-panel text-gray-400 hover:bg-panel-light'
            }`}
          >
            Per Column
          </button>
        </div>
      </div>

      {/* Global Mode Settings */}
      {mode === 'global' && (
        <div className="space-y-3 p-3 bg-canvas rounded border border-gray-700">
          {/* Method Selection */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Detection Method</label>
            <select
              value={globalMethod}
              onChange={(e) => {
                const method = e.target.value as OutlierMethod;
                setGlobalMethod(method);
                const methodInfo = OUTLIER_METHODS.find(m => m.value === method);
                if (methodInfo) setGlobalThreshold(methodInfo.defaultThreshold);
              }}
              className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none"
            >
              {OUTLIER_METHODS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <p className="text-[10px] text-gray-500 mt-1">
              {OUTLIER_METHODS.find(m => m.value === globalMethod)?.desc}
            </p>
          </div>

          {/* Threshold */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Threshold {globalMethod === 'percentile' ? '(%)' : ''}
            </label>
            <input
              type="number"
              value={globalThreshold}
              onChange={(e) => setGlobalThreshold(parseFloat(e.target.value))}
              step={globalMethod === 'percentile' ? 1 : 0.1}
              min={0}
              className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              {globalMethod === 'iqr' && 'Multiplier for IQR (1.5 = mild, 3 = extreme)'}
              {globalMethod === 'zscore' && 'Number of standard deviations (2 = 95%, 3 = 99.7%)'}
              {globalMethod === 'percentile' && 'Percentile cutoff (e.g., 5 = bottom/top 5%)'}
              {globalMethod === 'mad' && 'MAD multiplier (similar to z-score)'}
            </p>
          </div>

          {/* Action */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Action</label>
            <div className="grid grid-cols-2 gap-1">
              {OUTLIER_ACTIONS.map(a => (
                <button
                  key={a.value}
                  onClick={() => setGlobalAction(a.value)}
                  className={`px-2 py-1.5 text-xs rounded transition-colors ${
                    globalAction === a.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-panel text-gray-400 hover:bg-panel-light'
                  }`}
                  title={a.desc}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Flag Column Name */}
          {globalAction === 'flag' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Flag Column Name</label>
              <input
                type="text"
                value={flagColumn}
                onChange={(e) => setFlagColumn(e.target.value)}
                placeholder="is_outlier"
                className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none"
              />
            </div>
          )}
        </div>
      )}

      {/* Per Column Mode */}
      {mode === 'perColumn' && (
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
              <p className="text-xs text-gray-500">No column configurations</p>
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
                    {/* Column Selection */}
                    <select
                      value={cc.column}
                      onChange={(e) => updateColumnConfig(index, 'column', e.target.value)}
                      className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none"
                    >
                      <option value="">Select column</option>
                      {(numericColumns.length > 0 ? numericColumns : availableColumns).map(col => (
                        <option key={col.name} value={col.name}>
                          {col.name} ({col.dataType})
                        </option>
                      ))}
                    </select>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Method */}
                      <select
                        value={cc.method}
                        onChange={(e) => updateColumnConfig(index, 'method', e.target.value as OutlierMethod)}
                        className="px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none"
                      >
                        {OUTLIER_METHODS.map(m => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>

                      {/* Threshold */}
                      <input
                        type="number"
                        value={cc.threshold}
                        onChange={(e) => updateColumnConfig(index, 'threshold', parseFloat(e.target.value))}
                        step={0.1}
                        min={0}
                        placeholder="Threshold"
                        className="px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none"
                      />
                    </div>

                    {/* Action */}
                    <select
                      value={cc.action}
                      onChange={(e) => updateColumnConfig(index, 'action', e.target.value as OutlierAction)}
                      className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none"
                    >
                      {OUTLIER_ACTIONS.map(a => (
                        <option key={a.value} value={a.value}>{a.label}</option>
                      ))}
                    </select>

                    {/* Cap values for winsorization */}
                    {cc.action === 'cap' && (
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          value={cc.capMin || ''}
                          onChange={(e) => updateColumnConfig(index, 'capMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                          placeholder="Min cap (auto)"
                          className="px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white placeholder-gray-500 focus:border-accent focus:outline-none"
                        />
                        <input
                          type="number"
                          value={cc.capMax || ''}
                          onChange={(e) => updateColumnConfig(index, 'capMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                          placeholder="Max cap (auto)"
                          className="px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white placeholder-gray-500 focus:border-accent focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Flag Column Name (if any column uses flag action) */}
          {columnConfigs.some(c => c.action === 'flag') && (
            <div className="mt-3">
              <label className="block text-xs text-gray-400 mb-1">Flag Column Name</label>
              <input
                type="text"
                value={flagColumn}
                onChange={(e) => setFlagColumn(e.target.value)}
                placeholder="is_outlier"
                className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none"
              />
            </div>
          )}
        </div>
      )}

      {/* Method Reference */}
      <div className="p-3 bg-canvas rounded border border-gray-700">
        <div className="flex items-center gap-1 mb-2">
          <Info className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] text-gray-400">Method Reference</span>
        </div>
        <div className="text-[10px] text-gray-500 space-y-1">
          <div><span className="text-orange-400">IQR:</span> Q1 - 1.5*IQR to Q3 + 1.5*IQR (robust to skew)</div>
          <div><span className="text-orange-400">Z-Score:</span> Mean ± n*StdDev (assumes normal distribution)</div>
          <div><span className="text-orange-400">Percentile:</span> Below Pn or above P(100-n)</div>
          <div><span className="text-orange-400">MAD:</span> Median ± n*MAD (robust alternative to Z-score)</div>
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
