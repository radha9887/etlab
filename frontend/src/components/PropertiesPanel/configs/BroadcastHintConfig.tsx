import { useState } from 'react';
import { Save, Radio, Info, AlertTriangle } from 'lucide-react';
import type { TransformNodeData } from '../../../types';

interface BroadcastHintConfigProps {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

export const BroadcastHintConfig = ({ data, onUpdate }: BroadcastHintConfigProps) => {
  const config = data.config || {};

  const [enabled, setEnabled] = useState<boolean>(
    config.enabled !== false // Default to true
  );

  const handleSave = () => {
    onUpdate({
      enabled,
    });
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="p-3 bg-green-500/10 rounded border border-green-500/30">
        <div className="flex items-start gap-2">
          <Radio className="w-4 h-4 text-green-400 mt-0.5" />
          <div>
            <p className="text-xs text-green-300 font-medium">Broadcast Hint</p>
            <p className="text-xs text-gray-400 mt-1">
              Mark this DataFrame for broadcasting in subsequent join operations. The entire DataFrame will be sent to all executors.
            </p>
          </div>
        </div>
      </div>

      {/* Enable Toggle */}
      <label className="flex items-center gap-3 p-3 bg-canvas rounded border border-gray-700 cursor-pointer hover:bg-panel-light">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="rounded w-5 h-5"
        />
        <div>
          <span className="text-sm text-white">Enable Broadcast Hint</span>
          <p className="text-[10px] text-gray-500">
            Wraps DataFrame with broadcast() function for join optimization
          </p>
        </div>
      </label>

      {/* Size Guidelines */}
      <div className="p-3 bg-canvas rounded border border-gray-700">
        <div className="flex items-center gap-1 mb-2">
          <Info className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] text-gray-400">Size Guidelines</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-500">Default threshold:</span>
            <span className="text-green-400">10 MB</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-500">Safe maximum:</span>
            <span className="text-yellow-400">~100 MB</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-500">Risky (may OOM):</span>
            <span className="text-red-400">&gt; 500 MB</span>
          </div>
        </div>
      </div>

      {/* When to Use */}
      <div className="p-3 bg-canvas rounded border border-gray-700">
        <div className="flex items-center gap-1 mb-2">
          <Info className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] text-gray-400">When to use</span>
        </div>
        <ul className="text-[10px] text-gray-500 space-y-1 list-disc list-inside">
          <li>Small dimension tables (customers, products, lookup tables)</li>
          <li>When joining small table with very large table</li>
          <li>To avoid shuffle in join operations</li>
          <li>When Spark doesn't auto-broadcast (table stats unknown)</li>
        </ul>
      </div>

      {/* Warning */}
      <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
          <div className="text-xs text-yellow-400">
            <p className="font-medium">Memory Warning</p>
            <p className="text-yellow-400/80 mt-1">
              Broadcasting large DataFrames can cause OutOfMemory errors. Each executor receives a full copy.
            </p>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="p-3 bg-panel rounded border border-gray-700">
        <p className="text-[10px] text-gray-400 mb-2">Generated Code:</p>
        <code className="text-xs text-green-400 font-mono">
          {enabled
            ? 'df = broadcast(df)'
            : '# Broadcast hint disabled'
          }
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
