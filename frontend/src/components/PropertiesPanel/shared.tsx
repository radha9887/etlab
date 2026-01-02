import { useState } from 'react';

// Column selector component that shows available columns
export interface ColumnSelectorProps {
  value: string;
  onChange: (value: string) => void;
  columns: { name: string; dataType: string; source: string }[];
  placeholder?: string;
  allowCustom?: boolean;
  className?: string;
}

export const ColumnSelector = ({ value, onChange, columns, placeholder = "Select column", allowCustom = true, className = "" }: ColumnSelectorProps) => {
  const [isCustom, setIsCustom] = useState(false);

  if (columns.length === 0 || isCustom) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none ${className}`}
        />
        {columns.length > 0 && (
          <button
            onClick={() => setIsCustom(false)}
            className="text-xs text-accent hover:text-accent-hover px-1"
            title="Show dropdown"
          >
            ▼
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <select
        value={value}
        onChange={(e) => {
          if (e.target.value === '__custom__') {
            setIsCustom(true);
          } else {
            onChange(e.target.value);
          }
        }}
        className={`flex-1 px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white ${className}`}
      >
        <option value="">{placeholder}</option>
        {/* Group by source */}
        {Array.from(new Set(columns.map(c => c.source))).map(source => (
          <optgroup key={source} label={source}>
            {columns.filter(c => c.source === source).map(col => (
              <option key={`${source}-${col.name}`} value={col.name}>
                {col.name} ({col.dataType})
              </option>
            ))}
          </optgroup>
        ))}
        {allowCustom && <option value="__custom__">✎ Enter custom...</option>}
      </select>
    </div>
  );
};

// Multi-column selector
export interface MultiColumnSelectorProps {
  value: string;
  onChange: (value: string) => void;
  columns: { name: string; dataType: string; source: string }[];
  placeholder?: string;
}

export const MultiColumnSelector = ({ value, onChange, columns, placeholder = "Select columns" }: MultiColumnSelectorProps) => {
  const selectedCols = value ? value.split(',').map(c => c.trim()).filter(Boolean) : [];

  const toggleColumn = (colName: string) => {
    if (selectedCols.includes(colName)) {
      onChange(selectedCols.filter(c => c !== colName).join(', '));
    } else {
      onChange([...selectedCols, colName].join(', '));
    }
  };

  if (columns.length === 0) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none"
      />
    );
  }

  return (
    <div className="space-y-1">
      <div className="max-h-32 overflow-y-auto bg-canvas border border-gray-600 rounded p-1">
        {columns.map(col => (
          <label
            key={`${col.source}-${col.name}`}
            className="flex items-center gap-2 px-2 py-1 hover:bg-panel-light rounded cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedCols.includes(col.name)}
              onChange={() => toggleColumn(col.name)}
              className="rounded"
            />
            <span className="text-xs text-white">{col.name}</span>
            <span className="text-[10px] text-gray-500">{col.dataType}</span>
          </label>
        ))}
      </div>
      {selectedCols.length > 0 && (
        <div className="text-[10px] text-gray-400">
          Selected: {selectedCols.join(', ')}
        </div>
      )}
    </div>
  );
};

// Available columns prop type
export interface WithAvailableColumns {
  availableColumns: { name: string; dataType: string; source: string }[];
}

// Re-export ExpressionBuilder
export { ExpressionBuilder } from './shared/ExpressionBuilder';

// Re-export shared components
export { FormField, inputStyles } from './shared/FormField';
export { ToggleGroup, ToggleButton } from './shared/ToggleGroup';
export { InfoBox, TipNote, WarningNote } from './shared/InfoBox';
export { ItemList, generateItemId } from './shared/ItemList';

// Re-export SqlPreview
export { SqlPreview, InlineSqlPreview } from './shared/SqlPreview';
export type { SqlPreviewProps, InlineSqlPreviewProps } from './shared/SqlPreview';

// Re-export code generators
export {
  generateFilterPreview,
  generateSelectPreview,
  generateGroupByPreview,
  generateJoinPreview,
  generateSortPreview,
  generateWindowPreview,
  generateAddColumnsPreview,
  generateSourcePreview,
  generateSinkPreview,
  generateDistinctPreview,
  generateDropDuplicatesPreview,
  generateLimitPreview,
  generateSamplePreview,
  generateDropNaPreview,
  generateFillNaPreview,
  generateRenamePreview,
  generateDropColumnsPreview,
  generateCachePreview,
  generateRepartitionPreview,
  generateCoalescePreview
} from './shared/codeGenerators';
