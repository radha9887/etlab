interface GcsOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const GcsOperatorConfig = ({ config, onChange }: GcsOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'copy'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="copy">Copy Object</option>
          <option value="move">Move Object</option>
          <option value="delete">Delete Object</option>
          <option value="list">List Objects</option>
          <option value="create_bucket">Create Bucket</option>
          <option value="delete_bucket">Delete Bucket</option>
          <option value="sync">Sync Buckets</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Source Bucket *</label>
        <input
          type="text"
          value={config.sourceBucket || ''}
          onChange={(e) => updateConfig('sourceBucket', e.target.value)}
          placeholder="my-source-bucket"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Source Object</label>
        <input
          type="text"
          value={config.sourceObject || ''}
          onChange={(e) => updateConfig('sourceObject', e.target.value)}
          placeholder="path/to/object.parquet"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {(config.operation === 'copy' || config.operation === 'move' || config.operation === 'sync') && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Destination Bucket</label>
            <input
              type="text"
              value={config.destinationBucket || ''}
              onChange={(e) => updateConfig('destinationBucket', e.target.value)}
              placeholder="my-dest-bucket"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Destination Object</label>
            <input
              type="text"
              value={config.destinationObject || ''}
              onChange={(e) => updateConfig('destinationObject', e.target.value)}
              placeholder="path/to/dest.parquet"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </>
      )}

      {config.operation === 'list' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Prefix Filter</label>
          <input
            type="text"
            value={config.prefix || ''}
            onChange={(e) => updateConfig('prefix', e.target.value)}
            placeholder="data/2024/"
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
          checked={config.impersonateServiceAccount || false}
          onChange={(e) => updateConfig('impersonateServiceAccount', e.target.checked)}
          className="rounded border-gray-600 bg-gray-800"
        />
        <label className="text-xs text-gray-400">Impersonate Service Account</label>
      </div>
    </div>
  );
};
