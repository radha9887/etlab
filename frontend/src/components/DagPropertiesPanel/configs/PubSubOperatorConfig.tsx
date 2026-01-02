interface PubSubOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const PubSubOperatorConfig = ({ config, onChange }: PubSubOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'publish'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="publish">Publish Message</option>
          <option value="pull">Pull Messages</option>
          <option value="create_topic">Create Topic</option>
          <option value="delete_topic">Delete Topic</option>
          <option value="create_subscription">Create Subscription</option>
          <option value="delete_subscription">Delete Subscription</option>
        </select>
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

      <div>
        <label className="block text-xs text-gray-400 mb-1">Topic *</label>
        <input
          type="text"
          value={config.topic || ''}
          onChange={(e) => updateConfig('topic', e.target.value)}
          placeholder="my-topic"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {(config.operation === 'pull' || config.operation === 'create_subscription' || config.operation === 'delete_subscription') && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Subscription *</label>
          <input
            type="text"
            value={config.subscription || ''}
            onChange={(e) => updateConfig('subscription', e.target.value)}
            placeholder="my-subscription"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      )}

      {config.operation === 'publish' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Message Data *</label>
            <textarea
              value={config.messageData || ''}
              onChange={(e) => updateConfig('messageData', e.target.value)}
              placeholder='{"event": "trigger", "timestamp": "{{ ts }}"}'
              rows={3}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Attributes (JSON)</label>
            <textarea
              value={config.attributes || ''}
              onChange={(e) => updateConfig('attributes', e.target.value)}
              placeholder='{"key": "value"}'
              rows={2}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
            />
          </div>
        </>
      )}

      {config.operation === 'pull' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Max Messages</label>
            <input
              type="number"
              value={config.maxMessages || 10}
              onChange={(e) => updateConfig('maxMessages', parseInt(e.target.value))}
              min={1}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.ackMessages !== false}
              onChange={(e) => updateConfig('ackMessages', e.target.checked)}
              className="rounded border-gray-600 bg-gray-800"
            />
            <label className="text-xs text-gray-400">Acknowledge Messages</label>
          </div>
        </>
      )}

      {config.operation === 'create_subscription' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Ack Deadline (seconds)</label>
            <input
              type="number"
              value={config.ackDeadlineSeconds || 10}
              onChange={(e) => updateConfig('ackDeadlineSeconds', parseInt(e.target.value))}
              min={10}
              max={600}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Message Retention (days)</label>
            <input
              type="number"
              value={config.messageRetentionDays || 7}
              onChange={(e) => updateConfig('messageRetentionDays', parseInt(e.target.value))}
              min={1}
              max={7}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Push Endpoint (optional)</label>
            <input
              type="text"
              value={config.pushEndpoint || ''}
              onChange={(e) => updateConfig('pushEndpoint', e.target.value)}
              placeholder="https://my-service.run.app/push"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </>
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

      {config.operation === 'create_topic' && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.failIfExists || false}
            onChange={(e) => updateConfig('failIfExists', e.target.checked)}
            className="rounded border-gray-600 bg-gray-800"
          />
          <label className="text-xs text-gray-400">Fail if Exists</label>
        </div>
      )}
    </div>
  );
};
