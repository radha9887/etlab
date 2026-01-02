interface EksOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const EksOperatorConfig = ({ config, onChange }: EksOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Cluster Name *</label>
        <input
          type="text"
          value={config.clusterName || ''}
          onChange={(e) => updateConfig('clusterName', e.target.value)}
          placeholder="my-eks-cluster"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

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
          value={config.namespace || ''}
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
          placeholder="123456789.dkr.ecr.us-east-1.amazonaws.com/my-image:latest"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Commands (JSON array)</label>
        <input
          type="text"
          value={config.cmds || ''}
          onChange={(e) => updateConfig('cmds', e.target.value)}
          placeholder='["python", "script.py"]'
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
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
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Environment Variables (JSON)</label>
        <textarea
          value={config.envVars || ''}
          onChange={(e) => updateConfig('envVars', e.target.value)}
          placeholder='{"KEY1": "value1", "KEY2": "value2"}'
          rows={3}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1">CPU Request</label>
          <input
            type="text"
            value={config.cpuRequest || ''}
            onChange={(e) => updateConfig('cpuRequest', e.target.value)}
            placeholder="500m"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Memory Request</label>
          <input
            type="text"
            value={config.memoryRequest || ''}
            onChange={(e) => updateConfig('memoryRequest', e.target.value)}
            placeholder="1Gi"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
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
          checked={config.getLogs !== false}
          onChange={(e) => updateConfig('getLogs', e.target.checked)}
          className="rounded border-gray-600 bg-gray-800"
        />
        <label className="text-xs text-gray-400">Get Logs</label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={config.isDeleteOperatorPod !== false}
          onChange={(e) => updateConfig('isDeleteOperatorPod', e.target.checked)}
          className="rounded border-gray-600 bg-gray-800"
        />
        <label className="text-xs text-gray-400">Delete Pod on Completion</label>
      </div>
    </div>
  );
};
