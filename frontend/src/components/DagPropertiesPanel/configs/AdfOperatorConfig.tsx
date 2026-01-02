interface AdfOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const AdfOperatorConfig = ({ config, onChange }: AdfOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'run_pipeline'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="run_pipeline">Run Pipeline</option>
          <option value="get_pipeline_run">Get Pipeline Run Status</option>
          <option value="cancel_pipeline_run">Cancel Pipeline Run</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Azure Data Factory Name *</label>
        <input
          type="text"
          value={config.factoryName || ''}
          onChange={(e) => updateConfig('factoryName', e.target.value)}
          placeholder="my-data-factory"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Resource Group *</label>
        <input
          type="text"
          value={config.resourceGroup || ''}
          onChange={(e) => updateConfig('resourceGroup', e.target.value)}
          placeholder="my-resource-group"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {config.operation === 'run_pipeline' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Pipeline Name *</label>
            <input
              type="text"
              value={config.pipelineName || ''}
              onChange={(e) => updateConfig('pipelineName', e.target.value)}
              placeholder="my-pipeline"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Parameters (JSON)</label>
            <textarea
              value={config.parameters || ''}
              onChange={(e) => updateConfig('parameters', e.target.value)}
              placeholder='{"param1": "value1", "param2": "value2"}'
              rows={3}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Reference Pipeline Run ID (optional)</label>
            <input
              type="text"
              value={config.referencePipelineRunId || ''}
              onChange={(e) => updateConfig('referencePipelineRunId', e.target.value)}
              placeholder="For rerun scenarios"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </>
      )}

      {(config.operation === 'get_pipeline_run' || config.operation === 'cancel_pipeline_run') && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Pipeline Run ID *</label>
          <input
            type="text"
            value={config.runId || ''}
            onChange={(e) => updateConfig('runId', e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
          />
        </div>
      )}

      <div>
        <label className="block text-xs text-gray-400 mb-1">Azure Connection ID</label>
        <input
          type="text"
          value={config.azureConnId || ''}
          onChange={(e) => updateConfig('azureConnId', e.target.value)}
          placeholder="azure_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {config.operation === 'run_pipeline' && (
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
