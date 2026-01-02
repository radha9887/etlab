interface KinesisOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const KinesisOperatorConfig = ({ config, onChange }: KinesisOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Service Type</label>
        <select
          value={config.serviceType || 'streams'}
          onChange={(e) => updateConfig('serviceType', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="streams">Kinesis Data Streams</option>
          <option value="firehose">Kinesis Firehose</option>
          <option value="analytics">Kinesis Analytics</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'put_record'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="put_record">Put Record</option>
          <option value="put_records">Put Records (Batch)</option>
          <option value="create_stream">Create Stream</option>
          <option value="delete_stream">Delete Stream</option>
          <option value="start_application">Start Analytics App</option>
          <option value="stop_application">Stop Analytics App</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Stream Name *</label>
        <input
          type="text"
          value={config.streamName || ''}
          onChange={(e) => updateConfig('streamName', e.target.value)}
          placeholder="my-kinesis-stream"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Delivery Stream Name (Firehose)</label>
        <input
          type="text"
          value={config.deliveryStreamName || ''}
          onChange={(e) => updateConfig('deliveryStreamName', e.target.value)}
          placeholder="my-firehose-stream"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Data / Payload (JSON)</label>
        <textarea
          value={config.data || ''}
          onChange={(e) => updateConfig('data', e.target.value)}
          placeholder='{"key": "value", "timestamp": "{{ ts }}"}'
          rows={4}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Partition Key</label>
        <input
          type="text"
          value={config.partitionKey || ''}
          onChange={(e) => updateConfig('partitionKey', e.target.value)}
          placeholder="partition-key-{{ ts_nodash }}"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Shard Count (Create Stream)</label>
        <input
          type="number"
          value={config.shardCount || 1}
          onChange={(e) => updateConfig('shardCount', parseInt(e.target.value))}
          min={1}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Application Name (Analytics)</label>
        <input
          type="text"
          value={config.applicationName || ''}
          onChange={(e) => updateConfig('applicationName', e.target.value)}
          placeholder="my-analytics-app"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
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
