interface SpannerOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const SpannerOperatorConfig = ({ config, onChange }: SpannerOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'execute_sql'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="execute_sql">Execute SQL</option>
          <option value="insert">Insert Data</option>
          <option value="update">Update Data</option>
          <option value="delete">Delete Data</option>
          <option value="create_instance">Create Instance</option>
          <option value="delete_instance">Delete Instance</option>
          <option value="create_database">Create Database</option>
          <option value="update_database">Update Database DDL</option>
          <option value="delete_database">Delete Database</option>
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
          placeholder="my-spanner-instance"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {!config.operation?.includes('instance') && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Database ID *</label>
          <input
            type="text"
            value={config.databaseId || ''}
            onChange={(e) => updateConfig('databaseId', e.target.value)}
            placeholder="my-database"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      )}

      {config.operation === 'execute_sql' && (
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

      {config.operation === 'insert' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Table Name *</label>
            <input
              type="text"
              value={config.tableName || ''}
              onChange={(e) => updateConfig('tableName', e.target.value)}
              placeholder="my_table"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Columns (comma-separated)</label>
            <input
              type="text"
              value={config.columns || ''}
              onChange={(e) => updateConfig('columns', e.target.value)}
              placeholder="id, name, email"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Values (JSON array)</label>
            <textarea
              value={config.values || ''}
              onChange={(e) => updateConfig('values', e.target.value)}
              placeholder='[["1", "John", "john@example.com"]]'
              rows={3}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
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
              placeholder="My Spanner Instance"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Instance Config *</label>
            <select
              value={config.instanceConfig || 'regional-us-central1'}
              onChange={(e) => updateConfig('instanceConfig', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="regional-us-central1">Regional US Central1</option>
              <option value="regional-us-east1">Regional US East1</option>
              <option value="regional-us-west1">Regional US West1</option>
              <option value="regional-europe-west1">Regional Europe West1</option>
              <option value="nam3">Multi-region NAM3</option>
              <option value="nam6">Multi-region NAM6</option>
              <option value="eur3">Multi-region EUR3</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Node Count</label>
            <input
              type="number"
              value={config.nodeCount || 1}
              onChange={(e) => updateConfig('nodeCount', parseInt(e.target.value))}
              min={1}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Processing Units (alternative to nodes)</label>
            <input
              type="number"
              value={config.processingUnits || ''}
              onChange={(e) => updateConfig('processingUnits', parseInt(e.target.value) || undefined)}
              min={100}
              step={100}
              placeholder="100-1000 (100 = 1/10 node)"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </>
      )}

      {config.operation === 'create_database' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">DDL Statements (one per line)</label>
          <textarea
            value={config.ddlStatements || ''}
            onChange={(e) => updateConfig('ddlStatements', e.target.value)}
            placeholder="CREATE TABLE users (id INT64, name STRING(100)) PRIMARY KEY (id)"
            rows={4}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
          />
        </div>
      )}

      {config.operation === 'update_database' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">DDL Statements (one per line)</label>
          <textarea
            value={config.ddlStatements || ''}
            onChange={(e) => updateConfig('ddlStatements', e.target.value)}
            placeholder="ALTER TABLE users ADD COLUMN email STRING(255)"
            rows={4}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
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
