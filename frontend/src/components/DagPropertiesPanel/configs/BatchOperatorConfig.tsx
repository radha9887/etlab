interface BatchOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const BatchOperatorConfig = ({ config, onChange }: BatchOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Job Name *</label>
        <input
          type="text"
          value={config.jobName || ''}
          onChange={(e) => updateConfig('jobName', e.target.value)}
          placeholder="my-batch-job"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Job Definition *</label>
        <input
          type="text"
          value={config.jobDefinition || ''}
          onChange={(e) => updateConfig('jobDefinition', e.target.value)}
          placeholder="my-job-definition:1"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">Name:revision or full ARN</p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Job Queue *</label>
        <input
          type="text"
          value={config.jobQueue || ''}
          onChange={(e) => updateConfig('jobQueue', e.target.value)}
          placeholder="my-job-queue"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Container Overrides (JSON)</label>
        <textarea
          value={config.containerOverrides || ''}
          onChange={(e) => updateConfig('containerOverrides', e.target.value)}
          placeholder='{"command": ["python", "script.py"], "environment": [{"name": "KEY", "value": "val"}]}'
          rows={4}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Parameters (JSON)</label>
        <textarea
          value={config.parameters || ''}
          onChange={(e) => updateConfig('parameters', e.target.value)}
          placeholder='{"param1": "value1"}'
          rows={2}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Array Size (Optional)</label>
        <input
          type="number"
          value={config.arraySize || ''}
          onChange={(e) => updateConfig('arraySize', e.target.value ? parseInt(e.target.value) : '')}
          placeholder="10"
          min={2}
          max={10000}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">For array jobs (2-10000)</p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">AWS Connection ID</label>
        <input
          type="text"
          value={config.awsConnId || ''}
          onChange={(e) => updateConfig('awsConnId', e.target.value)}
          placeholder="aws_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Region</label>
        <input
          type="text"
          value={config.regionName || ''}
          onChange={(e) => updateConfig('regionName', e.target.value)}
          placeholder="us-east-1"
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

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={config.deferrable || false}
          onChange={(e) => updateConfig('deferrable', e.target.checked)}
          className="rounded border-gray-600 bg-gray-800"
        />
        <label className="text-xs text-gray-400">Deferrable</label>
      </div>
    </div>
  );
};
