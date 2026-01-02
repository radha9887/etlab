interface GkeOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const GkeOperatorConfig = ({ config, onChange }: GkeOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'start_pod'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="start_pod">Start Pod</option>
          <option value="create_cluster">Create Cluster</option>
          <option value="delete_cluster">Delete Cluster</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Cluster Name *</label>
        <input
          type="text"
          value={config.clusterName || ''}
          onChange={(e) => updateConfig('clusterName', e.target.value)}
          placeholder="my-gke-cluster"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Location/Zone *</label>
        <input
          type="text"
          value={config.location || ''}
          onChange={(e) => updateConfig('location', e.target.value)}
          placeholder="us-central1-a"
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

      {config.operation === 'start_pod' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Pod Name *</label>
            <input
              type="text"
              value={config.podName || ''}
              onChange={(e) => updateConfig('podName', e.target.value)}
              placeholder="my-pod"
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

          <div>
            <label className="block text-xs text-gray-400 mb-1">Command (JSON array)</label>
            <input
              type="text"
              value={config.command || ''}
              onChange={(e) => updateConfig('command', e.target.value)}
              placeholder='["python", "script.py"]'
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Arguments (JSON array)</label>
            <input
              type="text"
              value={config.arguments || ''}
              onChange={(e) => updateConfig('arguments', e.target.value)}
              placeholder='["--arg1", "value1"]'
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.deleteOnCompletion !== false}
              onChange={(e) => updateConfig('deleteOnCompletion', e.target.checked)}
              className="rounded border-gray-600 bg-gray-800"
            />
            <label className="text-xs text-gray-400">Delete Pod on Completion</label>
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
