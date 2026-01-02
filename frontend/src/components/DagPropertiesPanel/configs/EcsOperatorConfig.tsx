interface EcsOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const EcsOperatorConfig = ({ config, onChange }: EcsOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Task Definition *</label>
        <input
          type="text"
          value={config.taskDefinition || ''}
          onChange={(e) => updateConfig('taskDefinition', e.target.value)}
          placeholder="my-task-definition:1"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">Family:revision or full ARN</p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Cluster *</label>
        <input
          type="text"
          value={config.cluster || ''}
          onChange={(e) => updateConfig('cluster', e.target.value)}
          placeholder="my-ecs-cluster"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Launch Type</label>
        <select
          value={config.launchType || 'FARGATE'}
          onChange={(e) => updateConfig('launchType', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="FARGATE">Fargate</option>
          <option value="EC2">EC2</option>
          <option value="EXTERNAL">External</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Subnets (comma-separated)</label>
        <input
          type="text"
          value={config.subnets || ''}
          onChange={(e) => updateConfig('subnets', e.target.value)}
          placeholder="subnet-12345,subnet-67890"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Security Groups (comma-separated)</label>
        <input
          type="text"
          value={config.securityGroups || ''}
          onChange={(e) => updateConfig('securityGroups', e.target.value)}
          placeholder="sg-12345,sg-67890"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Container Overrides (JSON)</label>
        <textarea
          value={config.overrides || ''}
          onChange={(e) => updateConfig('overrides', e.target.value)}
          placeholder='{"containerOverrides": [{"name": "container", "command": ["arg1"]}]}'
          rows={3}
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
          checked={config.assignPublicIp || false}
          onChange={(e) => updateConfig('assignPublicIp', e.target.checked)}
          className="rounded border-gray-600 bg-gray-800"
        />
        <label className="text-xs text-gray-400">Assign Public IP</label>
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
