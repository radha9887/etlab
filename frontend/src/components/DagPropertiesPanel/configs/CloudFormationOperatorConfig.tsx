interface CloudFormationOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const CloudFormationOperatorConfig = ({ config, onChange }: CloudFormationOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'create'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="create">Create Stack</option>
          <option value="update">Update Stack</option>
          <option value="delete">Delete Stack</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Stack Name *</label>
        <input
          type="text"
          value={config.stackName || ''}
          onChange={(e) => updateConfig('stackName', e.target.value)}
          placeholder="my-cloudformation-stack"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Template URL</label>
        <input
          type="text"
          value={config.templateUrl || ''}
          onChange={(e) => updateConfig('templateUrl', e.target.value)}
          placeholder="https://s3.amazonaws.com/my-bucket/template.yaml"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Template Body (YAML/JSON)</label>
        <textarea
          value={config.templateBody || ''}
          onChange={(e) => updateConfig('templateBody', e.target.value)}
          placeholder="AWSTemplateFormatVersion: '2010-09-09'..."
          rows={4}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">Either URL or Body required</p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Parameters (JSON)</label>
        <textarea
          value={config.parameters || ''}
          onChange={(e) => updateConfig('parameters', e.target.value)}
          placeholder='[{"ParameterKey": "Param1", "ParameterValue": "Value1"}]'
          rows={2}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Capabilities (JSON array)</label>
        <input
          type="text"
          value={config.capabilities || ''}
          onChange={(e) => updateConfig('capabilities', e.target.value)}
          placeholder='["CAPABILITY_IAM", "CAPABILITY_NAMED_IAM"]'
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Role ARN (Optional)</label>
        <input
          type="text"
          value={config.roleArn || ''}
          onChange={(e) => updateConfig('roleArn', e.target.value)}
          placeholder="arn:aws:iam::123456789:role/CloudFormationRole"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
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
