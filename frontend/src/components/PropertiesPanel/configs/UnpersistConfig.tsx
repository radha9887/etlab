import { useState } from 'react';
import { Save, Trash2, Info } from 'lucide-react';
import type { TransformNodeData } from '../../../types';

interface UnpersistConfigProps {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

export const UnpersistConfig = ({ data, onUpdate }: UnpersistConfigProps) => {
  const config = data.config || {};

  const [blocking, setBlocking] = useState<boolean>(
    config.blocking !== false // Default to true
  );

  const handleSave = () => {
    onUpdate({
      blocking,
    });
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="p-3 bg-red-500/10 rounded border border-red-500/30">
        <div className="flex items-start gap-2">
          <Trash2 className="w-4 h-4 text-red-400 mt-0.5" />
          <div>
            <p className="text-xs text-red-300 font-medium">Unpersist</p>
            <p className="text-xs text-gray-400 mt-1">
              Removes a DataFrame from cache/storage. Use after a cached DataFrame is no longer needed to free memory.
            </p>
          </div>
        </div>
      </div>

      {/* Blocking Mode */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Execution Mode</label>
        <div className="space-y-2">
          <button
            onClick={() => setBlocking(true)}
            className={`w-full p-3 text-left rounded border transition-colors ${
              blocking
                ? 'bg-red-500/20 border-red-500/50'
                : 'bg-panel border-gray-600 hover:border-gray-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">⏳</span>
              <span className="text-sm text-white font-medium">Blocking</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-1 ml-7">
              Wait for unpersist to complete before continuing. Ensures memory is freed.
            </p>
          </button>

          <button
            onClick={() => setBlocking(false)}
            className={`w-full p-3 text-left rounded border transition-colors ${
              !blocking
                ? 'bg-red-500/20 border-red-500/50'
                : 'bg-panel border-gray-600 hover:border-gray-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <span className="text-sm text-white font-medium">Non-blocking</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-1 ml-7">
              Return immediately, unpersist happens asynchronously. Faster but no guarantee.
            </p>
          </button>
        </div>
      </div>

      {/* Best Practices */}
      <div className="p-3 bg-canvas rounded border border-gray-700">
        <div className="flex items-center gap-1 mb-2">
          <Info className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] text-gray-400">Best Practices</span>
        </div>
        <ul className="text-[10px] text-gray-500 space-y-1 list-disc list-inside">
          <li>Always unpersist cached DataFrames when no longer needed</li>
          <li>Use blocking mode when memory is critical</li>
          <li>Place unpersist after the last use of cached DataFrame</li>
          <li>Unpersist in reverse order of caching</li>
        </ul>
      </div>

      {/* Memory Warning */}
      <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
        <p className="text-xs text-yellow-400">
          Failing to unpersist can lead to memory pressure and executor failures in long-running jobs.
        </p>
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
