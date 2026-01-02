interface DataFusionOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const DataFusionOperatorConfig = ({ config, onChange }: DataFusionOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'start_pipeline'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="start_pipeline">Start Pipeline</option>
          <option value="stop_pipeline">Stop Pipeline</option>
          <option value="create_pipeline">Create Pipeline</option>
          <option value="delete_pipeline">Delete Pipeline</option>
          <option value="create_instance">Create Instance</option>
          <option value="delete_instance">Delete Instance</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Instance Name *</label>
        <input
          type="text"
          value={config.instanceName || ''}
          onChange={(e) => updateConfig('instanceName', e.target.value)}
          placeholder="my-datafusion-instance"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Location *</label>
        <input
          type="text"
          value={config.location || ''}
          onChange={(e) => updateConfig('location', e.target.value)}
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

      {(config.operation === 'start_pipeline' || config.operation === 'stop_pipeline' ||
        config.operation === 'create_pipeline' || config.operation === 'delete_pipeline') && (
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
            <label className="block text-xs text-gray-400 mb-1">Namespace</label>
            <input
              type="text"
              value={config.namespace || 'default'}
              onChange={(e) => updateConfig('namespace', e.target.value)}
              placeholder="default"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </>
      )}

      {config.operation === 'start_pipeline' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Runtime Arguments (JSON)</label>
            <textarea
              value={config.runtimeArgs || ''}
              onChange={(e) => updateConfig('runtimeArgs', e.target.value)}
              placeholder='{"input.path": "gs://bucket/input"}'
              rows={3}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.asynchronous || false}
              onChange={(e) => updateConfig('asynchronous', e.target.checked)}
              className="rounded border-gray-600 bg-gray-800"
            />
            <label className="text-xs text-gray-400">Run Asynchronously</label>
          </div>
        </>
      )}

      {config.operation === 'create_instance' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Instance Type</label>
            <select
              value={config.instanceType || 'BASIC'}
              onChange={(e) => updateConfig('instanceType', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="BASIC">Basic</option>
              <option value="ENTERPRISE">Enterprise</option>
              <option value="DEVELOPER">Developer</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">CDAP Version</label>
            <input
              type="text"
              value={config.cdapVersion || ''}
              onChange={(e) => updateConfig('cdapVersion', e.target.value)}
              placeholder="6.9.0"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.enableStackdriverLogging || false}
              onChange={(e) => updateConfig('enableStackdriverLogging', e.target.checked)}
              className="rounded border-gray-600 bg-gray-800"
            />
            <label className="text-xs text-gray-400">Enable Stackdriver Logging</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.enableStackdriverMonitoring || false}
              onChange={(e) => updateConfig('enableStackdriverMonitoring', e.target.checked)}
              className="rounded border-gray-600 bg-gray-800"
            />
            <label className="text-xs text-gray-400">Enable Stackdriver Monitoring</label>
          </div>
        </>
      )}

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
    </div>
  );
};
