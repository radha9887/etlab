interface AppFlowOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const AppFlowOperatorConfig = ({ config, onChange }: AppFlowOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'run'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="run">Run Flow</option>
          <option value="describe">Describe Flow</option>
          <option value="sensor">Flow Status Sensor</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Flow Name *</label>
        <input
          type="text"
          value={config.flowName || ''}
          onChange={(e) => updateConfig('flowName', e.target.value)}
          placeholder="my-appflow-flow"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Source Connector Type</label>
        <select
          value={config.sourceConnector || ''}
          onChange={(e) => updateConfig('sourceConnector', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="">Select source...</option>
          <option value="Salesforce">Salesforce</option>
          <option value="ServiceNow">ServiceNow</option>
          <option value="Zendesk">Zendesk</option>
          <option value="Slack">Slack</option>
          <option value="GoogleAnalytics">Google Analytics</option>
          <option value="Marketo">Marketo</option>
          <option value="S3">Amazon S3</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Destination Connector Type</label>
        <select
          value={config.destConnector || ''}
          onChange={(e) => updateConfig('destConnector', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="">Select destination...</option>
          <option value="S3">Amazon S3</option>
          <option value="Redshift">Amazon Redshift</option>
          <option value="Snowflake">Snowflake</option>
          <option value="EventBridge">EventBridge</option>
          <option value="Salesforce">Salesforce</option>
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
