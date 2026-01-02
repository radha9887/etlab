import { useState } from 'react';
import { Save, FileType, Plus, X, Info } from 'lucide-react';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData } from '../../../types';

interface TypeFixerConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

interface ColumnTypeConfig {
  column: string;
  targetType: string;
  dateFormat?: string;
  nullOnError: boolean;
}

const SPARK_TYPES = [
  { value: 'string', label: 'String', desc: 'Text data' },
  { value: 'integer', label: 'Integer', desc: '32-bit signed integer' },
  { value: 'long', label: 'Long', desc: '64-bit signed integer' },
  { value: 'float', label: 'Float', desc: '32-bit floating point' },
  { value: 'double', label: 'Double', desc: '64-bit floating point' },
  { value: 'boolean', label: 'Boolean', desc: 'True/False' },
  { value: 'date', label: 'Date', desc: 'Date without time' },
  { value: 'timestamp', label: 'Timestamp', desc: 'Date with time' },
  { value: 'decimal(10,2)', label: 'Decimal', desc: 'Precise decimal numbers' },
  { value: 'binary', label: 'Binary', desc: 'Binary data' },
];

const DATE_FORMATS = [
  { value: 'yyyy-MM-dd', label: 'yyyy-MM-dd (2024-01-15)' },
  { value: 'MM/dd/yyyy', label: 'MM/dd/yyyy (01/15/2024)' },
  { value: 'dd/MM/yyyy', label: 'dd/MM/yyyy (15/01/2024)' },
  { value: 'yyyy-MM-dd HH:mm:ss', label: 'yyyy-MM-dd HH:mm:ss' },
  { value: 'MM/dd/yyyy HH:mm:ss', label: 'MM/dd/yyyy HH:mm:ss' },
  { value: 'yyyyMMdd', label: 'yyyyMMdd (20240115)' },
  { value: 'custom', label: 'Custom format...' },
];

export const TypeFixerConfig = ({ data, onUpdate, availableColumns }: TypeFixerConfigProps) => {
  const config = data.config || {};

  const [columnConfigs, setColumnConfigs] = useState<ColumnTypeConfig[]>(
    (config.columnConfigs as ColumnTypeConfig[]) || []
  );
  const [autoDetect, setAutoDetect] = useState(config.autoDetect === true);

  const addColumnConfig = () => {
    setColumnConfigs([
      ...columnConfigs,
      { column: '', targetType: 'string', nullOnError: true }
    ]);
  };

  const updateColumnConfig = (index: number, field: keyof ColumnTypeConfig, value: unknown) => {
    const newConfigs = [...columnConfigs];
    newConfigs[index] = { ...newConfigs[index], [field]: value };
    setColumnConfigs(newConfigs);
  };

  const removeColumnConfig = (index: number) => {
    setColumnConfigs(columnConfigs.filter((_, i) => i !== index));
  };

  const needsDateFormat = (type: string) => {
    return type === 'date' || type === 'timestamp';
  };

  const handleSave = () => {
    onUpdate({
      autoDetect,
      columnConfigs: columnConfigs.filter(c => c.column && c.targetType),
    });
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="p-3 bg-cyan-500/10 rounded border border-cyan-500/30">
        <div className="flex items-start gap-2">
          <FileType className="w-4 h-4 text-cyan-400 mt-0.5" />
          <div>
            <p className="text-xs text-cyan-300 font-medium">Type Fixer</p>
            <p className="text-xs text-gray-400 mt-1">
              Convert columns to correct data types. Essential for ensuring
              data consistency and enabling type-specific operations.
            </p>
          </div>
        </div>
      </div>

      {/* Auto Detect Option */}
      <label className="flex items-center gap-2 px-3 py-2 bg-canvas rounded cursor-pointer hover:bg-panel-light">
        <input
          type="checkbox"
          checked={autoDetect}
          onChange={(e) => setAutoDetect(e.target.checked)}
          className="rounded"
        />
        <div>
          <span className="text-xs text-white">Auto-detect types</span>
          <p className="text-[10px] text-gray-500">Attempt to infer correct types automatically</p>
        </div>
      </label>

      {/* Column Configurations */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-400">Column Type Conversions</label>
          <button
            onClick={addColumnConfig}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-accent/20 text-accent rounded hover:bg-accent/30 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Column
          </button>
        </div>

        {columnConfigs.length === 0 ? (
          <div className="p-4 bg-canvas rounded border border-gray-700 text-center">
            <p className="text-xs text-gray-500">No type conversions configured</p>
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
                  <span className="text-[10px] text-gray-500">Conversion {index + 1}</span>
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
                    {availableColumns.map(col => (
                      <option key={col.name} value={col.name}>
                        {col.name} ({col.dataType})
                      </option>
                    ))}
                  </select>

                  {/* Target Type */}
                  <select
                    value={cc.targetType}
                    onChange={(e) => updateColumnConfig(index, 'targetType', e.target.value)}
                    className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none"
                  >
                    {SPARK_TYPES.map(t => (
                      <option key={t.value} value={t.value}>
                        {t.label} - {t.desc}
                      </option>
                    ))}
                  </select>

                  {/* Date Format (if needed) */}
                  {needsDateFormat(cc.targetType) && (
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">Date Format</label>
                      <select
                        value={cc.dateFormat || 'yyyy-MM-dd'}
                        onChange={(e) => updateColumnConfig(index, 'dateFormat', e.target.value)}
                        className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none"
                      >
                        {DATE_FORMATS.map(f => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </select>
                      {cc.dateFormat === 'custom' && (
                        <input
                          type="text"
                          placeholder="Enter custom format (e.g., dd-MMM-yyyy)"
                          onChange={(e) => updateColumnConfig(index, 'dateFormat', e.target.value)}
                          className="w-full mt-1 px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white placeholder-gray-500 focus:border-accent focus:outline-none"
                        />
                      )}
                    </div>
                  )}

                  {/* Null on Error */}
                  <label className="flex items-center gap-2 text-[10px] text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cc.nullOnError}
                      onChange={(e) => updateColumnConfig(index, 'nullOnError', e.target.checked)}
                      className="rounded"
                    />
                    Set NULL on conversion error
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Type Reference */}
      <div className="p-3 bg-canvas rounded border border-gray-700">
        <div className="flex items-center gap-1 mb-2">
          <Info className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] text-gray-400">Common Conversions</span>
        </div>
        <div className="text-[10px] text-gray-500 space-y-1">
          <div><code className="text-cyan-400">string → integer</code>: "123" → 123</div>
          <div><code className="text-cyan-400">string → date</code>: "2024-01-15" → date</div>
          <div><code className="text-cyan-400">double → integer</code>: 3.7 → 3 (truncated)</div>
          <div><code className="text-cyan-400">boolean → integer</code>: true → 1</div>
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
