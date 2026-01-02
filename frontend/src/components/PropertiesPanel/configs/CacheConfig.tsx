import { useState } from 'react';
import { Save } from 'lucide-react';
import type { TransformNodeData } from '../../../types';

interface CacheConfigProps {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

export const CacheConfig = ({ data, onUpdate }: CacheConfigProps) => {
  const [storageLevel, setStorageLevel] = useState(
    (data.config?.storageLevel as string) || 'MEMORY_AND_DISK'
  );

  const storageLevels = [
    { value: 'MEMORY_ONLY', label: 'Memory Only', desc: 'Store in memory as deserialized objects' },
    { value: 'MEMORY_AND_DISK', label: 'Memory & Disk', desc: 'Spill to disk if memory is full' },
    { value: 'MEMORY_ONLY_SER', label: 'Memory Serialized', desc: 'Store serialized (compact but slower)' },
    { value: 'MEMORY_AND_DISK_SER', label: 'Memory & Disk Serialized', desc: 'Serialized with disk spill' },
    { value: 'DISK_ONLY', label: 'Disk Only', desc: 'Store only on disk' },
    { value: 'OFF_HEAP', label: 'Off-Heap', desc: 'Store in off-heap memory' },
  ];

  const handleSave = () => {
    onUpdate({ storageLevel });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-panel rounded border border-gray-700">
        <p className="text-xs text-gray-400">
          Cache/persist the DataFrame in memory or disk for faster access.
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-2">Storage Level</label>
        <div className="space-y-1">
          {storageLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => setStorageLevel(level.value)}
              className={`w-full px-3 py-2 text-left text-xs rounded transition-colors ${
                storageLevel === level.value
                  ? 'bg-accent text-white'
                  : 'bg-panel text-gray-400 hover:bg-panel-light'
              }`}
            >
              <div className="font-medium">{level.label}</div>
              <div className="text-[10px] opacity-70">{level.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
        <p className="text-xs text-yellow-400">
          Remember to call unpersist() when the cached data is no longer needed to free resources.
        </p>
      </div>

      <div className="p-2 bg-panel rounded border border-gray-700 text-[10px] text-gray-500">
        <p className="font-medium text-gray-400 mb-1">Recommendations:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Use MEMORY_AND_DISK for most cases</li>
          <li>Use MEMORY_ONLY if data fits in memory and speed is critical</li>
          <li>Use serialized options for large datasets to reduce memory</li>
        </ul>
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
