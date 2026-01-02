interface CloudSqlOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const CloudSqlOperatorConfig = ({ config, onChange }: CloudSqlOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'execute_query'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="execute_query">Execute Query</option>
          <option value="export">Export to GCS</option>
          <option value="import">Import from GCS</option>
          <option value="clone">Clone Instance</option>
          <option value="patch">Patch Instance</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Instance Name *</label>
        <input
          type="text"
          value={config.instanceName || ''}
          onChange={(e) => updateConfig('instanceName', e.target.value)}
          placeholder="my-cloudsql-instance"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
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
        <label className="block text-xs text-gray-400 mb-1">Database Type</label>
        <select
          value={config.databaseType || 'postgres'}
          onChange={(e) => updateConfig('databaseType', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="postgres">PostgreSQL</option>
          <option value="mysql">MySQL</option>
          <option value="sqlserver">SQL Server</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Database Name</label>
        <input
          type="text"
          value={config.database || ''}
          onChange={(e) => updateConfig('database', e.target.value)}
          placeholder="my_database"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {config.operation === 'execute_query' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">SQL Query *</label>
          <textarea
            value={config.sql || ''}
            onChange={(e) => updateConfig('sql', e.target.value)}
            placeholder="SELECT * FROM table WHERE ..."
            rows={4}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
          />
        </div>
      )}

      {config.operation === 'export' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Export URI *</label>
            <input
              type="text"
              value={config.exportUri || ''}
              onChange={(e) => updateConfig('exportUri', e.target.value)}
              placeholder="gs://bucket/export/data.sql"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Export Format</label>
            <select
              value={config.exportFormat || 'SQL'}
              onChange={(e) => updateConfig('exportFormat', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="SQL">SQL</option>
              <option value="CSV">CSV</option>
              <option value="BAK">BAK (SQL Server)</option>
            </select>
          </div>
        </>
      )}

      {config.operation === 'import' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Import URI *</label>
            <input
              type="text"
              value={config.importUri || ''}
              onChange={(e) => updateConfig('importUri', e.target.value)}
              placeholder="gs://bucket/import/data.sql"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Table (for CSV)</label>
            <input
              type="text"
              value={config.importTable || ''}
              onChange={(e) => updateConfig('importTable', e.target.value)}
              placeholder="target_table"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </>
      )}

      {config.operation === 'clone' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Clone Instance Name *</label>
          <input
            type="text"
            value={config.cloneInstanceName || ''}
            onChange={(e) => updateConfig('cloneInstanceName', e.target.value)}
            placeholder="cloned-instance"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
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

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={config.useProxy || false}
          onChange={(e) => updateConfig('useProxy', e.target.checked)}
          className="rounded border-gray-600 bg-gray-800"
        />
        <label className="text-xs text-gray-400">Use Cloud SQL Proxy</label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={config.useSsl || false}
          onChange={(e) => updateConfig('useSsl', e.target.checked)}
          className="rounded border-gray-600 bg-gray-800"
        />
        <label className="text-xs text-gray-400">Use SSL</label>
      </div>
    </div>
  );
};
