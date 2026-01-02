interface AciOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const AciOperatorConfig = ({ config, onChange }: AciOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Resource Group *</label>
        <input
          type="text"
          value={config.resourceGroup || ''}
          onChange={(e) => updateConfig('resourceGroup', e.target.value)}
          placeholder="my-resource-group"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Container Group Name *</label>
        <input
          type="text"
          value={config.containerGroupName || ''}
          onChange={(e) => updateConfig('containerGroupName', e.target.value)}
          placeholder="my-container-group"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Container Name *</label>
        <input
          type="text"
          value={config.containerName || ''}
          onChange={(e) => updateConfig('containerName', e.target.value)}
          placeholder="my-container"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Image *</label>
        <input
          type="text"
          value={config.image || ''}
          onChange={(e) => updateConfig('image', e.target.value)}
          placeholder="mcr.microsoft.com/azuredocs/aci-helloworld"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Region</label>
        <select
          value={config.region || 'eastus'}
          onChange={(e) => updateConfig('region', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="eastus">East US</option>
          <option value="eastus2">East US 2</option>
          <option value="westus">West US</option>
          <option value="westus2">West US 2</option>
          <option value="centralus">Central US</option>
          <option value="northeurope">North Europe</option>
          <option value="westeurope">West Europe</option>
          <option value="southeastasia">Southeast Asia</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1">CPU (cores)</label>
          <input
            type="number"
            value={config.cpu || 1}
            onChange={(e) => updateConfig('cpu', parseFloat(e.target.value))}
            min={0.1}
            step={0.1}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Memory (GB)</label>
          <input
            type="number"
            value={config.memoryGb || 1.5}
            onChange={(e) => updateConfig('memoryGb', parseFloat(e.target.value))}
            min={0.1}
            step={0.1}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Command (optional)</label>
        <textarea
          value={config.command || ''}
          onChange={(e) => updateConfig('command', e.target.value)}
          placeholder='["python", "script.py", "--arg", "value"]'
          rows={2}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Environment Variables (JSON)</label>
        <textarea
          value={config.environmentVariables || ''}
          onChange={(e) => updateConfig('environmentVariables', e.target.value)}
          placeholder='{"VAR1": "value1", "VAR2": "value2"}'
          rows={3}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Registry Server (optional)</label>
        <input
          type="text"
          value={config.registryServer || ''}
          onChange={(e) => updateConfig('registryServer', e.target.value)}
          placeholder="myregistry.azurecr.io"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Azure Connection ID</label>
        <input
          type="text"
          value={config.azureConnId || ''}
          onChange={(e) => updateConfig('azureConnId', e.target.value)}
          placeholder="azure_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={config.removeOnError !== false}
          onChange={(e) => updateConfig('removeOnError', e.target.checked)}
          className="rounded border-gray-600 bg-gray-800"
        />
        <label className="text-xs text-gray-400">Remove container on error</label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={config.failIfExists || false}
          onChange={(e) => updateConfig('failIfExists', e.target.checked)}
          className="rounded border-gray-600 bg-gray-800"
        />
        <label className="text-xs text-gray-400">Fail if container exists</label>
      </div>
    </div>
  );
};
