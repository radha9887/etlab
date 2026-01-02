interface DataExplorerOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const DataExplorerOperatorConfig = ({ config, onChange }: DataExplorerOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'query'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="query">Run Query (KQL)</option>
          <option value="ingest">Ingest Data</option>
          <option value="control_command">Control Command</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Cluster URL *</label>
        <input
          type="text"
          value={config.clusterUrl || ''}
          onChange={(e) => updateConfig('clusterUrl', e.target.value)}
          placeholder="https://mycluster.eastus.kusto.windows.net"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Database Name *</label>
        <input
          type="text"
          value={config.database || ''}
          onChange={(e) => updateConfig('database', e.target.value)}
          placeholder="my-database"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {config.operation === 'query' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">KQL Query *</label>
            <textarea
              value={config.query || ''}
              onChange={(e) => updateConfig('query', e.target.value)}
              placeholder="MyTable | where Timestamp > ago(1h) | take 100"
              rows={5}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Query Parameters (JSON)</label>
            <textarea
              value={config.parameters || ''}
              onChange={(e) => updateConfig('parameters', e.target.value)}
              placeholder='{"param1": "value1"}'
              rows={2}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Timeout (seconds)</label>
            <input
              type="number"
              value={config.timeout || 300}
              onChange={(e) => updateConfig('timeout', parseInt(e.target.value))}
              min={1}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </>
      )}

      {config.operation === 'ingest' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Table Name *</label>
            <input
              type="text"
              value={config.tableName || ''}
              onChange={(e) => updateConfig('tableName', e.target.value)}
              placeholder="MyTable"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Source Type</label>
            <select
              value={config.sourceType || 'blob'}
              onChange={(e) => updateConfig('sourceType', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="blob">Azure Blob Storage</option>
              <option value="file">Local File</option>
              <option value="stream">Data Stream</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Source URI *</label>
            <input
              type="text"
              value={config.sourceUri || ''}
              onChange={(e) => updateConfig('sourceUri', e.target.value)}
              placeholder="https://storageaccount.blob.core.windows.net/container/file.csv"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Data Format</label>
            <select
              value={config.dataFormat || 'csv'}
              onChange={(e) => updateConfig('dataFormat', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="parquet">Parquet</option>
              <option value="avro">Avro</option>
              <option value="orc">ORC</option>
              <option value="tsv">TSV</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Ingestion Mapping (optional)</label>
            <input
              type="text"
              value={config.ingestionMapping || ''}
              onChange={(e) => updateConfig('ingestionMapping', e.target.value)}
              placeholder="MyMapping"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </>
      )}

      {config.operation === 'control_command' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Control Command *</label>
          <textarea
            value={config.command || ''}
            onChange={(e) => updateConfig('command', e.target.value)}
            placeholder=".show tables"
            rows={3}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
          />
        </div>
      )}

      <div>
        <label className="block text-xs text-gray-400 mb-1">Azure Data Explorer Connection ID</label>
        <input
          type="text"
          value={config.azureDataExplorerConnId || ''}
          onChange={(e) => updateConfig('azureDataExplorerConnId', e.target.value)}
          placeholder="azure_data_explorer_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>
    </div>
  );
};
