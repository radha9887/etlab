interface KubernetesPodConfigProps {
  config: {
    taskId: string;
    name?: string;
    namespace?: string;
    image?: string;
    cmds?: string;
    arguments?: string;
    envVars?: string;
    kubernetesConnId?: string;
    configFile?: string;
    inCluster?: boolean;
    isDeleteOperatorPod?: boolean;
    getLogsOnError?: boolean;
    resources?: {
      cpuRequest?: string;
      cpuLimit?: string;
      memoryRequest?: string;
      memoryLimit?: string;
    };
  };
  onChange: (updates: Partial<KubernetesPodConfigProps['config']>) => void;
  etlPages: any[];
}

export const KubernetesPodConfig = ({ config, onChange }: KubernetesPodConfigProps) => {
  const updateResources = (key: string, value: string) => {
    onChange({
      resources: {
        ...config.resources,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-3">
      {/* Pod Name */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Pod Name *</label>
        <input
          type="text"
          value={config.name || ''}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="my-etl-job"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      {/* Namespace */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Namespace</label>
        <input
          type="text"
          value={config.namespace || ''}
          onChange={(e) => onChange({ namespace: e.target.value })}
          placeholder="default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Image */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Container Image *</label>
        <input
          type="text"
          value={config.image || ''}
          onChange={(e) => onChange({ image: e.target.value })}
          placeholder="python:3.11-slim or myrepo/myimage:tag"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      {/* Commands */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Commands (JSON array)</label>
        <input
          type="text"
          value={config.cmds || ''}
          onChange={(e) => onChange({ cmds: e.target.value })}
          placeholder='["python", "-c"]'
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      {/* Arguments */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Arguments (JSON array)</label>
        <textarea
          value={config.arguments || ''}
          onChange={(e) => onChange({ arguments: e.target.value })}
          placeholder='["print(\"Hello from K8s\")"]'
          rows={2}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
        />
      </div>

      {/* Environment Variables */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Environment Variables (JSON)</label>
        <textarea
          value={config.envVars || ''}
          onChange={(e) => onChange({ envVars: e.target.value })}
          placeholder='{"ENV": "production", "DEBUG": "false"}'
          rows={2}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
        />
      </div>

      {/* Resources */}
      <div className="border-t border-gray-700 pt-3">
        <h4 className="text-xs font-medium text-gray-300 mb-2">Resources</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-400 mb-1">CPU Request</label>
            <input
              type="text"
              value={config.resources?.cpuRequest || ''}
              onChange={(e) => updateResources('cpuRequest', e.target.value)}
              placeholder="100m"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">CPU Limit</label>
            <input
              type="text"
              value={config.resources?.cpuLimit || ''}
              onChange={(e) => updateResources('cpuLimit', e.target.value)}
              placeholder="500m"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Memory Request</label>
            <input
              type="text"
              value={config.resources?.memoryRequest || ''}
              onChange={(e) => updateResources('memoryRequest', e.target.value)}
              placeholder="256Mi"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Memory Limit</label>
            <input
              type="text"
              value={config.resources?.memoryLimit || ''}
              onChange={(e) => updateResources('memoryLimit', e.target.value)}
              placeholder="1Gi"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* K8s Connection */}
      <div className="border-t border-gray-700 pt-3">
        <label className="block text-xs text-gray-400 mb-1">Kubernetes Connection ID</label>
        <input
          type="text"
          value={config.kubernetesConnId || ''}
          onChange={(e) => onChange({ kubernetesConnId: e.target.value })}
          placeholder="kubernetes_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />

        {/* In Cluster */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-400">In Cluster</span>
          <button
            onClick={() => onChange({ inCluster: !config.inCluster })}
            className={`w-10 h-5 rounded-full transition-colors
                      ${config.inCluster ? 'bg-accent' : 'bg-gray-600'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transform transition-transform
                        ${config.inCluster ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>
      </div>

      {/* Cleanup Options */}
      <div className="border-t border-gray-700 pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Delete Pod After Completion</span>
          <button
            onClick={() => onChange({ isDeleteOperatorPod: !config.isDeleteOperatorPod })}
            className={`w-10 h-5 rounded-full transition-colors
                      ${config.isDeleteOperatorPod !== false ? 'bg-accent' : 'bg-gray-600'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transform transition-transform
                        ${config.isDeleteOperatorPod !== false ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Get Logs on Error</span>
          <button
            onClick={() => onChange({ getLogsOnError: !config.getLogsOnError })}
            className={`w-10 h-5 rounded-full transition-colors
                      ${config.getLogsOnError !== false ? 'bg-accent' : 'bg-gray-600'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transform transition-transform
                        ${config.getLogsOnError !== false ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
