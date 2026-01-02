interface CloudWatchOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const CloudWatchOperatorConfig = ({ config, onChange }: CloudWatchOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation Type</label>
        <select
          value={config.operationType || 'put_metric'}
          onChange={(e) => updateConfig('operationType', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="put_metric">Put Metric Data</option>
          <option value="put_log_event">Put Log Event</option>
          <option value="create_alarm">Create Alarm</option>
          <option value="delete_alarm">Delete Alarm</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Namespace</label>
        <input
          type="text"
          value={config.namespace || ''}
          onChange={(e) => updateConfig('namespace', e.target.value)}
          placeholder="MyApplication"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Metric Name</label>
          <input
            type="text"
            value={config.metricName || ''}
            onChange={(e) => updateConfig('metricName', e.target.value)}
            placeholder="ProcessedRecords"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Metric Value</label>
          <input
            type="number"
            value={config.metricValue || ''}
            onChange={(e) => updateConfig('metricValue', parseFloat(e.target.value))}
            placeholder="100"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Unit</label>
        <select
          value={config.unit || 'Count'}
          onChange={(e) => updateConfig('unit', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="Count">Count</option>
          <option value="Percent">Percent</option>
          <option value="Seconds">Seconds</option>
          <option value="Milliseconds">Milliseconds</option>
          <option value="Bytes">Bytes</option>
          <option value="Kilobytes">Kilobytes</option>
          <option value="Megabytes">Megabytes</option>
          <option value="None">None</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Log Group Name</label>
        <input
          type="text"
          value={config.logGroupName || ''}
          onChange={(e) => updateConfig('logGroupName', e.target.value)}
          placeholder="/aws/lambda/my-function"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Log Stream Name</label>
        <input
          type="text"
          value={config.logStreamName || ''}
          onChange={(e) => updateConfig('logStreamName', e.target.value)}
          placeholder="{{ ts_nodash }}"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Log Message</label>
        <textarea
          value={config.logMessage || ''}
          onChange={(e) => updateConfig('logMessage', e.target.value)}
          placeholder="Pipeline execution started at {{ ts }}"
          rows={3}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none"
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
    </div>
  );
};
