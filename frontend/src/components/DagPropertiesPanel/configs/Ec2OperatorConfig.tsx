interface Ec2OperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const Ec2OperatorConfig = ({ config, onChange }: Ec2OperatorConfigProps) => {
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
          <option value="terminate">Terminate Instance</option>
          <option value="reboot">Reboot Instance</option>
          <option value="hibernate">Hibernate Instance</option>
          <option value="create_snapshot">Create Snapshot</option>
          <option value="sensor">Instance State Sensor</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Instance IDs (comma-separated) *</label>
        <input
          type="text"
          value={config.instanceIds || ''}
          onChange={(e) => updateConfig('instanceIds', e.target.value)}
          placeholder="i-0abc123def456, i-0xyz789ghi012"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Target State (Sensor)</label>
        <select
          value={config.targetState || 'running'}
          onChange={(e) => updateConfig('targetState', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="running">Running</option>
          <option value="stopped">Stopped</option>
          <option value="terminated">Terminated</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Volume ID (Snapshot)</label>
        <input
          type="text"
          value={config.volumeId || ''}
          onChange={(e) => updateConfig('volumeId', e.target.value)}
          placeholder="vol-0abc123def456"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Snapshot Description</label>
        <input
          type="text"
          value={config.snapshotDescription || ''}
          onChange={(e) => updateConfig('snapshotDescription', e.target.value)}
          placeholder="Automated snapshot - {{ ds }}"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Tags (JSON)</label>
        <textarea
          value={config.tags || ''}
          onChange={(e) => updateConfig('tags', e.target.value)}
          placeholder='[{"Key": "Environment", "Value": "Production"}]'
          rows={2}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono"
        />
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
        <label className="text-xs text-gray-400">Wait for State Change</label>
      </div>
    </div>
  );
};
