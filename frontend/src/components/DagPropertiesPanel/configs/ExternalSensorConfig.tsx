interface ExternalSensorConfigProps {
  config: {
    taskId: string;
    externalDagId?: string;
    externalTaskId?: string;
    executionDeltaMinutes?: number;
    checkExistence?: boolean;
    pokeIntervalSeconds?: number;
    timeoutSeconds?: number;
    mode?: 'poke' | 'reschedule';
    softFail?: boolean;
    deferrable?: boolean;
    exponentialBackoff?: boolean;
  };
  onChange: (updates: Partial<ExternalSensorConfigProps['config']>) => void;
  etlPages: any[];
}

export const ExternalSensorConfig = ({ config, onChange }: ExternalSensorConfigProps) => {
  return (
    <div className="space-y-3">
      {/* External DAG ID */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">External DAG ID *</label>
        <input
          type="text"
          value={config.externalDagId || ''}
          onChange={(e) => onChange({ externalDagId: e.target.value })}
          placeholder="upstream_dag"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      {/* External Task ID */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">External Task ID</label>
        <input
          type="text"
          value={config.externalTaskId || ''}
          onChange={(e) => onChange({ externalTaskId: e.target.value })}
          placeholder="Leave empty to wait for entire DAG"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          Optional: Specific task to wait for
        </p>
      </div>

      {/* Execution Delta */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Execution Delta (minutes)</label>
        <input
          type="number"
          value={config.executionDeltaMinutes || 0}
          onChange={(e) => onChange({ executionDeltaMinutes: parseInt(e.target.value) || 0 })}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          0 = same execution date. Negative for previous runs (-1440 = yesterday)
        </p>
      </div>

      {/* Check Existence */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400">Check Existence Only</span>
          <p className="text-xs text-gray-500">Don't wait for success state</p>
        </div>
        <button
          onClick={() => onChange({ checkExistence: !config.checkExistence })}
          className={`w-10 h-5 rounded-full transition-colors
                    ${config.checkExistence ? 'bg-accent' : 'bg-gray-600'}`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transform transition-transform
                      ${config.checkExistence ? 'translate-x-5' : 'translate-x-0.5'}`}
          />
        </button>
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

      {/* Info Box */}
      {config.externalDagId && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-2">
          <p className="text-xs text-yellow-400">
            Waits for <strong>{config.externalDagId}</strong>
            {config.externalTaskId ? ` / ${config.externalTaskId}` : ''} to complete
          </p>
        </div>
      )}
    </div>
  );
};
