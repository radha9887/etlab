interface DmsOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const DmsOperatorConfig = ({ config, onChange }: DmsOperatorConfigProps) => {
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
          <option value="start">Start Replication Task</option>
          <option value="stop">Stop Replication Task</option>
          <option value="create">Create Replication Task</option>
          <option value="delete">Delete Replication Task</option>
          <option value="describe">Describe Replication Task</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Replication Task ARN</label>
        <input
          type="text"
          value={config.replicationTaskArn || ''}
          onChange={(e) => updateConfig('replicationTaskArn', e.target.value)}
          placeholder="arn:aws:dms:us-east-1:123456789:task:xxx"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Replication Task Identifier</label>
        <input
          type="text"
          value={config.replicationTaskId || ''}
          onChange={(e) => updateConfig('replicationTaskId', e.target.value)}
          placeholder="my-replication-task"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Source Endpoint ARN</label>
        <input
          type="text"
          value={config.sourceEndpointArn || ''}
          onChange={(e) => updateConfig('sourceEndpointArn', e.target.value)}
          placeholder="arn:aws:dms:us-east-1:123456789:endpoint:xxx"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Target Endpoint ARN</label>
        <input
          type="text"
          value={config.targetEndpointArn || ''}
          onChange={(e) => updateConfig('targetEndpointArn', e.target.value)}
          placeholder="arn:aws:dms:us-east-1:123456789:endpoint:xxx"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Replication Instance ARN</label>
        <input
          type="text"
          value={config.replicationInstanceArn || ''}
          onChange={(e) => updateConfig('replicationInstanceArn', e.target.value)}
          placeholder="arn:aws:dms:us-east-1:123456789:rep:xxx"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Migration Type</label>
        <select
          value={config.migrationType || 'full-load'}
          onChange={(e) => updateConfig('migrationType', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="full-load">Full Load</option>
          <option value="cdc">CDC Only</option>
          <option value="full-load-and-cdc">Full Load + CDC</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Table Mappings (JSON)</label>
        <textarea
          value={config.tableMappings || ''}
          onChange={(e) => updateConfig('tableMappings', e.target.value)}
          placeholder='{"rules": [{"rule-type": "selection", "rule-action": "include"}]}'
          rows={4}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Start Replication Task Type</label>
        <select
          value={config.startReplicationTaskType || 'start-replication'}
          onChange={(e) => updateConfig('startReplicationTaskType', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="start-replication">Start Replication</option>
          <option value="resume-processing">Resume Processing</option>
          <option value="reload-target">Reload Target</option>
        </select>
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
