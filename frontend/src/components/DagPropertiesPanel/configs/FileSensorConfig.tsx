interface FileSensorConfigProps {
  config: {
    taskId: string;
    filepath?: string;
    pokeIntervalSeconds?: number;
    timeoutSeconds?: number;
    mode?: 'poke' | 'reschedule';
    softFail?: boolean;
    deferrable?: boolean;
    exponentialBackoff?: boolean;
  };
  onChange: (updates: Partial<FileSensorConfigProps['config']>) => void;
  etlPages: any[];
}

export const FileSensorConfig = ({ config, onChange }: FileSensorConfigProps) => {

  return (
    <div className="space-y-3">
      {/* File Path */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">File Path *</label>
        <input
          type="text"
          value={config.filepath || ''}
          onChange={(e) => onChange({ filepath: e.target.value })}
          placeholder="/path/to/file.csv or /path/to/*.csv"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          Supports glob patterns (* and ?)
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
        <p className="text-xs text-gray-500 mt-1">
          {config.mode === 'reschedule'
            ? 'Frees worker slot between checks'
            : 'Keeps checking in same worker slot'}
        </p>
      </div>

      {/* Poke Interval */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Poke Interval (seconds)</label>
        <input
          type="number"
          value={config.pokeIntervalSeconds || 60}
          onChange={(e) => onChange({ pokeIntervalSeconds: parseInt(e.target.value) || 60 })}
          min={10}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Timeout */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Timeout (seconds)</label>
        <input
          type="number"
          value={config.timeoutSeconds || 3600}
          onChange={(e) => onChange({ timeoutSeconds: parseInt(e.target.value) || 3600 })}
          min={60}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          {Math.floor((config.timeoutSeconds || 3600) / 60)} minutes
        </p>
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
    </div>
  );
};
