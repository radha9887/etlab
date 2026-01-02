interface FivetranOperatorConfigProps {
  config: {
    taskId: string;
    fivetranConnId?: string;
    connectorId?: string;
    waitForCompletion?: boolean;
    timeout?: number;
    pollingInterval?: number;
    rescheduleWaitTime?: number;
    scheduleType?: 'sync' | 'force_sync';
  };
  onChange: (updates: Partial<FivetranOperatorConfigProps['config']>) => void;
  etlPages: any[];
}

export const FivetranOperatorConfig = ({ config, onChange }: FivetranOperatorConfigProps) => {
  return (
    <div className="space-y-3">
      {/* Fivetran Connection */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Fivetran Connection ID *</label>
        <input
          type="text"
          value={config.fivetranConnId || ''}
          onChange={(e) => onChange({ fivetranConnId: e.target.value })}
          placeholder="fivetran_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Airflow connection with Fivetran API key and secret
        </p>
      </div>

      {/* Connector ID */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Connector ID *</label>
        <input
          type="text"
          value={config.connectorId || ''}
          onChange={(e) => onChange({ connectorId: e.target.value })}
          placeholder="connector_abc123"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          Fivetran connector ID (find in Fivetran dashboard URL)
        </p>
      </div>

      {/* Schedule Type */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Sync Type</label>
        <select
          value={config.scheduleType || 'sync'}
          onChange={(e) => onChange({ scheduleType: e.target.value as any })}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="sync">Normal Sync</option>
          <option value="force_sync">Force Full Sync</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Force sync will resync all historical data
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
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-2">
        <p className="text-xs text-blue-400">
          {config.connectorId ? (
            <>Triggers Fivetran {config.scheduleType === 'force_sync' ? 'full ' : ''}sync for <strong>{config.connectorId}</strong></>
          ) : (
            <>Configure Fivetran connector sync</>
          )}
        </p>
      </div>
    </div>
  );
};
