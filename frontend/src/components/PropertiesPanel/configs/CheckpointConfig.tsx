import { useState } from 'react';
import { Save, GitBranch, Info } from 'lucide-react';
import type { TransformNodeData } from '../../../types';

interface CheckpointConfigProps {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

const CHECKPOINT_TYPES = [
  {
    value: 'reliable',
    label: 'Reliable Checkpoint',
    desc: 'Saves to configured checkpoint directory (HDFS/S3). Survives driver failure.',
    icon: '💾'
  },
  {
    value: 'local',
    label: 'Local Checkpoint',
    desc: 'Saves to local executor storage. Faster but not fault-tolerant.',
    icon: '⚡'
  },
];

export const CheckpointConfig = ({ data, onUpdate }: CheckpointConfigProps) => {
  const config = data.config || {};

  const [checkpointType, setCheckpointType] = useState<'reliable' | 'local'>(
    (config.checkpointType as 'reliable' | 'local') || 'reliable'
  );
  const [eager, setEager] = useState<boolean>(
    config.eager !== false // Default to true
  );

  const handleSave = () => {
    onUpdate({
      checkpointType,
      eager,
    });
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="p-3 bg-blue-500/10 rounded border border-blue-500/30">
        <div className="flex items-start gap-2">
          <GitBranch className="w-4 h-4 text-blue-400 mt-0.5" />
          <div>
            <p className="text-xs text-blue-300 font-medium">Checkpoint</p>
            <p className="text-xs text-gray-400 mt-1">
              Truncates the logical plan by saving to storage. Useful for breaking long lineage chains and iterative algorithms.
            </p>
          </div>
        </div>
      </div>

      {/* Checkpoint Type */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Checkpoint Type</label>
        <div className="space-y-2">
          {CHECKPOINT_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setCheckpointType(type.value as 'reliable' | 'local')}
              className={`w-full p-3 text-left rounded border transition-colors ${
                checkpointType === type.value
                  ? 'bg-blue-500/20 border-blue-500/50'
                  : 'bg-panel border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{type.icon}</span>
                <span className="text-sm text-white font-medium">{type.label}</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1 ml-7">{type.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Eager Option */}
      <label className="flex items-center gap-3 p-3 bg-canvas rounded border border-gray-700 cursor-pointer hover:bg-panel-light">
        <input
          type="checkbox"
          checked={eager}
          onChange={(e) => setEager(e.target.checked)}
          className="rounded"
        />
        <div>
          <span className="text-sm text-white">Eager Checkpoint</span>
          <p className="text-[10px] text-gray-500">
            Materialize immediately. If unchecked, checkpoint happens lazily on first action.
          </p>
        </div>
      </label>

      {/* Recommendations */}
      <div className="p-3 bg-canvas rounded border border-gray-700">
        <div className="flex items-center gap-1 mb-2">
          <Info className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] text-gray-400">When to use</span>
        </div>
        <ul className="text-[10px] text-gray-500 space-y-1 list-disc list-inside">
          <li>After complex transformations to avoid recomputation</li>
          <li>In iterative ML algorithms (e.g., every 10 iterations)</li>
          <li>When lineage becomes too long (100+ transformations)</li>
          <li>Before a transformation that might fail</li>
        </ul>
      </div>

      {/* Warning for reliable checkpoint */}
      {checkpointType === 'reliable' && (
        <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
          <p className="text-xs text-yellow-400">
            Requires <code className="bg-panel px-1 rounded">spark.sparkContext.setCheckpointDir()</code> to be configured.
          </p>
        </div>
      )}

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
