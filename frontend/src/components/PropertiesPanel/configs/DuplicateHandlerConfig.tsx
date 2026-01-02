import { useState } from 'react';
import { Save, Copy, Info } from 'lucide-react';
import { MultiColumnSelector } from '../shared';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData, DuplicateAction } from '../../../types';

interface DuplicateHandlerConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

const DUPLICATE_ACTIONS: { value: DuplicateAction; label: string; desc: string }[] = [
  { value: 'drop', label: 'Drop All Duplicates', desc: 'Remove all duplicate rows (keeps first by default)' },
  { value: 'keep_first', label: 'Keep First', desc: 'Keep only the first occurrence' },
  { value: 'keep_last', label: 'Keep Last', desc: 'Keep only the last occurrence' },
  { value: 'flag', label: 'Flag Duplicates', desc: 'Add a column to identify duplicates' },
];

const FUZZY_ALGORITHMS = [
  { value: 'levenshtein', label: 'Levenshtein Distance', desc: 'Edit distance between strings' },
  { value: 'soundex', label: 'Soundex', desc: 'Phonetic matching for names' },
  { value: 'jaccard', label: 'Jaccard Similarity', desc: 'Token-based similarity' },
];

export const DuplicateHandlerConfig = ({ data, onUpdate, availableColumns }: DuplicateHandlerConfigProps) => {
  const config = data.config || {};

  const [mode, setMode] = useState<'exact' | 'fuzzy'>(
    (config.mode as 'exact' | 'fuzzy') || 'exact'
  );
  const [columns, setColumns] = useState<string>(
    (config.columns as string[])?.join(', ') || ''
  );
  const [action, setAction] = useState<DuplicateAction>(
    (config.action as DuplicateAction) || 'drop'
  );
  const [flagColumn, setFlagColumn] = useState<string>(
    (config.flagColumn as string) || 'is_duplicate'
  );
  const [fuzzyThreshold, setFuzzyThreshold] = useState<string>(
    String(config.fuzzyThreshold ?? 0.8)
  );
  const [fuzzyAlgorithm, setFuzzyAlgorithm] = useState<string>(
    (config.fuzzyAlgorithm as string) || 'levenshtein'
  );

  const handleSave = () => {
    const colArray = columns
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    onUpdate({
      mode,
      columns: colArray.length > 0 ? colArray : undefined,
      action,
      flagColumn: action === 'flag' ? flagColumn : undefined,
      fuzzyThreshold: mode === 'fuzzy' ? parseFloat(fuzzyThreshold) : undefined,
      fuzzyAlgorithm: mode === 'fuzzy' ? fuzzyAlgorithm : undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="p-3 bg-purple-500/10 rounded border border-purple-500/30">
        <div className="flex items-start gap-2">
          <Copy className="w-4 h-4 text-purple-400 mt-0.5" />
          <div>
            <p className="text-xs text-purple-300 font-medium">Duplicate Handler</p>
            <p className="text-xs text-gray-400 mt-1">
              Identify and handle duplicate rows using exact or fuzzy matching.
            </p>
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Matching Mode</label>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('exact')}
            className={`flex-1 px-3 py-2 text-xs rounded transition-colors ${
              mode === 'exact'
                ? 'bg-accent text-white'
                : 'bg-canvas text-gray-400 hover:bg-panel-light'
            }`}
          >
            Exact Match
          </button>
          <button
            onClick={() => setMode('fuzzy')}
            className={`flex-1 px-3 py-2 text-xs rounded transition-colors ${
              mode === 'fuzzy'
                ? 'bg-accent text-white'
                : 'bg-canvas text-gray-400 hover:bg-panel-light'
            }`}
          >
            Fuzzy Match
          </button>
        </div>
        <p className="text-[10px] text-gray-500 mt-1">
          {mode === 'exact'
            ? 'Match rows with identical values'
            : 'Match similar values using string similarity'}
        </p>
      </div>

      {/* Column Selection */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">
          Columns to Check
        </label>
        <MultiColumnSelector
          value={columns}
          onChange={setColumns}
          columns={availableColumns}
          placeholder="All columns if empty"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          Leave empty to check all columns for duplicates
        </p>
      </div>

      {/* Action Selection */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Action</label>
        <div className="space-y-1">
          {DUPLICATE_ACTIONS.map(a => (
            <label
              key={a.value}
              className={`flex items-start gap-2 px-3 py-2 rounded cursor-pointer transition-colors ${
                action === a.value
                  ? 'bg-accent/20 border border-accent/50'
                  : 'bg-canvas hover:bg-panel-light border border-transparent'
              }`}
            >
              <input
                type="radio"
                name="action"
                value={a.value}
                checked={action === a.value}
                onChange={() => setAction(a.value)}
                className="mt-0.5"
              />
              <div>
                <span className="text-xs text-white">{a.label}</span>
                <p className="text-[10px] text-gray-500">{a.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Flag Column Name */}
      {action === 'flag' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Flag Column Name</label>
          <input
            type="text"
            value={flagColumn}
            onChange={(e) => setFlagColumn(e.target.value)}
            placeholder="is_duplicate"
            className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:border-accent focus:outline-none"
          />
        </div>
      )}

      {/* Fuzzy Options */}
      {mode === 'fuzzy' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Similarity Algorithm
            </label>
            <select
              value={fuzzyAlgorithm}
              onChange={(e) => setFuzzyAlgorithm(e.target.value)}
              className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-sm text-white focus:border-accent focus:outline-none"
            >
              {FUZZY_ALGORITHMS.map(alg => (
                <option key={alg.value} value={alg.value}>
                  {alg.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Similarity Threshold: {fuzzyThreshold}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={fuzzyThreshold}
              onChange={(e) => setFuzzyThreshold(e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>0 (loose)</span>
              <span>1 (strict)</span>
            </div>
          </div>

          <div className="p-3 bg-yellow-500/10 rounded border border-yellow-500/30">
            <p className="text-[10px] text-yellow-300">
              <strong>Note:</strong> Fuzzy matching is computationally expensive.
              Consider limiting columns and using sampling for large datasets.
            </p>
          </div>
        </>
      )}

      {/* Example Output */}
      <div className="p-3 bg-canvas rounded border border-gray-700">
        <div className="flex items-center gap-1 mb-2">
          <Info className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] text-gray-400">Example</span>
        </div>
        <div className="text-[10px] text-gray-400 font-mono">
          {action === 'flag' ? (
            <pre>{`| id | name  | ${flagColumn} |
|----|-------|${'-'.repeat(flagColumn.length + 2)}|
| 1  | John  | false${' '.repeat(flagColumn.length - 4)} |
| 2  | John  | true${' '.repeat(flagColumn.length - 3)} |
| 3  | Alice | false${' '.repeat(flagColumn.length - 4)} |`}</pre>
          ) : (
            <pre>{`Before: 1000 rows
After:  850 rows (150 duplicates ${
              action === 'drop' ? 'removed' :
              action === 'keep_first' ? 'removed (kept first)' :
              'removed (kept last)'
            })`}</pre>
          )}
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
