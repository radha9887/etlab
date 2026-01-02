interface HttpSensorConfigProps {
  config: {
    taskId: string;
    httpConnId?: string;
    endpoint?: string;
    method?: 'GET' | 'POST';
    headers?: string;
    responseCheck?: string;
    pokeIntervalSeconds?: number;
    timeoutSeconds?: number;
    mode?: 'poke' | 'reschedule';
    softFail?: boolean;
    deferrable?: boolean;
    exponentialBackoff?: boolean;
  };
  onChange: (updates: Partial<HttpSensorConfigProps['config']>) => void;
  etlPages: any[];
}

export const HttpSensorConfig = ({ config, onChange }: HttpSensorConfigProps) => {
  return (
    <div className="space-y-3">
      {/* HTTP Connection */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">HTTP Connection ID</label>
        <input
          type="text"
          value={config.httpConnId || ''}
          onChange={(e) => onChange({ httpConnId: e.target.value })}
          placeholder="http_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Airflow connection with base URL
        </p>
      </div>

      {/* Endpoint */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Endpoint *</label>
        <input
          type="text"
          value={config.endpoint || ''}
          onChange={(e) => onChange({ endpoint: e.target.value })}
          placeholder="/api/health or /status"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      {/* HTTP Method */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Method</label>
        <div className="flex gap-2">
          <button
            onClick={() => onChange({ method: 'GET' })}
            className={`flex-1 px-3 py-2 text-xs rounded-md transition-colors
                      ${config.method === 'GET' || !config.method
                        ? 'bg-accent text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            GET
          </button>
          <button
            onClick={() => onChange({ method: 'POST' })}
            className={`flex-1 px-3 py-2 text-xs rounded-md transition-colors
                      ${config.method === 'POST'
                        ? 'bg-accent text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            POST
          </button>
        </div>
      </div>

      {/* Headers */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Headers (JSON)</label>
        <textarea
          value={config.headers || ''}
          onChange={(e) => onChange({ headers: e.target.value })}
          placeholder='{"Content-Type": "application/json"}'
          rows={2}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
        />
      </div>

      {/* Response Check */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Response Check</label>
        <input
          type="text"
          value={config.responseCheck || ''}
          onChange={(e) => onChange({ responseCheck: e.target.value })}
          placeholder="lambda r: r.json().get('status') == 'ready'"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          Python lambda for custom validation. Default: HTTP 200 = success
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
              value={config.pokeIntervalSeconds || 60}
              onChange={(e) => onChange({ pokeIntervalSeconds: parseInt(e.target.value) || 60 })}
              min={10}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Timeout (s)</label>
            <input
              type="number"
              value={config.timeoutSeconds || 3600}
              onChange={(e) => onChange({ timeoutSeconds: parseInt(e.target.value) || 3600 })}
              min={60}
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
    </div>
  );
};
