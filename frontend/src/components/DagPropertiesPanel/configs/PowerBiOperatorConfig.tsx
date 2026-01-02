interface PowerBiOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const PowerBiOperatorConfig = ({ config, onChange }: PowerBiOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'refresh_dataset'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="refresh_dataset">Refresh Dataset</option>
          <option value="get_refresh_history">Get Refresh History</option>
          <option value="cancel_refresh">Cancel Refresh</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Workspace ID (Group ID) *</label>
        <input
          type="text"
          value={config.groupId || ''}
          onChange={(e) => updateConfig('groupId', e.target.value)}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Dataset ID *</label>
        <input
          type="text"
          value={config.datasetId || ''}
          onChange={(e) => updateConfig('datasetId', e.target.value)}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      {config.operation === 'refresh_dataset' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Refresh Type</label>
            <select
              value={config.refreshType || 'full'}
              onChange={(e) => updateConfig('refreshType', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="full">Full Refresh</option>
              <option value="automatic">Automatic</option>
              <option value="dataOnly">Data Only</option>
              <option value="calculate">Calculate</option>
              <option value="clearValues">Clear Values</option>
              <option value="defragment">Defragment</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Objects to Refresh (JSON, optional)</label>
            <textarea
              value={config.objects || ''}
              onChange={(e) => updateConfig('objects', e.target.value)}
              placeholder='[{"table": "Sales"}, {"table": "Products"}]'
              rows={3}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty to refresh all tables</p>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Commit Mode</label>
            <select
              value={config.commitMode || 'transactional'}
              onChange={(e) => updateConfig('commitMode', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="transactional">Transactional</option>
              <option value="partialBatch">Partial Batch</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Max Parallelism</label>
            <input
              type="number"
              value={config.maxParallelism || ''}
              onChange={(e) => updateConfig('maxParallelism', parseInt(e.target.value) || undefined)}
              min={1}
              max={10}
              placeholder="Default (service managed)"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Retry Count</label>
            <input
              type="number"
              value={config.retryCount || 0}
              onChange={(e) => updateConfig('retryCount', parseInt(e.target.value))}
              min={0}
              max={5}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </>
      )}

      {config.operation === 'get_refresh_history' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Number of Entries</label>
          <input
            type="number"
            value={config.top || 10}
            onChange={(e) => updateConfig('top', parseInt(e.target.value))}
            min={1}
            max={100}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      )}

      {config.operation === 'cancel_refresh' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Refresh ID *</label>
          <input
            type="text"
            value={config.refreshId || ''}
            onChange={(e) => updateConfig('refreshId', e.target.value)}
            placeholder="Refresh ID from get_refresh_history"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      )}

      <div>
        <label className="block text-xs text-gray-400 mb-1">Power BI Connection ID</label>
        <input
          type="text"
          value={config.powerBiConnId || ''}
          onChange={(e) => updateConfig('powerBiConnId', e.target.value)}
          placeholder="powerbi_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {config.operation === 'refresh_dataset' && (
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
