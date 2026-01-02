interface CosmosDbOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const CosmosDbOperatorConfig = ({ config, onChange }: CosmosDbOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'insert_document'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="insert_document">Insert Document</option>
          <option value="upsert_document">Upsert Document</option>
          <option value="delete_document">Delete Document</option>
          <option value="read_document">Read Document</option>
          <option value="query_documents">Query Documents</option>
          <option value="create_database">Create Database</option>
          <option value="delete_database">Delete Database</option>
          <option value="create_collection">Create Collection</option>
          <option value="delete_collection">Delete Collection</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Database Name *</label>
        <input
          type="text"
          value={config.databaseName || ''}
          onChange={(e) => updateConfig('databaseName', e.target.value)}
          placeholder="my-database"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {config.operation !== 'create_database' && config.operation !== 'delete_database' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Collection Name *</label>
          <input
            type="text"
            value={config.collectionName || ''}
            onChange={(e) => updateConfig('collectionName', e.target.value)}
            placeholder="my-collection"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      )}

      {config.operation === 'create_collection' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Partition Key *</label>
          <input
            type="text"
            value={config.partitionKey || ''}
            onChange={(e) => updateConfig('partitionKey', e.target.value)}
            placeholder="/partitionKey"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
          />
        </div>
      )}

      {(config.operation === 'insert_document' || config.operation === 'upsert_document') && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Document (JSON) *</label>
          <textarea
            value={config.document || ''}
            onChange={(e) => updateConfig('document', e.target.value)}
            placeholder='{"id": "doc1", "name": "example", "value": 123}'
            rows={5}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
          />
        </div>
      )}

      {(config.operation === 'delete_document' || config.operation === 'read_document') && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Document ID *</label>
            <input
              type="text"
              value={config.documentId || ''}
              onChange={(e) => updateConfig('documentId', e.target.value)}
              placeholder="doc1"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Partition Key Value *</label>
            <input
              type="text"
              value={config.partitionKeyValue || ''}
              onChange={(e) => updateConfig('partitionKeyValue', e.target.value)}
              placeholder="partition1"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </>
      )}

      {config.operation === 'query_documents' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Query *</label>
            <textarea
              value={config.query || ''}
              onChange={(e) => updateConfig('query', e.target.value)}
              placeholder="SELECT * FROM c WHERE c.status = @status"
              rows={3}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Query Parameters (JSON)</label>
            <textarea
              value={config.parameters || ''}
              onChange={(e) => updateConfig('parameters', e.target.value)}
              placeholder='[{"name": "@status", "value": "active"}]'
              rows={2}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Max Items</label>
            <input
              type="number"
              value={config.maxItems || ''}
              onChange={(e) => updateConfig('maxItems', parseInt(e.target.value) || undefined)}
              placeholder="100"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-xs text-gray-400 mb-1">Azure Cosmos DB Connection ID</label>
        <input
          type="text"
          value={config.azureCosmosConnId || ''}
          onChange={(e) => updateConfig('azureCosmosConnId', e.target.value)}
          placeholder="azure_cosmos_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>
    </div>
  );
};
