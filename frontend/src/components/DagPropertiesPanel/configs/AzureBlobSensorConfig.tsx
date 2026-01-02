interface AzureBlobSensorConfigProps {
  config: {
    taskId: string;
    containerName?: string;
    blobName?: string;
    prefix?: string;
    wasb_conn_id?: string;
    checkOptions?: string;
    pokeIntervalSeconds?: number;
    timeoutSeconds?: number;
    mode?: 'poke' | 'reschedule';
    softFail?: boolean;
    deferrable?: boolean;
    exponentialBackoff?: boolean;
  };
  onChange: (updates: Partial<AzureBlobSensorConfigProps['config']>) => void;
  etlPages: any[];
}

export const AzureBlobSensorConfig = ({ config, onChange }: AzureBlobSensorConfigProps) => {

  return (
    <div className="space-y-3">
      {/* Container Name */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Container Name *</label>
        <input
          type="text"
          value={config.containerName || ''}
          onChange={(e) => onChange({ containerName: e.target.value })}
          placeholder="my-container"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      {/* Blob Name / Prefix */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Blob Name or Prefix *</label>
        <input
          type="text"
          value={config.blobName || config.prefix || ''}
          onChange={(e) => onChange({ blobName: e.target.value })}
          placeholder="data/input/file.csv or data/input/"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          Supports wildcards like data/*.csv
        </p>
      </div>

      {/* Azure Connection */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Azure Connection ID</label>
        <input
          type="text"
          value={config.wasb_conn_id || ''}
          onChange={(e) => onChange({ wasb_conn_id: e.target.value })}
          placeholder="wasb_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Airflow connection for Azure Storage credentials
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
              min={30}
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

      {/* Deferrable Mode */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400">Deferrable</span>
          <p className="text-xs text-gray-500">Use async triggerer (Airflow 2.2+)</p>
        </div>
        <button
          onClick={() => onChange({ deferrable: !config.deferrable })}
          className={`w-10 h-5 rounded-full transition-colors
                    ${config.deferrable ? 'bg-accent' : 'bg-gray-600'}`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transform transition-transform
                      ${config.deferrable ? 'translate-x-5' : 'translate-x-0.5'}`}
          />
        </button>
      </div>

      {/* Exponential Backoff */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400">Exponential Backoff</span>
          <p className="text-xs text-gray-500">Increase poke interval over time</p>
        </div>
        <button
          onClick={() => onChange({ exponentialBackoff: !config.exponentialBackoff })}
          className={`w-10 h-5 rounded-full transition-colors
                    ${config.exponentialBackoff ? 'bg-accent' : 'bg-gray-600'}`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transform transition-transform
                      ${config.exponentialBackoff ? 'translate-x-5' : 'translate-x-0.5'}`}
          />
        </button>
      </div>

      {/* Preview */}
      {config.containerName && config.blobName && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-2">
          <p className="text-xs text-blue-400 font-mono">
            wasbs://{config.containerName}@storage/{config.blobName}
          </p>
        </div>
      )}
    </div>
  );
};
