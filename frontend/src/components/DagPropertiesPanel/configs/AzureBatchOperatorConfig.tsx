interface AzureBatchOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const AzureBatchOperatorConfig = ({ config, onChange }: AzureBatchOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Batch Account Name *</label>
        <input
          type="text"
          value={config.batchAccountName || ''}
          onChange={(e) => updateConfig('batchAccountName', e.target.value)}
          placeholder="mybatchaccount"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Batch Account URL *</label>
        <input
          type="text"
          value={config.batchAccountUrl || ''}
          onChange={(e) => updateConfig('batchAccountUrl', e.target.value)}
          placeholder="https://mybatchaccount.eastus.batch.azure.com"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Pool ID *</label>
        <input
          type="text"
          value={config.poolId || ''}
          onChange={(e) => updateConfig('poolId', e.target.value)}
          placeholder="my-pool"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Job ID *</label>
        <input
          type="text"
          value={config.jobId || ''}
          onChange={(e) => updateConfig('jobId', e.target.value)}
          placeholder="my-job"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Task ID *</label>
        <input
          type="text"
          value={config.taskId || ''}
          onChange={(e) => updateConfig('taskId', e.target.value)}
          placeholder="my-task"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Command Line *</label>
        <textarea
          value={config.commandLine || ''}
          onChange={(e) => updateConfig('commandLine', e.target.value)}
          placeholder="/bin/bash -c 'echo Hello World'"
          rows={2}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Container Image (optional)</label>
        <input
          type="text"
          value={config.containerImage || ''}
          onChange={(e) => updateConfig('containerImage', e.target.value)}
          placeholder="python:3.9-slim"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Environment Variables (JSON)</label>
        <textarea
          value={config.environmentSettings || ''}
          onChange={(e) => updateConfig('environmentSettings', e.target.value)}
          placeholder='[{"name": "VAR1", "value": "value1"}]'
          rows={2}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Max Retries</label>
        <input
          type="number"
          value={config.maxTaskRetryCount || 0}
          onChange={(e) => updateConfig('maxTaskRetryCount', parseInt(e.target.value))}
          min={0}
          max={10}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Azure Batch Connection ID</label>
        <input
          type="text"
          value={config.azureBatchConnId || ''}
          onChange={(e) => updateConfig('azureBatchConnId', e.target.value)}
          placeholder="azure_batch_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={config.waitForCompletion !== false}
          onChange={(e) => updateConfig('waitForCompletion', e.target.checked)}
          className="rounded border-gray-600 bg-gray-800"
        />
        <label className="text-xs text-gray-400">Wait for Completion</label>
      </div>
    </div>
  );
};
