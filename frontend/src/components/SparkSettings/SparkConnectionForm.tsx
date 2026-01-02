import { useState } from 'react';
import type { SparkConnection } from '../../services/api';

interface SparkConnectionFormProps {
  connection?: SparkConnection | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const CONNECTION_TYPES = [
  { value: 'local', label: 'Local Mode', description: 'Run Spark locally (development)' },
  { value: 'livy', label: 'Apache Livy', description: 'Connect via Livy REST API' },
  { value: 'standalone', label: 'Standalone Cluster', description: 'Direct Spark cluster connection' },
];

export function SparkConnectionForm({ connection, onSave, onCancel }: SparkConnectionFormProps) {
  const [name, setName] = useState(connection?.name || '');
  const [connectionType, setConnectionType] = useState(connection?.connection_type || 'local');
  const [masterUrl, setMasterUrl] = useState(connection?.master_url || '');
  const [isDefault, setIsDefault] = useState(connection?.is_default || false);

  // Config options
  const [driverMemory, setDriverMemory] = useState(connection?.config?.['spark.driver.memory'] || '2g');
  const [executorMemory, setExecutorMemory] = useState(connection?.config?.['spark.executor.memory'] || '2g');
  const [executorCores, setExecutorCores] = useState(connection?.config?.['spark.executor.cores'] || '');
  const [numExecutors, setNumExecutors] = useState(connection?.config?.['spark.executor.instances'] || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const config: Record<string, any> = {};
    if (driverMemory) config['spark.driver.memory'] = driverMemory;
    if (executorMemory) config['spark.executor.memory'] = executorMemory;
    if (executorCores) config['spark.executor.cores'] = executorCores;
    if (numExecutors) config['spark.executor.instances'] = numExecutors;

    // For Livy, add specific config
    if (connectionType === 'livy') {
      if (driverMemory) config['driverMemory'] = driverMemory;
      if (executorMemory) config['executorMemory'] = executorMemory;
      if (executorCores) config['executorCores'] = parseInt(executorCores);
      if (numExecutors) config['numExecutors'] = parseInt(numExecutors);
    }

    onSave({
      name,
      connection_type: connectionType,
      master_url: getDefaultMasterUrl(),
      config,
      is_default: isDefault,
    });
  };

  const getDefaultMasterUrl = () => {
    if (masterUrl) return masterUrl;
    switch (connectionType) {
      case 'local':
        return 'local[*]';
      case 'livy':
        return 'http://localhost:8998';
      case 'standalone':
        return 'spark://localhost:7077';
      default:
        return '';
    }
  };

  const getPlaceholder = () => {
    switch (connectionType) {
      case 'local':
        return 'local[*] or local[4]';
      case 'livy':
        return 'http://livy-server:8998';
      case 'standalone':
        return 'spark://master:7077';
      default:
        return '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium text-white mb-4">
        {connection ? 'Edit Connection' : 'New Connection'}
      </h3>

      {/* Name */}
      <div>
        <label className="block text-sm text-gray-300 mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Spark Connection"
          required
          className="w-full bg-panel-light border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Connection Type */}
      <div>
        <label className="block text-sm text-gray-300 mb-1">Connection Type</label>
        <div className="grid grid-cols-3 gap-2">
          {CONNECTION_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setConnectionType(type.value)}
              className={`p-3 border rounded text-left ${
                connectionType === type.value
                  ? 'border-blue-500 bg-blue-500/20 text-white'
                  : 'border-gray-600 hover:bg-white/5 text-gray-300'
              }`}
            >
              <div className="font-medium text-sm">{type.label}</div>
              <div className="text-xs text-gray-400 mt-1">{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Master URL */}
      <div>
        <label className="block text-sm text-gray-300 mb-1">
          {connectionType === 'livy' ? 'Livy URL' : 'Master URL'}
        </label>
        <input
          type="text"
          value={masterUrl}
          onChange={(e) => setMasterUrl(e.target.value)}
          placeholder={getPlaceholder()}
          className="w-full bg-panel-light border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1">
          Leave empty for default: {getDefaultMasterUrl()}
        </p>
      </div>

      {/* Spark Config */}
      <div className="border-t border-gray-600 pt-4">
        <label className="block text-sm text-gray-300 mb-3">Spark Configuration</label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Driver Memory</label>
            <input
              type="text"
              value={driverMemory}
              onChange={(e) => setDriverMemory(e.target.value)}
              placeholder="2g"
              className="w-full bg-panel-light border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Executor Memory</label>
            <input
              type="text"
              value={executorMemory}
              onChange={(e) => setExecutorMemory(e.target.value)}
              placeholder="2g"
              className="w-full bg-panel-light border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          {connectionType !== 'local' && (
            <>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Executor Cores</label>
                <input
                  type="number"
                  value={executorCores}
                  onChange={(e) => setExecutorCores(e.target.value)}
                  placeholder="2"
                  className="w-full bg-panel-light border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Num Executors</label>
                <input
                  type="number"
                  value={numExecutors}
                  onChange={(e) => setNumExecutors(e.target.value)}
                  placeholder="2"
                  className="w-full bg-panel-light border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Default checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isDefault"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="w-4 h-4 rounded border-gray-600 bg-panel-light accent-blue-500"
        />
        <label htmlFor="isDefault" className="text-sm text-gray-300">Set as default connection</label>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t border-gray-600">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-300 border border-gray-600 rounded hover:bg-white/10"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          {connection ? 'Save Changes' : 'Create Connection'}
        </button>
      </div>
    </form>
  );
}
