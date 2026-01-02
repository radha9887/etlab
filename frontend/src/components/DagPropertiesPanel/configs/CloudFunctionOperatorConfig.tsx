interface CloudFunctionOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const CloudFunctionOperatorConfig = ({ config, onChange }: CloudFunctionOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'invoke'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="invoke">Invoke Function</option>
          <option value="deploy">Deploy Function</option>
          <option value="delete">Delete Function</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Function Name *</label>
        <input
          type="text"
          value={config.functionName || ''}
          onChange={(e) => updateConfig('functionName', e.target.value)}
          placeholder="my-cloud-function"
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

      {config.operation === 'invoke' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Input Data (JSON)</label>
          <textarea
            value={config.inputData || ''}
            onChange={(e) => updateConfig('inputData', e.target.value)}
            placeholder='{"key": "value"}'
            rows={3}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono"
          />
        </div>
      )}

      {config.operation === 'deploy' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Runtime *</label>
            <select
              value={config.runtime || 'python311'}
              onChange={(e) => updateConfig('runtime', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="python311">Python 3.11</option>
              <option value="python310">Python 3.10</option>
              <option value="python39">Python 3.9</option>
              <option value="nodejs20">Node.js 20</option>
              <option value="nodejs18">Node.js 18</option>
              <option value="go121">Go 1.21</option>
              <option value="java17">Java 17</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Entry Point</label>
            <input
              type="text"
              value={config.entryPoint || ''}
              onChange={(e) => updateConfig('entryPoint', e.target.value)}
              placeholder="main"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Source Archive URL</label>
            <input
              type="text"
              value={config.sourceArchiveUrl || ''}
              onChange={(e) => updateConfig('sourceArchiveUrl', e.target.value)}
              placeholder="gs://bucket/source.zip"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Memory (MB)</label>
              <input
                type="number"
                value={config.memoryMb || 256}
                onChange={(e) => updateConfig('memoryMb', parseInt(e.target.value))}
                min={128}
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Timeout (s)</label>
              <input
                type="number"
                value={config.timeout || 60}
                onChange={(e) => updateConfig('timeout', parseInt(e.target.value))}
                min={1}
                max={540}
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none"
              />
            </div>
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
