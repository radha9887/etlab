interface SecretsManagerOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const SecretsManagerOperatorConfig = ({ config, onChange }: SecretsManagerOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'get'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="get">Get Secret Value</option>
          <option value="create">Create Secret</option>
          <option value="update">Update Secret</option>
          <option value="delete">Delete Secret</option>
          <option value="rotate">Rotate Secret</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Secret Name / ARN</label>
        <input
          type="text"
          value={config.secretId || ''}
          onChange={(e) => updateConfig('secretId', e.target.value)}
          placeholder="my-secret-name"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Secret String (JSON)</label>
        <textarea
          value={config.secretString || ''}
          onChange={(e) => updateConfig('secretString', e.target.value)}
          placeholder='{"username": "admin", "password": "secret123"}'
          rows={4}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">For create/update operations</p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Description</label>
        <input
          type="text"
          value={config.description || ''}
          onChange={(e) => updateConfig('description', e.target.value)}
          placeholder="Database credentials for production"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">KMS Key ID (Optional)</label>
        <input
          type="text"
          value={config.kmsKeyId || ''}
          onChange={(e) => updateConfig('kmsKeyId', e.target.value)}
          placeholder="alias/my-key or arn:aws:kms:..."
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
