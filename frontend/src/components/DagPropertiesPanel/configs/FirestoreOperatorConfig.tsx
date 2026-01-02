interface FirestoreOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const FirestoreOperatorConfig = ({ config, onChange }: FirestoreOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'export'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="export">Export to GCS</option>
          <option value="import">Import from GCS</option>
          <option value="create_document">Create Document</option>
          <option value="update_document">Update Document</option>
          <option value="delete_document">Delete Document</option>
          <option value="create_database">Create Database</option>
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
        <label className="block text-xs text-gray-400 mb-1">Database ID</label>
        <input
          type="text"
          value={config.databaseId || '(default)'}
          onChange={(e) => updateConfig('databaseId', e.target.value)}
          placeholder="(default)"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {(config.operation === 'export' || config.operation === 'import') && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">GCS Bucket URI *</label>
            <input
              type="text"
              value={config.bucketUri || ''}
              onChange={(e) => updateConfig('bucketUri', e.target.value)}
              placeholder="gs://my-bucket/firestore-backup"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Collection IDs (comma-separated, empty for all)</label>
            <input
              type="text"
              value={config.collectionIds || ''}
              onChange={(e) => updateConfig('collectionIds', e.target.value)}
              placeholder="users, orders, products"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Namespace IDs (comma-separated)</label>
            <input
              type="text"
              value={config.namespaceIds || ''}
              onChange={(e) => updateConfig('namespaceIds', e.target.value)}
              placeholder="Leave empty for default namespace"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </>
      )}

      {(config.operation === 'create_document' || config.operation === 'update_document' || config.operation === 'delete_document') && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Collection Path *</label>
            <input
              type="text"
              value={config.collectionPath || ''}
              onChange={(e) => updateConfig('collectionPath', e.target.value)}
              placeholder="users"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Document ID</label>
            <input
              type="text"
              value={config.documentId || ''}
              onChange={(e) => updateConfig('documentId', e.target.value)}
              placeholder="Leave empty for auto-generated ID"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </>
      )}

      {(config.operation === 'create_document' || config.operation === 'update_document') && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Document Data (JSON) *</label>
          <textarea
            value={config.documentData || ''}
            onChange={(e) => updateConfig('documentData', e.target.value)}
            placeholder='{"name": "John", "email": "john@example.com"}'
            rows={4}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
          />
        </div>
      )}

      {config.operation === 'update_document' && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.merge || false}
            onChange={(e) => updateConfig('merge', e.target.checked)}
            className="rounded border-gray-600 bg-gray-800"
          />
          <label className="text-xs text-gray-400">Merge with Existing Data</label>
        </div>
      )}

      {config.operation === 'create_database' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">New Database ID *</label>
            <input
              type="text"
              value={config.newDatabaseId || ''}
              onChange={(e) => updateConfig('newDatabaseId', e.target.value)}
              placeholder="my-new-database"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Location *</label>
            <select
              value={config.location || 'nam5'}
              onChange={(e) => updateConfig('location', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="nam5">Multi-region US (nam5)</option>
              <option value="eur3">Multi-region Europe (eur3)</option>
              <option value="us-central1">US Central1</option>
              <option value="us-east1">US East1</option>
              <option value="europe-west1">Europe West1</option>
              <option value="asia-east1">Asia East1</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Database Type</label>
            <select
              value={config.databaseType || 'FIRESTORE_NATIVE'}
              onChange={(e) => updateConfig('databaseType', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="FIRESTORE_NATIVE">Firestore Native</option>
              <option value="DATASTORE_MODE">Datastore Mode</option>
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
