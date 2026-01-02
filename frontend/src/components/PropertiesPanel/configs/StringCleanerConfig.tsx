import { useState } from 'react';
import { Save, WrapText, Info } from 'lucide-react';
import { MultiColumnSelector } from '../shared';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData, StringOperation } from '../../../types';

interface StringCleanerConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

const STRING_OPERATIONS: { value: StringOperation; label: string; desc: string; example: string }[] = [
  { value: 'trim', label: 'Trim', desc: 'Remove leading/trailing whitespace', example: '"  hello  " → "hello"' },
  { value: 'lower', label: 'Lowercase', desc: 'Convert to lowercase', example: '"HELLO" → "hello"' },
  { value: 'upper', label: 'Uppercase', desc: 'Convert to uppercase', example: '"hello" → "HELLO"' },
  { value: 'title', label: 'Title Case', desc: 'Capitalize first letter of each word', example: '"hello world" → "Hello World"' },
  { value: 'removeWhitespace', label: 'Normalize Whitespace', desc: 'Replace multiple spaces with single space', example: '"a    b" → "a b"' },
  { value: 'removeNonAlpha', label: 'Remove Non-Alpha', desc: 'Keep only letters and spaces', example: '"abc123!" → "abc"' },
  { value: 'removeNonNumeric', label: 'Remove Non-Numeric', desc: 'Keep only digits', example: '"$1,234" → "1234"' },
  { value: 'removeSpecialChars', label: 'Remove Special Chars', desc: 'Keep letters, numbers, spaces', example: '"hello@world!" → "helloworld"' },
  { value: 'regex', label: 'Custom Regex', desc: 'Apply custom regex replacement', example: 'Pattern-based replace' },
];

export const StringCleanerConfig = ({ data, onUpdate, availableColumns }: StringCleanerConfigProps) => {
  const config = data.config || {};

  const [columns, setColumns] = useState<string>(
    (config.columns as string[])?.join(', ') || ''
  );
  const [operations, setOperations] = useState<StringOperation[]>(
    (config.operations as StringOperation[]) || []
  );
  const [regexPattern, setRegexPattern] = useState<string>(
    (config.regexPattern as string) || ''
  );
  const [regexReplacement, setRegexReplacement] = useState<string>(
    (config.regexReplacement as string) || ''
  );

  // Filter to show only string columns
  const stringColumns = availableColumns.filter(
    col => col.dataType.toLowerCase().includes('string') ||
           col.dataType.toLowerCase().includes('varchar') ||
           col.dataType.toLowerCase().includes('char') ||
           col.dataType.toLowerCase() === 'text'
  );

  const toggleOperation = (op: StringOperation) => {
    if (operations.includes(op)) {
      setOperations(operations.filter(o => o !== op));
    } else {
      setOperations([...operations, op]);
    }
  };

  const handleSave = () => {
    const colArray = columns
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    onUpdate({
      columns: colArray,
      operations,
      regexPattern: operations.includes('regex') ? regexPattern : undefined,
      regexReplacement: operations.includes('regex') ? regexReplacement : undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="p-3 bg-green-500/10 rounded border border-green-500/30">
        <div className="flex items-start gap-2">
          <WrapText className="w-4 h-4 text-green-400 mt-0.5" />
          <div>
            <p className="text-xs text-green-300 font-medium">String Cleaner</p>
            <p className="text-xs text-gray-400 mt-1">
              Clean and standardize text data. Operations are applied in the order selected.
            </p>
          </div>
        </div>
      </div>

      {/* Column Selection */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">
          Columns to Clean
        </label>
        <MultiColumnSelector
          value={columns}
          onChange={setColumns}
          columns={stringColumns.length > 0 ? stringColumns : availableColumns}
          placeholder="Select string columns"
        />
        {stringColumns.length > 0 && (
          <p className="text-[10px] text-gray-500 mt-1">
            Showing {stringColumns.length} string columns
          </p>
        )}
      </div>

      {/* Operations */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Cleaning Operations</label>
        <div className="space-y-1">
          {STRING_OPERATIONS.map(op => (
            <label
              key={op.value}
              className={`flex items-start gap-2 px-3 py-2 rounded cursor-pointer transition-colors ${
                operations.includes(op.value)
                  ? 'bg-accent/20 border border-accent/50'
                  : 'bg-canvas hover:bg-panel-light border border-transparent'
              }`}
            >
              <input
                type="checkbox"
                checked={operations.includes(op.value)}
                onChange={() => toggleOperation(op.value)}
                className="mt-0.5 rounded"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white">{op.label}</span>
                  <code className="text-[10px] text-gray-500">{op.example}</code>
                </div>
                <p className="text-[10px] text-gray-500">{op.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Regex Options */}
      {operations.includes('regex') && (
        <div className="p-3 bg-canvas rounded border border-gray-700 space-y-2">
          <label className="block text-xs text-gray-400">Regex Pattern</label>
          <input
            type="text"
            value={regexPattern}
            onChange={(e) => setRegexPattern(e.target.value)}
            placeholder="e.g., [^a-zA-Z0-9]"
            className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:border-accent focus:outline-none font-mono"
          />

          <label className="block text-xs text-gray-400">Replacement</label>
          <input
            type="text"
            value={regexReplacement}
            onChange={(e) => setRegexReplacement(e.target.value)}
            placeholder="Leave empty to remove matches"
            className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:border-accent focus:outline-none font-mono"
          />

          <p className="text-[10px] text-gray-500">
            Uses Python regex syntax. Common patterns:
            <br />• <code>\d+</code> - digits
            <br />• <code>\s+</code> - whitespace
            <br />• <code>[^a-zA-Z]</code> - non-letters
          </p>
        </div>
      )}

      {/* Order Info */}
      {operations.length > 1 && (
        <div className="p-3 bg-yellow-500/10 rounded border border-yellow-500/30">
          <div className="flex items-center gap-1 mb-1">
            <Info className="w-3 h-3 text-yellow-400" />
            <span className="text-[10px] text-yellow-300">Operation Order</span>
          </div>
          <p className="text-[10px] text-gray-400">
            Operations apply in order: {operations.map(o =>
              STRING_OPERATIONS.find(op => op.value === o)?.label
            ).join(' → ')}
          </p>
        </div>
      )}

      {/* Preview */}
      {operations.length > 0 && columns && (
        <div className="p-3 bg-canvas rounded border border-gray-700">
          <span className="text-[10px] text-gray-400">Example transformation:</span>
          <div className="mt-1 text-xs font-mono">
            <span className="text-gray-500">Input:</span>{' '}
            <span className="text-red-400">"  Hello WORLD 123!  "</span>
            <br />
            <span className="text-gray-500">Output:</span>{' '}
            <span className="text-green-400">
              {(() => {
                let result = '  Hello WORLD 123!  ';
                if (operations.includes('trim')) result = result.trim();
                if (operations.includes('lower')) result = result.toLowerCase();
                if (operations.includes('upper')) result = result.toUpperCase();
                if (operations.includes('removeNonAlpha')) result = result.replace(/[^a-zA-Z\s]/g, '');
                if (operations.includes('removeWhitespace')) result = result.replace(/\s+/g, ' ');
                return `"${result}"`;
              })()}
            </span>
          </div>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={columns.length === 0 || operations.length === 0}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
      >
        <Save className="w-4 h-4" /> Save Configuration
      </button>
    </div>
  );
};
