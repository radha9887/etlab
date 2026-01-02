interface DataSyncOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const DataSyncOperatorConfig = ({ config, onChange }: DataSyncOperatorConfigProps) => {
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
          <option value="start">Start Task Execution</option>
          <option value="create">Create Task</option>
          <option value="delete">Delete Task</option>
          <option value="sensor">Task Status Sensor</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Task ARN *</label>
        <input
          type="text"
          value={config.taskArn || ''}
          onChange={(e) => updateConfig('taskArn', e.target.value)}
          placeholder="arn:aws:datasync:us-east-1:123456789:task/task-xxx"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Source Location ARN</label>
        <input
          type="text"
          value={config.sourceLocationArn || ''}
          onChange={(e) => updateConfig('sourceLocationArn', e.target.value)}
          placeholder="arn:aws:datasync:us-east-1:123456789:location/loc-xxx"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Destination Location ARN</label>
        <input
          type="text"
          value={config.destLocationArn || ''}
          onChange={(e) => updateConfig('destLocationArn', e.target.value)}
          placeholder="arn:aws:datasync:us-east-1:123456789:location/loc-xxx"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Task Name</label>
        <input
          type="text"
          value={config.taskName || ''}
          onChange={(e) => updateConfig('taskName', e.target.value)}
          placeholder="my-datasync-task"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Includes (JSON filter)</label>
        <textarea
          value={config.includes || ''}
          onChange={(e) => updateConfig('includes', e.target.value)}
          placeholder='[{"FilterType": "SIMPLE_PATTERN", "Value": "*.csv"}]'
          rows={2}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Excludes (JSON filter)</label>
        <textarea
          value={config.excludes || ''}
          onChange={(e) => updateConfig('excludes', e.target.value)}
          placeholder='[{"FilterType": "SIMPLE_PATTERN", "Value": "*.tmp"}]'
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
        <label className="text-xs text-gray-400">Wait for Completion</label>
      </div>
    </div>
  );
};
