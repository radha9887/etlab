interface ServiceBusOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const ServiceBusOperatorConfig = ({ config, onChange }: ServiceBusOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'send_message'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="send_message">Send Message</option>
          <option value="receive_message">Receive Message</option>
          <option value="create_queue">Create Queue</option>
          <option value="delete_queue">Delete Queue</option>
          <option value="create_topic">Create Topic</option>
          <option value="delete_topic">Delete Topic</option>
          <option value="create_subscription">Create Subscription</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Fully Qualified Namespace *</label>
        <input
          type="text"
          value={config.fullyQualifiedNamespace || ''}
          onChange={(e) => updateConfig('fullyQualifiedNamespace', e.target.value)}
          placeholder="mynamespace.servicebus.windows.net"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      {(config.operation === 'send_message' || config.operation === 'receive_message' ||
        config.operation === 'create_queue' || config.operation === 'delete_queue') && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Queue Name *</label>
          <input
            type="text"
            value={config.queueName || ''}
            onChange={(e) => updateConfig('queueName', e.target.value)}
            placeholder="my-queue"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      )}

      {(config.operation === 'create_topic' || config.operation === 'delete_topic' ||
        config.operation === 'create_subscription') && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Topic Name *</label>
          <input
            type="text"
            value={config.topicName || ''}
            onChange={(e) => updateConfig('topicName', e.target.value)}
            placeholder="my-topic"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      )}

      {config.operation === 'create_subscription' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Subscription Name *</label>
          <input
            type="text"
            value={config.subscriptionName || ''}
            onChange={(e) => updateConfig('subscriptionName', e.target.value)}
            placeholder="my-subscription"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      )}

      {config.operation === 'send_message' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Message Body *</label>
            <textarea
              value={config.messageBody || ''}
              onChange={(e) => updateConfig('messageBody', e.target.value)}
              placeholder="Message content or JSON payload"
              rows={4}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Content Type</label>
            <select
              value={config.contentType || 'application/json'}
              onChange={(e) => updateConfig('contentType', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="application/json">application/json</option>
              <option value="text/plain">text/plain</option>
              <option value="application/xml">application/xml</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Message Properties (JSON)</label>
            <textarea
              value={config.messageProperties || ''}
              onChange={(e) => updateConfig('messageProperties', e.target.value)}
              placeholder='{"correlation_id": "123", "subject": "test"}'
              rows={2}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
            />
          </div>
        </>
      )}

      {config.operation === 'receive_message' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Max Messages</label>
            <input
              type="number"
              value={config.maxMessages || 1}
              onChange={(e) => updateConfig('maxMessages', parseInt(e.target.value))}
              min={1}
              max={100}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Max Wait Time (seconds)</label>
            <input
              type="number"
              value={config.maxWaitTime || 5}
              onChange={(e) => updateConfig('maxWaitTime', parseInt(e.target.value))}
              min={1}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-xs text-gray-400 mb-1">Azure Service Bus Connection ID</label>
        <input
          type="text"
          value={config.azureServiceBusConnId || ''}
          onChange={(e) => updateConfig('azureServiceBusConnId', e.target.value)}
          placeholder="azure_service_bus_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>
    </div>
  );
};
