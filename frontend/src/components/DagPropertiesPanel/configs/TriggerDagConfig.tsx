interface TriggerDagConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
  etlPages?: any[];
}

export const TriggerDagConfig = ({ config, onChange }: TriggerDagConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const toggleState = (field: 'allowedStates' | 'failedStates', state: string) => {
    const current = config[field] || (field === 'allowedStates' ? ['success'] : ['failed']);
    const newStates = current.includes(state)
      ? current.filter((s: string) => s !== state)
      : [...current, state];
    updateConfig(field, newStates);
  };

  return (
    <div className="space-y-3">
      {/* Trigger DAG ID */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">DAG ID to Trigger *</label>
        <input
          type="text"
          value={config.triggerDagId || ''}
          onChange={(e) => updateConfig('triggerDagId', e.target.value)}
          placeholder="downstream_dag"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      {/* Configuration JSON */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Configuration (JSON)</label>
        <textarea
          value={config.conf || ''}
          onChange={(e) => updateConfig('conf', e.target.value)}
          placeholder='{"param1": "value1", "param2": 123}'
          rows={3}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Parameters to pass to triggered DAG
        </p>
      </div>

      {/* Execution Date */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Execution Date</label>
        <input
          type="text"
          value={config.executionDate || ''}
          onChange={(e) => updateConfig('executionDate', e.target.value)}
          placeholder="{{ ds }} or leave empty"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      {/* Reset DAG Run */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400">Reset DAG Run</span>
          <p className="text-xs text-gray-500">Clear existing run if exists</p>
        </div>
        <button
          onClick={() => updateConfig('resetDagRun', !config.resetDagRun)}
          className={`w-10 h-5 rounded-full transition-colors
                    ${config.resetDagRun ? 'bg-accent' : 'bg-gray-600'}`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transform transition-transform
                      ${config.resetDagRun ? 'translate-x-5' : 'translate-x-0.5'}`}
          />
        </button>
      </div>

      {/* Wait for Completion */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400">Wait for Completion</span>
          <p className="text-xs text-gray-500">Block until triggered DAG finishes</p>
        </div>
        <button
          onClick={() => updateConfig('waitForCompletion', !config.waitForCompletion)}
          className={`w-10 h-5 rounded-full transition-colors
                    ${config.waitForCompletion ? 'bg-accent' : 'bg-gray-600'}`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transform transition-transform
                      ${config.waitForCompletion ? 'translate-x-5' : 'translate-x-0.5'}`}
          />
        </button>
      </div>

      {/* Wait Options */}
      {config.waitForCompletion && (
        <div className="border-t border-gray-700 pt-3 space-y-3">
          <h4 className="text-xs font-medium text-gray-300">Wait Options</h4>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Poke Interval (s)</label>
            <input
              type="number"
              value={config.pokeInterval || 60}
              onChange={(e) => updateConfig('pokeInterval', parseInt(e.target.value) || 60)}
              min={10}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Success States</label>
            <div className="flex flex-wrap gap-1">
              {['success', 'skipped'].map(state => (
                <button
                  key={state}
                  onClick={() => toggleState('allowedStates', state)}
                  className={`px-2 py-1 text-xs rounded-md transition-colors
                            ${(config.allowedStates || ['success']).includes(state)
                              ? 'bg-green-500/30 text-green-400 border border-green-500/50'
                              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Failure States</label>
            <div className="flex flex-wrap gap-1">
              {['failed', 'skipped'].map(state => (
                <button
                  key={state}
                  onClick={() => toggleState('failedStates', state)}
                  className={`px-2 py-1 text-xs rounded-md transition-colors
                            ${(config.failedStates || ['failed']).includes(state)
                              ? 'bg-red-500/30 text-red-400 border border-red-500/50'
                              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {config.triggerDagId && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-md p-2">
          <p className="text-xs text-purple-400">
            Triggers <strong>{config.triggerDagId}</strong>
            {config.waitForCompletion && ' and waits for completion'}
          </p>
        </div>
      )}
    </div>
  );
};
