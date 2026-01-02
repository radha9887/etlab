import { useState } from 'react';
import { Save } from 'lucide-react';
import { MultiColumnSelector } from '../shared';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData } from '../../../types';

interface DescribeConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

const STATISTICS = [
  { value: 'count', label: 'Count', desc: 'Number of non-null values' },
  { value: 'mean', label: 'Mean', desc: 'Average value (numeric only)' },
  { value: 'stddev', label: 'Std Dev', desc: 'Standard deviation (numeric only)' },
  { value: 'min', label: 'Min', desc: 'Minimum value' },
  { value: 'max', label: 'Max', desc: 'Maximum value' },
  { value: '25%', label: '25th Percentile', desc: 'First quartile' },
  { value: '50%', label: '50th Percentile', desc: 'Median' },
  { value: '75%', label: '75th Percentile', desc: 'Third quartile' },
];

export const DescribeConfig = ({ data, onUpdate, availableColumns }: DescribeConfigProps) => {
  const [columns, setColumns] = useState((data.config?.columns as string) || '');
  const [statistics, setStatistics] = useState<string[]>(
    (data.config?.statistics as string[]) || ['count', 'mean', 'stddev', 'min', 'max']
  );

  const toggleStatistic = (stat: string) => {
    if (statistics.includes(stat)) {
      setStatistics(statistics.filter(s => s !== stat));
    } else {
      setStatistics([...statistics, stat]);
    }
  };

  // Filter to show numeric columns first
  const numericColumns = availableColumns.filter(
    col => ['int', 'long', 'float', 'double', 'decimal', 'integer', 'bigint', 'number'].some(t =>
      col.dataType.toLowerCase().includes(t)
    )
  );

  const handleSave = () => {
    onUpdate({
      columns,
      statistics
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-panel rounded border border-gray-700">
        <p className="text-xs text-gray-400">
          Generate summary statistics for numeric columns.
          Returns a transposed DataFrame with statistics as rows.
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Columns (optional)</label>
        <MultiColumnSelector
          value={columns}
          onChange={setColumns}
          columns={numericColumns.length > 0 ? numericColumns : availableColumns}
          placeholder="All numeric columns if empty"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          Leave empty to describe all numeric columns
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-2">Statistics to Include</label>
        <div className="grid grid-cols-2 gap-1">
          {STATISTICS.map(stat => (
            <label
              key={stat.value}
              className="flex items-center gap-2 px-2 py-1.5 bg-canvas rounded hover:bg-panel-light cursor-pointer"
            >
              <input
                type="checkbox"
                checked={statistics.includes(stat.value)}
                onChange={() => toggleStatistic(stat.value)}
                className="rounded"
              />
              <div>
                <span className="text-xs text-white">{stat.label}</span>
                <p className="text-[10px] text-gray-500">{stat.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="p-2 bg-canvas rounded border border-gray-700">
        <p className="text-[10px] text-gray-500 mb-2">
          <strong>Example Output:</strong>
        </p>
        <div className="text-[10px] text-gray-400 font-mono overflow-x-auto">
          <pre>{`| summary | col1   | col2   |
|---------|--------|--------|
| count   | 1000   | 1000   |
| mean    | 45.2   | 123.5  |
| stddev  | 12.3   | 45.6   |
| min     | 0      | 10     |
| max     | 100    | 500    |`}</pre>
        </div>
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
