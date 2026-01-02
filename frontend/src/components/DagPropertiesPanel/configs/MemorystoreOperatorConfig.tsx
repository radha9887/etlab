interface MemorystoreOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const MemorystoreOperatorConfig = ({ config, onChange }: MemorystoreOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Service Type</label>
        <select
          value={config.serviceType || 'redis'}
          onChange={(e) => updateConfig('serviceType', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="redis">Redis</option>
          <option value="memcached">Memcached</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'create_instance'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="create_instance">Create Instance</option>
          <option value="delete_instance">Delete Instance</option>
          <option value="update_instance">Update Instance</option>
          <option value="failover">Failover (Redis)</option>
          <option value="export">Export (Redis)</option>
          <option value="import">Import (Redis)</option>
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
        <label className="block text-xs text-gray-400 mb-1">Location *</label>
        <input
          type="text"
          value={config.location || ''}
          onChange={(e) => updateConfig('location', e.target.value)}
          placeholder="us-central1"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Instance ID *</label>
        <input
          type="text"
          value={config.instanceId || ''}
          onChange={(e) => updateConfig('instanceId', e.target.value)}
          placeholder="my-redis-instance"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {config.operation === 'create_instance' && config.serviceType === 'redis' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Display Name</label>
            <input
              type="text"
              value={config.displayName || ''}
              onChange={(e) => updateConfig('displayName', e.target.value)}
              placeholder="My Redis Instance"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Tier</label>
            <select
              value={config.tier || 'BASIC'}
              onChange={(e) => updateConfig('tier', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="BASIC">Basic (no replication)</option>
              <option value="STANDARD_HA">Standard HA (replication)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Memory Size (GB) *</label>
            <input
              type="number"
              value={config.memorySizeGb || 1}
              onChange={(e) => updateConfig('memorySizeGb', parseInt(e.target.value))}
              min={1}
              max={300}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Redis Version</label>
            <select
              value={config.redisVersion || 'REDIS_7_0'}
              onChange={(e) => updateConfig('redisVersion', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="REDIS_7_0">Redis 7.0</option>
              <option value="REDIS_6_X">Redis 6.x</option>
              <option value="REDIS_5_0">Redis 5.0</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Authorized Network</label>
            <input
              type="text"
              value={config.authorizedNetwork || ''}
              onChange={(e) => updateConfig('authorizedNetwork', e.target.value)}
              placeholder="default"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Redis Configs (JSON)</label>
            <textarea
              value={config.redisConfigs || ''}
              onChange={(e) => updateConfig('redisConfigs', e.target.value)}
              placeholder='{"maxmemory-policy": "allkeys-lru"}'
              rows={2}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.authEnabled || false}
              onChange={(e) => updateConfig('authEnabled', e.target.checked)}
              className="rounded border-gray-600 bg-gray-800"
            />
            <label className="text-xs text-gray-400">Enable AUTH</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.transitEncryptionEnabled || false}
              onChange={(e) => updateConfig('transitEncryptionEnabled', e.target.checked)}
              className="rounded border-gray-600 bg-gray-800"
            />
            <label className="text-xs text-gray-400">Enable Transit Encryption (TLS)</label>
          </div>
        </>
      )}

      {config.operation === 'create_instance' && config.serviceType === 'memcached' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Display Name</label>
            <input
              type="text"
              value={config.displayName || ''}
              onChange={(e) => updateConfig('displayName', e.target.value)}
              placeholder="My Memcached Instance"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Node Count *</label>
            <input
              type="number"
              value={config.nodeCount || 1}
              onChange={(e) => updateConfig('nodeCount', parseInt(e.target.value))}
              min={1}
              max={20}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Node CPU Count</label>
            <input
              type="number"
              value={config.cpuCount || 1}
              onChange={(e) => updateConfig('cpuCount', parseInt(e.target.value))}
              min={1}
              max={32}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Node Memory (MB)</label>
            <input
              type="number"
              value={config.memoryMb || 1024}
              onChange={(e) => updateConfig('memoryMb', parseInt(e.target.value))}
              min={1024}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </>
      )}

      {(config.operation === 'export' || config.operation === 'import') && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">GCS URI *</label>
          <input
            type="text"
            value={config.gcsUri || ''}
            onChange={(e) => updateConfig('gcsUri', e.target.value)}
            placeholder="gs://bucket/redis-backup/dump.rdb"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
          />
        </div>
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
    </div>
  );
};
