interface DeltaLakeSensorConfigProps {
  config: {
    taskId: string;
    tablePath?: string;
    partitionFilter?: string;
    minFiles?: number;
    databricksConnId?: string;
    pokeIntervalSeconds?: number;
    timeoutSeconds?: number;
    mode?: 'poke' | 'reschedule';
    softFail?: boolean;
    deferrable?: boolean;
    exponentialBackoff?: boolean;
  };
  onChange: (updates: Partial<DeltaLakeSensorConfigProps['config']>) => void;
  etlPages: any[];
}

export const DeltaLakeSensorConfig = ({ config, onChange }: DeltaLakeSensorConfigProps) => {

  return (
    <div className="space-y-3">
      {/* Table Path */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Delta Table Path *</label>
        <input
          type="text"
          value={config.tablePath || ''}
          onChange={(e) => onChange({ tablePath: e.target.value })}
          placeholder="s3://bucket/delta/my_table or /mnt/delta/my_table"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          Path to Delta Lake table
        </p>
      </div>

      {/* Partition Filter */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Partition Filter</label>
        <input
          type="text"
          value={config.partitionFilter || ''}
          onChange={(e) => onChange({ partitionFilter: e.target.value })}
          placeholder="date = '{{ ds }}' AND region = 'US'"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          Optional: Wait for specific partition
        </p>
      </div>

      {/* Min Files */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Minimum Files</label>
        <input
          type="number"
          value={config.minFiles || 1}
          onChange={(e) => onChange({ minFiles: parseInt(e.target.value) || 1 })}
          min={1}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Minimum number of data files required
        </p>
      </div>

      {/* Databricks Connection */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Databricks Connection ID</label>
        <input
          type="text"
          value={config.databricksConnId || ''}
          onChange={(e) => onChange({ databricksConnId: e.target.value })}
          placeholder="databricks_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Optional: For Databricks-hosted Delta tables
        </p>
      </div>

      {/* Sensor Mode */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Mode</label>
        <div className="flex gap-2">
          <button
            onClick={() => onChange({ mode: 'poke' })}
            className={`flex-1 px-3 py-2 text-xs rounded-md transition-colors
                      ${config.mode === 'poke' || !config.mode
                        ? 'bg-accent text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Poke
          </button>
          <button
            onClick={() => onChange({ mode: 'reschedule' })}
            className={`flex-1 px-3 py-2 text-xs rounded-md transition-colors
                      ${config.mode === 'reschedule'
                        ? 'bg-accent text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Reschedule
          </button>
        </div>
      </div>

      {/* Timing Settings */}
      <div className="border-t border-gray-700 pt-3">
        <h4 className="text-xs font-medium text-gray-300 mb-2">Timing</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Poke Interval (s)</label>
            <input
              type="number"
              value={config.pokeIntervalSeconds || 300}
              onChange={(e) => onChange({ pokeIntervalSeconds: parseInt(e.target.value) || 300 })}
              min={60}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Timeout (s)</label>
            <input
              type="number"
              value={config.timeoutSeconds || 7200}
              onChange={(e) => onChange({ timeoutSeconds: parseInt(e.target.value) || 7200 })}
              min={300}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Soft Fail */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400">Soft Fail</span>
          <p className="text-xs text-gray-500">Mark as skipped on timeout</p>
        </div>
        <button
          onClick={() => onChange({ softFail: !config.softFail })}
          className={`w-10 h-5 rounded-full transition-colors
                    ${config.softFail ? 'bg-accent' : 'bg-gray-600'}`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transform transition-transform
                      ${config.softFail ? 'translate-x-5' : 'translate-x-0.5'}`}
          />
        </button>
      </div>

      {/* Preview */}
      {config.tablePath && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-md p-2">
          <p className="text-xs text-green-400">
            Monitors Delta table at <strong>{config.tablePath.split('/').pop()}</strong>
            {config.partitionFilter && ` with filter`}
          </p>
        </div>
      )}
    </div>
  );
};
