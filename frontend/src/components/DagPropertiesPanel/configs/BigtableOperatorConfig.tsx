interface BigtableOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const BigtableOperatorConfig = ({ config, onChange }: BigtableOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'create_table'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="create_table">Create Table</option>
          <option value="delete_table">Delete Table</option>
          <option value="update_cluster">Update Cluster</option>
          <option value="create_instance">Create Instance</option>
          <option value="delete_instance">Delete Instance</option>
          <option value="create_cluster">Create Cluster</option>
          <option value="delete_cluster">Delete Cluster</option>
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
        <label className="block text-xs text-gray-400 mb-1">Instance ID *</label>
        <input
          type="text"
          value={config.instanceId || ''}
          onChange={(e) => updateConfig('instanceId', e.target.value)}
          placeholder="my-bigtable-instance"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {(config.operation === 'create_table' || config.operation === 'delete_table') && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Table ID *</label>
          <input
            type="text"
            value={config.tableId || ''}
            onChange={(e) => updateConfig('tableId', e.target.value)}
            placeholder="my-table"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      )}

      {config.operation === 'create_table' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Column Families (JSON)</label>
            <textarea
              value={config.columnFamilies || ''}
              onChange={(e) => updateConfig('columnFamilies', e.target.value)}
              placeholder='{"cf1": {"max_versions": 1}, "cf2": {"max_age": "7d"}}'
              rows={3}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Initial Splits (row keys, one per line)</label>
            <textarea
              value={config.initialSplits || ''}
              onChange={(e) => updateConfig('initialSplits', e.target.value)}
              placeholder="row_key_1&#10;row_key_2&#10;row_key_3"
              rows={3}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
            />
          </div>
        </>
      )}

      {(config.operation === 'update_cluster' || config.operation === 'create_cluster' || config.operation === 'delete_cluster') && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Cluster ID *</label>
          <input
            type="text"
            value={config.clusterId || ''}
            onChange={(e) => updateConfig('clusterId', e.target.value)}
            placeholder="my-cluster"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      )}

      {(config.operation === 'update_cluster' || config.operation === 'create_cluster') && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Zone</label>
            <input
              type="text"
              value={config.zone || ''}
              onChange={(e) => updateConfig('zone', e.target.value)}
              placeholder="us-central1-b"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Serve Nodes</label>
            <input
              type="number"
              value={config.serveNodes || 3}
              onChange={(e) => updateConfig('serveNodes', parseInt(e.target.value))}
              min={1}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </>
      )}

      {config.operation === 'create_instance' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Display Name</label>
            <input
              type="text"
              value={config.displayName || ''}
              onChange={(e) => updateConfig('displayName', e.target.value)}
              placeholder="My Bigtable Instance"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Instance Type</label>
            <select
              value={config.instanceType || 'PRODUCTION'}
              onChange={(e) => updateConfig('instanceType', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="PRODUCTION">Production</option>
              <option value="DEVELOPMENT">Development</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Main Cluster ID *</label>
            <input
              type="text"
              value={config.mainClusterId || ''}
              onChange={(e) => updateConfig('mainClusterId', e.target.value)}
              placeholder="main-cluster"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Main Cluster Zone *</label>
            <input
              type="text"
              value={config.mainClusterZone || ''}
              onChange={(e) => updateConfig('mainClusterZone', e.target.value)}
              placeholder="us-central1-b"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Main Cluster Nodes</label>
            <input
              type="number"
              value={config.mainClusterNodes || 3}
              onChange={(e) => updateConfig('mainClusterNodes', parseInt(e.target.value))}
              min={1}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Storage Type</label>
            <select
              value={config.storageType || 'SSD'}
              onChange={(e) => updateConfig('storageType', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="SSD">SSD</option>
              <option value="HDD">HDD</option>
            </select>
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
    </div>
  );
};
