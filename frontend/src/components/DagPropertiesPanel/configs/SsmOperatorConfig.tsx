interface SsmOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const SsmOperatorConfig = ({ config, onChange }: SsmOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation Type</label>
        <select
          value={config.operationType || 'run_command'}
          onChange={(e) => updateConfig('operationType', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="run_command">Run Command</option>
          <option value="get_parameter">Get Parameter</option>
          <option value="put_parameter">Put Parameter</option>
          <option value="start_automation">Start Automation</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Instance IDs (comma-separated)</label>
        <input
          type="text"
          value={config.instanceIds || ''}
          onChange={(e) => updateConfig('instanceIds', e.target.value)}
          placeholder="i-0abc123def456, i-0xyz789ghi012"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Document Name</label>
        <select
          value={config.documentName || 'AWS-RunShellScript'}
          onChange={(e) => updateConfig('documentName', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="AWS-RunShellScript">AWS-RunShellScript</option>
          <option value="AWS-RunPowerShellScript">AWS-RunPowerShellScript</option>
          <option value="AWS-RunPythonScript">AWS-RunPythonScript</option>
          <option value="AWS-ApplyAnsiblePlaybooks">AWS-ApplyAnsiblePlaybooks</option>
          <option value="AWS-RunRemoteScript">AWS-RunRemoteScript</option>
          <option value="custom">Custom Document</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Custom Document Name</label>
        <input
          type="text"
          value={config.customDocumentName || ''}
          onChange={(e) => updateConfig('customDocumentName', e.target.value)}
          placeholder="my-custom-document"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Commands</label>
        <textarea
          value={config.commands || ''}
          onChange={(e) => updateConfig('commands', e.target.value)}
          placeholder="echo 'Hello World'&#10;ls -la /var/log"
          rows={4}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">One command per line</p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Parameters (JSON)</label>
        <textarea
          value={config.parameters || ''}
          onChange={(e) => updateConfig('parameters', e.target.value)}
          placeholder='{"workingDirectory": ["/tmp"], "executionTimeout": ["3600"]}'
          rows={2}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Parameter Name (Get/Put)</label>
        <input
          type="text"
          value={config.parameterName || ''}
          onChange={(e) => updateConfig('parameterName', e.target.value)}
          placeholder="/my-app/config/database-url"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Parameter Value (Put)</label>
        <textarea
          value={config.parameterValue || ''}
          onChange={(e) => updateConfig('parameterValue', e.target.value)}
          placeholder="Parameter value..."
          rows={2}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Parameter Type</label>
        <select
          value={config.parameterType || 'String'}
          onChange={(e) => updateConfig('parameterType', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="String">String</option>
          <option value="StringList">String List</option>
          <option value="SecureString">Secure String</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Output S3 Bucket</label>
        <input
          type="text"
          value={config.outputS3Bucket || ''}
          onChange={(e) => updateConfig('outputS3Bucket', e.target.value)}
          placeholder="my-ssm-logs-bucket"
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
