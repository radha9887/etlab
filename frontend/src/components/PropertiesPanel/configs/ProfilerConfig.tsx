import { useState } from 'react';
import { Save, ScanSearch, Info } from 'lucide-react';
import { MultiColumnSelector } from '../shared';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData } from '../../../types';

interface ProfilerConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

const PROFILE_OPTIONS = [
  {
    key: 'includeStats',
    label: 'Basic Statistics',
    desc: 'Count, mean, std, min, max, quartiles',
    default: true
  },
  {
    key: 'includeMissing',
    label: 'Missing Value Analysis',
    desc: 'Null counts, null percentages per column',
    default: true
  },
  {
    key: 'includeUnique',
    label: 'Uniqueness Analysis',
    desc: 'Distinct counts, cardinality ratios',
    default: true
  },
  {
    key: 'includeDistribution',
    label: 'Distribution Analysis',
    desc: 'Histograms, top values, frequency counts',
    default: false
  },
  {
    key: 'includeCorrelation',
    label: 'Correlation Matrix',
    desc: 'Pairwise correlations for numeric columns',
    default: false
  },
];

export const ProfilerConfig = ({ data, onUpdate, availableColumns }: ProfilerConfigProps) => {
  const config = data.config || {};

  const [columns, setColumns] = useState<string>((config.columns as string[])?.join(', ') || '');
  const [includeStats, setIncludeStats] = useState(config.includeStats !== false);
  const [includeMissing, setIncludeMissing] = useState(config.includeMissing !== false);
  const [includeUnique, setIncludeUnique] = useState(config.includeUnique !== false);
  const [includeDistribution, setIncludeDistribution] = useState(config.includeDistribution === true);
  const [includeCorrelation, setIncludeCorrelation] = useState(config.includeCorrelation === true);
  const [sampleSize, setSampleSize] = useState<string>(
    config.sampleSize ? String(config.sampleSize) : ''
  );

  const options = {
    includeStats: { state: includeStats, setter: setIncludeStats },
    includeMissing: { state: includeMissing, setter: setIncludeMissing },
    includeUnique: { state: includeUnique, setter: setIncludeUnique },
    includeDistribution: { state: includeDistribution, setter: setIncludeDistribution },
    includeCorrelation: { state: includeCorrelation, setter: setIncludeCorrelation },
  };

  const handleSave = () => {
    const colArray = columns
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    onUpdate({
      columns: colArray.length > 0 ? colArray : undefined,
      includeStats,
      includeMissing,
      includeUnique,
      includeDistribution,
      includeCorrelation,
      sampleSize: sampleSize ? parseInt(sampleSize, 10) : undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="p-3 bg-blue-500/10 rounded border border-blue-500/30">
        <div className="flex items-start gap-2">
          <ScanSearch className="w-4 h-4 text-blue-400 mt-0.5" />
          <div>
            <p className="text-xs text-blue-300 font-medium">Data Profiler</p>
            <p className="text-xs text-gray-400 mt-1">
              Analyze your data to understand distributions, quality issues,
              and patterns. Results are generated as a profiling report.
            </p>
          </div>
        </div>
      </div>

      {/* Column Selection */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">
          Columns to Profile
        </label>
        <MultiColumnSelector
          value={columns}
          onChange={setColumns}
          columns={availableColumns}
          placeholder="All columns if empty"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          Leave empty to profile all columns
        </p>
      </div>

      {/* Profile Options */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Profile Options</label>
        <div className="space-y-1">
          {PROFILE_OPTIONS.map(opt => {
            const { state, setter } = options[opt.key as keyof typeof options];
            return (
              <label
                key={opt.key}
                className="flex items-start gap-2 px-3 py-2 bg-canvas rounded hover:bg-panel-light cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={state}
                  onChange={(e) => setter(e.target.checked)}
                  className="mt-0.5 rounded"
                />
                <div>
                  <span className="text-xs text-white">{opt.label}</span>
                  <p className="text-[10px] text-gray-500">{opt.desc}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Sample Size */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">
          Sample Size (Optional)
        </label>
        <input
          type="number"
          value={sampleSize}
          onChange={(e) => setSampleSize(e.target.value)}
          placeholder="No sampling (use all rows)"
          className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:border-accent focus:outline-none"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          For large datasets, sample N rows to speed up profiling
        </p>
      </div>

      {/* Output Preview */}
      <div className="p-3 bg-canvas rounded border border-gray-700">
        <div className="flex items-center gap-1 mb-2">
          <Info className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] text-gray-400">Generated Output</span>
        </div>
        <div className="text-[10px] text-gray-400 font-mono space-y-1">
          {includeStats && <div>• Basic statistics DataFrame</div>}
          {includeMissing && <div>• Missing values summary</div>}
          {includeUnique && <div>• Cardinality analysis</div>}
          {includeDistribution && <div>• Value distributions</div>}
          {includeCorrelation && <div>• Correlation matrix</div>}
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
