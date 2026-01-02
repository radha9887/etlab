import { useState } from 'react';
import { Save, FileDigit, Plus, X, Info } from 'lucide-react';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData, FormatType } from '../../../types';

interface FormatStandardizerConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

interface ColumnFormatConfig {
  column: string;
  formatType: FormatType;
  targetFormat?: string;
  countryCode?: string;
}

const FORMAT_TYPES: { value: FormatType; label: string; desc: string; example: string }[] = [
  { value: 'phone', label: 'Phone Number', desc: 'Standardize phone numbers', example: '(555) 123-4567 → +1-555-123-4567' },
  { value: 'email', label: 'Email', desc: 'Normalize email addresses', example: 'John.Doe@GMAIL.COM → john.doe@gmail.com' },
  { value: 'date', label: 'Date', desc: 'Standardize date formats', example: '01/15/2024 → 2024-01-15' },
  { value: 'currency', label: 'Currency', desc: 'Normalize currency values', example: '$1,234.56 → 1234.56' },
  { value: 'address', label: 'Address', desc: 'Standardize address format', example: 'st. → Street, ave. → Avenue' },
  { value: 'ssn', label: 'SSN', desc: 'Format Social Security Numbers', example: '123456789 → 123-45-6789' },
];

const PHONE_FORMATS = [
  { value: 'E164', label: 'E.164 (+15551234567)' },
  { value: 'NATIONAL', label: 'National ((555) 123-4567)' },
  { value: 'INTERNATIONAL', label: 'International (+1 555-123-4567)' },
  { value: 'DIGITS_ONLY', label: 'Digits Only (5551234567)' },
];

const DATE_OUTPUT_FORMATS = [
  { value: 'yyyy-MM-dd', label: 'ISO (2024-01-15)' },
  { value: 'MM/dd/yyyy', label: 'US (01/15/2024)' },
  { value: 'dd/MM/yyyy', label: 'EU (15/01/2024)' },
  { value: 'yyyy-MM-dd HH:mm:ss', label: 'ISO DateTime' },
  { value: 'MMM dd, yyyy', label: 'Readable (Jan 15, 2024)' },
];

const COUNTRY_CODES = [
  { value: 'US', label: 'United States (+1)' },
  { value: 'UK', label: 'United Kingdom (+44)' },
  { value: 'CA', label: 'Canada (+1)' },
  { value: 'AU', label: 'Australia (+61)' },
  { value: 'IN', label: 'India (+91)' },
  { value: 'DE', label: 'Germany (+49)' },
  { value: 'FR', label: 'France (+33)' },
];

export const FormatStandardizerConfig = ({ data, onUpdate, availableColumns }: FormatStandardizerConfigProps) => {
  const config = data.config || {};

  const [columnConfigs, setColumnConfigs] = useState<ColumnFormatConfig[]>(
    (config.columns as ColumnFormatConfig[]) || []
  );

  const addColumnConfig = () => {
    setColumnConfigs([
      ...columnConfigs,
      { column: '', formatType: 'phone', targetFormat: undefined, countryCode: 'US' }
    ]);
  };

  const updateColumnConfig = (index: number, field: keyof ColumnFormatConfig, value: unknown) => {
    const newConfigs = [...columnConfigs];
    newConfigs[index] = { ...newConfigs[index], [field]: value };
    setColumnConfigs(newConfigs);
  };

  const removeColumnConfig = (index: number) => {
    setColumnConfigs(columnConfigs.filter((_, i) => i !== index));
  };

  const getFormatOptions = (formatType: FormatType) => {
    switch (formatType) {
      case 'phone':
        return PHONE_FORMATS;
      case 'date':
        return DATE_OUTPUT_FORMATS;
      default:
        return null;
    }
  };

  const handleSave = () => {
    onUpdate({
      columns: columnConfigs.filter(c => c.column && c.formatType),
    });
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="p-3 bg-indigo-500/10 rounded border border-indigo-500/30">
        <div className="flex items-start gap-2">
          <FileDigit className="w-4 h-4 text-indigo-400 mt-0.5" />
          <div>
            <p className="text-xs text-indigo-300 font-medium">Format Standardizer</p>
            <p className="text-xs text-gray-400 mt-1">
              Standardize common data formats like phone numbers, emails,
              dates, and addresses to a consistent format.
            </p>
          </div>
        </div>
      </div>

      {/* Column Configurations */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-400">Format Conversions</label>
          <button
            onClick={addColumnConfig}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-accent/20 text-accent rounded hover:bg-accent/30 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Column
          </button>
        </div>

        {columnConfigs.length === 0 ? (
          <div className="p-4 bg-canvas rounded border border-gray-700 text-center">
            <p className="text-xs text-gray-500">No format standardizations configured</p>
            <button
              onClick={addColumnConfig}
              className="mt-2 text-xs text-accent hover:text-accent-hover"
            >
              + Add your first column
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {columnConfigs.map((cc, index) => {
              const formatInfo = FORMAT_TYPES.find(f => f.value === cc.formatType);
              const formatOptions = getFormatOptions(cc.formatType);

              return (
                <div key={index} className="p-3 bg-canvas rounded border border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[10px] text-gray-500">Format {index + 1}</span>
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

                    {/* Format Type */}
                    <select
                      value={cc.formatType}
                      onChange={(e) => updateColumnConfig(index, 'formatType', e.target.value as FormatType)}
                      className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none"
                    >
                      {FORMAT_TYPES.map(f => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>

                    {/* Format-specific example */}
                    {formatInfo && (
                      <p className="text-[10px] text-gray-500">
                        Example: <code className="text-indigo-400">{formatInfo.example}</code>
                      </p>
                    )}

                    {/* Target Format (if applicable) */}
                    {formatOptions && (
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">Output Format</label>
                        <select
                          value={cc.targetFormat || formatOptions[0].value}
                          onChange={(e) => updateColumnConfig(index, 'targetFormat', e.target.value)}
                          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none"
                        >
                          {formatOptions.map(f => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Country Code (for phone) */}
                    {cc.formatType === 'phone' && (
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">Default Country</label>
                        <select
                          value={cc.countryCode || 'US'}
                          onChange={(e) => updateColumnConfig(index, 'countryCode', e.target.value)}
                          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none"
                        >
                          {COUNTRY_CODES.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Format Reference */}
      <div className="p-3 bg-canvas rounded border border-gray-700">
        <div className="flex items-center gap-1 mb-2">
          <Info className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] text-gray-400">Supported Formats</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          {FORMAT_TYPES.map(f => (
            <div key={f.value} className="text-gray-500">
              <span className="text-indigo-400">{f.label}:</span> {f.desc}
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={columnConfigs.length === 0 || !columnConfigs.some(c => c.column)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
      >
        <Save className="w-4 h-4" /> Save Configuration
      </button>
    </div>
  );
};
