interface ComputeEngineOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const ComputeEngineOperatorConfig = ({ config, onChange }: ComputeEngineOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'start'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="start">Start Instance</option>
          <option value="stop">Stop Instance</option>
          <option value="insert">Create Instance</option>
          <option value="delete">Delete Instance</option>
          <option value="set_machine_type">Set Machine Type</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Instance Name *</label>
        <input
          type="text"
          value={config.instanceName || ''}
          onChange={(e) => updateConfig('instanceName', e.target.value)}
          placeholder="my-vm-instance"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Zone *</label>
        <input
          type="text"
          value={config.zone || ''}
          onChange={(e) => updateConfig('zone', e.target.value)}
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

      {config.operation === 'insert' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Machine Type</label>
            <select
              value={config.machineType || 'e2-medium'}
              onChange={(e) => updateConfig('machineType', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="e2-micro">e2-micro</option>
              <option value="e2-small">e2-small</option>
              <option value="e2-medium">e2-medium</option>
              <option value="e2-standard-2">e2-standard-2</option>
              <option value="e2-standard-4">e2-standard-4</option>
              <option value="e2-standard-8">e2-standard-8</option>
              <option value="n2-standard-2">n2-standard-2</option>
              <option value="n2-standard-4">n2-standard-4</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Source Image</label>
            <input
              type="text"
              value={config.sourceImage || ''}
              onChange={(e) => updateConfig('sourceImage', e.target.value)}
              placeholder="projects/debian-cloud/global/images/family/debian-11"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Disk Size (GB)</label>
            <input
              type="number"
              value={config.diskSizeGb || 10}
              onChange={(e) => updateConfig('diskSizeGb', parseInt(e.target.value))}
              min={10}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Network</label>
            <input
              type="text"
              value={config.network || 'default'}
              onChange={(e) => updateConfig('network', e.target.value)}
              placeholder="default"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </>
      )}

      {config.operation === 'set_machine_type' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">New Machine Type</label>
          <select
            value={config.newMachineType || 'e2-medium'}
            onChange={(e) => updateConfig('newMachineType', e.target.value)}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          >
            <option value="e2-micro">e2-micro</option>
            <option value="e2-small">e2-small</option>
            <option value="e2-medium">e2-medium</option>
            <option value="e2-standard-2">e2-standard-2</option>
            <option value="e2-standard-4">e2-standard-4</option>
            <option value="n2-standard-2">n2-standard-2</option>
            <option value="n2-standard-4">n2-standard-4</option>
          </select>
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
    </div>
  );
};
