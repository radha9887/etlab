interface CloudRunOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const CloudRunOperatorConfig = ({ config, onChange }: CloudRunOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'execute_job'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="execute_job">Execute Job</option>
          <option value="create_job">Create Job</option>
          <option value="update_job">Update Job</option>
          <option value="delete_job">Delete Job</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Job Name *</label>
        <input
          type="text"
          value={config.jobName || ''}
          onChange={(e) => updateConfig('jobName', e.target.value)}
          placeholder="my-cloud-run-job"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Region *</label>
        <input
          type="text"
          value={config.region || ''}
          onChange={(e) => updateConfig('region', e.target.value)}
          placeholder="us-central1"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Project ID</label>
        <input
          type="text"
          value={config.projectId || ''}
          onChange={(e) => updateConfig('projectId', e.target.value)}
          placeholder="my-gcp-project"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {config.operation === 'create_job' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Container Image *</label>
            <input
              type="text"
              value={config.image || ''}
              onChange={(e) => updateConfig('image', e.target.value)}
              placeholder="gcr.io/project/image:tag"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">CPU</label>
              <input
                type="text"
                value={config.cpu || '1'}
                onChange={(e) => updateConfig('cpu', e.target.value)}
                placeholder="1"
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Memory</label>
              <input
                type="text"
                value={config.memory || '512Mi'}
                onChange={(e) => updateConfig('memory', e.target.value)}
                placeholder="512Mi"
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Max Retries</label>
            <input
              type="number"
              value={config.maxRetries || 3}
              onChange={(e) => updateConfig('maxRetries', parseInt(e.target.value))}
              min={0}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-xs text-gray-400 mb-1">Environment Variables (JSON)</label>
        <textarea
          value={config.envVars || ''}
          onChange={(e) => updateConfig('envVars', e.target.value)}
          placeholder='{"KEY": "value"}'
          rows={2}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">GCP Connection ID</label>
        <input
          type="text"
          value={config.gcpConnId || ''}
          onChange={(e) => updateConfig('gcpConnId', e.target.value)}
          placeholder="google_cloud_default"
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
