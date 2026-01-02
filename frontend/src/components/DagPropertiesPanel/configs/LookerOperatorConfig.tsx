interface LookerOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const LookerOperatorConfig = ({ config, onChange }: LookerOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'start_pdt_build'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="start_pdt_build">Start PDT Build</option>
          <option value="run_look">Run Look</option>
          <option value="run_query">Run Query</option>
          <option value="check_pdt_build">Check PDT Build Status</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Looker Connection ID *</label>
        <input
          type="text"
          value={config.lookerConnId || ''}
          onChange={(e) => updateConfig('lookerConnId', e.target.value)}
          placeholder="looker_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {config.operation === 'start_pdt_build' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Model *</label>
            <input
              type="text"
              value={config.model || ''}
              onChange={(e) => updateConfig('model', e.target.value)}
              placeholder="my_model"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">View *</label>
            <input
              type="text"
              value={config.view || ''}
              onChange={(e) => updateConfig('view', e.target.value)}
              placeholder="my_derived_table"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.forceFullIncremental || false}
              onChange={(e) => updateConfig('forceFullIncremental', e.target.checked)}
              className="rounded border-gray-600 bg-gray-800"
            />
            <label className="text-xs text-gray-400">Force Full Incremental</label>
          </div>
        </>
      )}

      {config.operation === 'run_look' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Look ID *</label>
            <input
              type="number"
              value={config.lookId || ''}
              onChange={(e) => updateConfig('lookId', parseInt(e.target.value))}
              placeholder="123"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Result Format</label>
            <select
              value={config.resultFormat || 'json'}
              onChange={(e) => updateConfig('resultFormat', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="txt">Text</option>
              <option value="html">HTML</option>
              <option value="xlsx">Excel</option>
              <option value="png">PNG Image</option>
            </select>
          </div>
        </>
      )}

      {config.operation === 'run_query' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Query ID</label>
            <input
              type="number"
              value={config.queryId || ''}
              onChange={(e) => updateConfig('queryId', parseInt(e.target.value))}
              placeholder="456"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">-- OR -- Inline Query (JSON)</label>
            <textarea
              value={config.query || ''}
              onChange={(e) => updateConfig('query', e.target.value)}
              placeholder='{"model": "my_model", "view": "my_view", "fields": ["field1", "field2"]}'
              rows={4}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Result Format</label>
            <select
              value={config.resultFormat || 'json'}
              onChange={(e) => updateConfig('resultFormat', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="json">JSON</option>
              <option value="json_detail">JSON Detail</option>
              <option value="csv">CSV</option>
              <option value="txt">Text</option>
              <option value="html">HTML</option>
              <option value="sql">SQL</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Limit</label>
            <input
              type="number"
              value={config.limit || ''}
              onChange={(e) => updateConfig('limit', parseInt(e.target.value) || undefined)}
              placeholder="500"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </>
      )}

      {config.operation === 'check_pdt_build' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Materialization ID *</label>
          <input
            type="text"
            value={config.materializationId || ''}
            onChange={(e) => updateConfig('materializationId', e.target.value)}
            placeholder="materialization-id-from-start-pdt"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
          />
        </div>
      )}

      {(config.operation === 'start_pdt_build' || config.operation === 'run_query' || config.operation === 'run_look') && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.waitForCompletion !== false}
            onChange={(e) => updateConfig('waitForCompletion', e.target.checked)}
            className="rounded border-gray-600 bg-gray-800"
          />
          <label className="text-xs text-gray-400">Wait for Completion</label>
        </div>
      )}
    </div>
  );
};
