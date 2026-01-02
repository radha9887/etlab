interface SqsOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const SqsOperatorConfig = ({ config, onChange }: SqsOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Queue URL *</label>
        <input
          type="text"
          value={config.sqsQueue || ''}
          onChange={(e) => updateConfig('sqsQueue', e.target.value)}
          placeholder="https://sqs.us-east-1.amazonaws.com/123456789/my-queue"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Message Body *</label>
        <textarea
          value={config.messageBody || ''}
          onChange={(e) => updateConfig('messageBody', e.target.value)}
          placeholder="Your message content here..."
          rows={4}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Message Group ID (FIFO queues)</label>
        <input
          type="text"
          value={config.messageGroupId || ''}
          onChange={(e) => updateConfig('messageGroupId', e.target.value)}
          placeholder="group-1"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Deduplication ID (FIFO queues)</label>
        <input
          type="text"
          value={config.messageDeduplicationId || ''}
          onChange={(e) => updateConfig('messageDeduplicationId', e.target.value)}
          placeholder="unique-id-{{ ts_nodash }}"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Delay Seconds</label>
        <input
          type="number"
          value={config.delaySeconds || 0}
          onChange={(e) => updateConfig('delaySeconds', parseInt(e.target.value))}
          min={0}
          max={900}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">0-900 seconds</p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Message Attributes (JSON)</label>
        <textarea
          value={config.messageAttributes || ''}
          onChange={(e) => updateConfig('messageAttributes', e.target.value)}
          placeholder='{"attr1": {"DataType": "String", "StringValue": "value1"}}'
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
    </div>
  );
};
