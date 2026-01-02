interface SnsOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const SnsOperatorConfig = ({ config, onChange }: SnsOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Topic ARN *</label>
        <input
          type="text"
          value={config.targetArn || ''}
          onChange={(e) => updateConfig('targetArn', e.target.value)}
          placeholder="arn:aws:sns:us-east-1:123456789:my-topic"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Message *</label>
        <textarea
          value={config.message || ''}
          onChange={(e) => updateConfig('message', e.target.value)}
          placeholder="Your notification message here..."
          rows={4}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Subject (Optional)</label>
        <input
          type="text"
          value={config.subject || ''}
          onChange={(e) => updateConfig('subject', e.target.value)}
          placeholder="Notification Subject"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Message Structure</label>
        <select
          value={config.messageStructure || 'string'}
          onChange={(e) => updateConfig('messageStructure', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="string">String</option>
          <option value="json">JSON</option>
        </select>
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
