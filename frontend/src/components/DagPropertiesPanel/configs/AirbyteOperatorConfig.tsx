interface AirbyteOperatorConfigProps {
  config: {
    taskId: string;
    airbyteConnId?: string;
    connectionId?: string;
    asyncMode?: boolean;
    waitForCompletion?: boolean;
    timeout?: number;
    pollingInterval?: number;
  };
  onChange: (updates: Partial<AirbyteOperatorConfigProps['config']>) => void;
  etlPages: any[];
}

export const AirbyteOperatorConfig = ({ config, onChange }: AirbyteOperatorConfigProps) => {
  return (
    <div className="space-y-3">
      {/* Airbyte Connection */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Airbyte Connection ID *</label>
        <input
          type="text"
          value={config.airbyteConnId || ''}
          onChange={(e) => onChange({ airbyteConnId: e.target.value })}
          placeholder="airbyte_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Airflow connection with Airbyte API endpoint
        </p>
      </div>

      {/* Sync Connection ID */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Airbyte Sync Connection ID *</label>
        <input
          type="text"
          value={config.connectionId || ''}
          onChange={(e) => onChange({ connectionId: e.target.value })}
          placeholder="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          UUID of the Airbyte connection to sync (find in Airbyte UI)
        </p>
      </div>

      {/* Options */}
      <div className="border-t border-gray-700 pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Wait for Completion</span>
          <button
            onClick={() => onChange({ waitForCompletion: config.waitForCompletion === false ? true : !config.waitForCompletion })}
            className={`w-10 h-5 rounded-full transition-colors
                      ${config.waitForCompletion !== false ? 'bg-accent' : 'bg-gray-600'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transform transition-transform
                        ${config.waitForCompletion !== false ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Async Mode (Deferrable)</span>
          <button
            onClick={() => onChange({ asyncMode: !config.asyncMode })}
            className={`w-10 h-5 rounded-full transition-colors
                      ${config.asyncMode ? 'bg-accent' : 'bg-gray-600'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transform transition-transform
                        ${config.asyncMode ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>
      </div>

      {/* Timing */}
      {config.waitForCompletion !== false && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Timeout (s)</label>
            <input
              type="number"
              value={config.timeout || 3600}
              onChange={(e) => onChange({ timeout: parseInt(e.target.value) || 3600 })}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Poll Interval (s)</label>
            <input
              type="number"
              value={config.pollingInterval || 60}
              onChange={(e) => onChange({ pollingInterval: parseInt(e.target.value) || 60 })}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-md p-2">
        <p className="text-xs text-purple-400">
          {config.connectionId ? (
            <>Triggers Airbyte sync for connection <strong>{config.connectionId.substring(0, 8)}...</strong></>
          ) : (
            <>Configure Airbyte connection sync</>
          )}
        </p>
      </div>
    </div>
  );
};
