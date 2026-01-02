import { useState } from 'react';
import { Save, FileSearch, Info } from 'lucide-react';
import type { TransformNodeData } from '../../../types';

interface ExplainConfigProps {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

const EXPLAIN_MODES = [
  {
    value: 'simple',
    label: 'Simple',
    desc: 'Physical plan only. Quick overview of execution.',
    spark: 'All versions',
  },
  {
    value: 'extended',
    label: 'Extended',
    desc: 'Parsed, analyzed, optimized, and physical plans.',
    spark: 'All versions',
  },
  {
    value: 'codegen',
    label: 'Codegen',
    desc: 'Physical plan plus generated Java code.',
    spark: 'All versions',
  },
  {
    value: 'cost',
    label: 'Cost',
    desc: 'Physical plan with cost-based optimization info.',
    spark: 'Spark 3.0+',
  },
  {
    value: 'formatted',
    label: 'Formatted',
    desc: 'Human-readable formatted plan with node details.',
    spark: 'Spark 3.0+',
  },
];

export const ExplainConfig = ({ data, onUpdate }: ExplainConfigProps) => {
  const config = data.config || {};

  const [mode, setMode] = useState<string>(
    (config.mode as string) || 'formatted'
  );

  const handleSave = () => {
    onUpdate({
      mode,
    });
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="p-3 bg-purple-500/10 rounded border border-purple-500/30">
        <div className="flex items-start gap-2">
          <FileSearch className="w-4 h-4 text-purple-400 mt-0.5" />
          <div>
            <p className="text-xs text-purple-300 font-medium">Explain Plan</p>
            <p className="text-xs text-gray-400 mt-1">
              Display the execution plan for debugging and optimization analysis. Does not execute the query.
            </p>
          </div>
        </div>
      </div>

      {/* Explain Mode */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Explain Mode</label>
        <div className="space-y-2">
          {EXPLAIN_MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`w-full p-3 text-left rounded border transition-colors ${
                mode === m.value
                  ? 'bg-purple-500/20 border-purple-500/50'
                  : 'bg-panel border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-white font-medium">{m.label}</span>
                <span className="text-[10px] text-gray-500 bg-panel px-2 py-0.5 rounded">
                  {m.spark}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* What to Look For */}
      <div className="p-3 bg-canvas rounded border border-gray-700">
        <div className="flex items-center gap-1 mb-2">
          <Info className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] text-gray-400">What to look for in plans</span>
        </div>
        <div className="text-[10px] text-gray-500 space-y-2">
          <div>
            <span className="text-yellow-400">Exchange</span> - Shuffle operation (expensive)
          </div>
          <div>
            <span className="text-green-400">BroadcastHashJoin</span> - Efficient broadcast join
          </div>
          <div>
            <span className="text-blue-400">SortMergeJoin</span> - Shuffle-based join
          </div>
          <div>
            <span className="text-red-400">CartesianProduct</span> - Cross join (very expensive)
          </div>
          <div>
            <span className="text-purple-400">Filter/Project</span> - Predicate pushdown check
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="p-3 bg-panel rounded border border-gray-700">
        <p className="text-[10px] text-gray-400 mb-2">Generated Code:</p>
        <code className="text-xs text-green-400 font-mono">
          {mode === 'simple' && 'df.explain()'}
          {mode !== 'simple' && `df.explain(mode="${mode}")`}
        </code>
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
