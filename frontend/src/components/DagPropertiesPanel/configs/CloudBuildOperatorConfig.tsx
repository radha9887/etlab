interface CloudBuildOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const CloudBuildOperatorConfig = ({ config, onChange }: CloudBuildOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'run_trigger'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="run_trigger">Run Build Trigger</option>
          <option value="create_build">Create Build</option>
          <option value="cancel_build">Cancel Build</option>
          <option value="create_trigger">Create Trigger</option>
          <option value="delete_trigger">Delete Trigger</option>
        </select>
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

      {(config.operation === 'run_trigger' || config.operation === 'delete_trigger') && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Trigger ID *</label>
          <input
            type="text"
            value={config.triggerId || ''}
            onChange={(e) => updateConfig('triggerId', e.target.value)}
            placeholder="12345678-1234-1234-1234-123456789012"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
          />
        </div>
      )}

      {config.operation === 'run_trigger' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Branch Name</label>
            <input
              type="text"
              value={config.branchName || ''}
              onChange={(e) => updateConfig('branchName', e.target.value)}
              placeholder="main"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Tag Name (alternative to branch)</label>
            <input
              type="text"
              value={config.tagName || ''}
              onChange={(e) => updateConfig('tagName', e.target.value)}
              placeholder="v1.0.0"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Substitutions (JSON)</label>
            <textarea
              value={config.substitutions || ''}
              onChange={(e) => updateConfig('substitutions', e.target.value)}
              placeholder='{"_ENV": "production", "_VERSION": "1.0"}'
              rows={2}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
            />
          </div>
        </>
      )}

      {config.operation === 'create_build' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Build Config (cloudbuild.yaml content)</label>
            <textarea
              value={config.buildConfig || ''}
              onChange={(e) => updateConfig('buildConfig', e.target.value)}
              placeholder="steps:&#10;  - name: 'gcr.io/cloud-builders/docker'&#10;    args: ['build', '-t', 'gcr.io/$PROJECT_ID/app', '.']"
              rows={6}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Source GCS URI (optional)</label>
            <input
              type="text"
              value={config.sourceGcs || ''}
              onChange={(e) => updateConfig('sourceGcs', e.target.value)}
              placeholder="gs://bucket/source.tar.gz"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Timeout (seconds)</label>
            <input
              type="number"
              value={config.timeout || 600}
              onChange={(e) => updateConfig('timeout', parseInt(e.target.value))}
              min={60}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </>
      )}

      {config.operation === 'cancel_build' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Build ID *</label>
          <input
            type="text"
            value={config.buildId || ''}
            onChange={(e) => updateConfig('buildId', e.target.value)}
            placeholder="12345678-1234-1234-1234-123456789012"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
          />
        </div>
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
