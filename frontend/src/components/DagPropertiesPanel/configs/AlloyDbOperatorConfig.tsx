interface AlloyDbOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const AlloyDbOperatorConfig = ({ config, onChange }: AlloyDbOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'create_cluster'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="create_cluster">Create Cluster</option>
          <option value="delete_cluster">Delete Cluster</option>
          <option value="create_instance">Create Instance</option>
          <option value="delete_instance">Delete Instance</option>
          <option value="create_backup">Create Backup</option>
          <option value="restore_cluster">Restore Cluster from Backup</option>
          <option value="create_user">Create User</option>
          <option value="delete_user">Delete User</option>
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
        <label className="block text-xs text-gray-400 mb-1">Cluster ID *</label>
        <input
          type="text"
          value={config.clusterId || ''}
          onChange={(e) => updateConfig('clusterId', e.target.value)}
          placeholder="my-alloydb-cluster"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {(config.operation === 'create_instance' || config.operation === 'delete_instance') && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Instance ID *</label>
          <input
            type="text"
            value={config.instanceId || ''}
            onChange={(e) => updateConfig('instanceId', e.target.value)}
            placeholder="my-primary-instance"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      )}

      {config.operation === 'create_cluster' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Network *</label>
            <input
              type="text"
              value={config.network || ''}
              onChange={(e) => updateConfig('network', e.target.value)}
              placeholder="projects/project/global/networks/default"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Initial User Password *</label>
            <input
              type="password"
              value={config.initialUserPassword || ''}
              onChange={(e) => updateConfig('initialUserPassword', e.target.value)}
              placeholder="Strong password for postgres user"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Database Version</label>
            <select
              value={config.databaseVersion || 'POSTGRES_15'}
              onChange={(e) => updateConfig('databaseVersion', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="POSTGRES_15">PostgreSQL 15</option>
              <option value="POSTGRES_14">PostgreSQL 14</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.automatedBackupEnabled !== false}
              onChange={(e) => updateConfig('automatedBackupEnabled', e.target.checked)}
              className="rounded border-gray-600 bg-gray-800"
            />
            <label className="text-xs text-gray-400">Enable Automated Backups</label>
          </div>
        </>
      )}

      {config.operation === 'create_instance' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Instance Type</label>
            <select
              value={config.instanceType || 'PRIMARY'}
              onChange={(e) => updateConfig('instanceType', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="PRIMARY">Primary</option>
              <option value="READ_POOL">Read Pool</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Machine Type</label>
            <select
              value={config.machineType || 'db-custom-2-8192'}
              onChange={(e) => updateConfig('machineType', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="db-custom-2-8192">2 vCPU, 8 GB</option>
              <option value="db-custom-4-16384">4 vCPU, 16 GB</option>
              <option value="db-custom-8-32768">8 vCPU, 32 GB</option>
              <option value="db-custom-16-65536">16 vCPU, 64 GB</option>
              <option value="db-custom-32-131072">32 vCPU, 128 GB</option>
            </select>
          </div>

          {config.instanceType === 'READ_POOL' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Node Count</label>
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
          )}

          <div>
            <label className="block text-xs text-gray-400 mb-1">Availability Type</label>
            <select
              value={config.availabilityType || 'REGIONAL'}
              onChange={(e) => updateConfig('availabilityType', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="REGIONAL">Regional (High Availability)</option>
              <option value="ZONAL">Zonal</option>
            </select>
          </div>
        </>
      )}

      {config.operation === 'create_backup' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Backup ID *</label>
          <input
            type="text"
            value={config.backupId || ''}
            onChange={(e) => updateConfig('backupId', e.target.value)}
            placeholder="my-backup-001"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      )}

      {config.operation === 'restore_cluster' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Backup ID *</label>
            <input
              type="text"
              value={config.backupId || ''}
              onChange={(e) => updateConfig('backupId', e.target.value)}
              placeholder="my-backup-001"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">New Cluster ID *</label>
            <input
              type="text"
              value={config.newClusterId || ''}
              onChange={(e) => updateConfig('newClusterId', e.target.value)}
              placeholder="restored-cluster"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </>
      )}

      {(config.operation === 'create_user' || config.operation === 'delete_user') && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Username *</label>
            <input
              type="text"
              value={config.username || ''}
              onChange={(e) => updateConfig('username', e.target.value)}
              placeholder="app_user"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          {config.operation === 'create_user' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Password *</label>
              <input
                type="password"
                value={config.userPassword || ''}
                onChange={(e) => updateConfig('userPassword', e.target.value)}
                placeholder="User password"
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none"
              />
            </div>
          )}
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
    </div>
  );
};
