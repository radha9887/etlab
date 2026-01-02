interface EventBridgeOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const EventBridgeOperatorConfig = ({ config, onChange }: EventBridgeOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Event Bus Name</label>
        <input
          type="text"
          value={config.eventBusName || ''}
          onChange={(e) => updateConfig('eventBusName', e.target.value)}
          placeholder="default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">Use 'default' for the default event bus</p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Source *</label>
        <input
          type="text"
          value={config.source || ''}
          onChange={(e) => updateConfig('source', e.target.value)}
          placeholder="my.application"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Detail Type *</label>
        <input
          type="text"
          value={config.detailType || ''}
          onChange={(e) => updateConfig('detailType', e.target.value)}
          placeholder="MyEventType"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Event Detail (JSON) *</label>
        <textarea
          value={config.detail || ''}
          onChange={(e) => updateConfig('detail', e.target.value)}
          placeholder='{"key1": "value1", "key2": "value2"}'
          rows={4}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Resources (JSON array)</label>
        <input
          type="text"
          value={config.resources || ''}
          onChange={(e) => updateConfig('resources', e.target.value)}
          placeholder='["arn:aws:ec2:us-east-1:123456789:instance/i-12345"]'
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
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
