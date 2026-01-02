interface AdlsOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const AdlsOperatorConfig = ({ config, onChange }: AdlsOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'upload'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="upload">Upload File</option>
          <option value="download">Download File</option>
          <option value="delete">Delete File/Directory</option>
          <option value="list">List Files</option>
          <option value="create_directory">Create Directory</option>
          <option value="copy">Copy File</option>
          <option value="move">Move/Rename File</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Storage Account Name *</label>
        <input
          type="text"
          value={config.storageAccountName || ''}
          onChange={(e) => updateConfig('storageAccountName', e.target.value)}
          placeholder="mystorageaccount"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">File System (Container) *</label>
        <input
          type="text"
          value={config.fileSystem || ''}
          onChange={(e) => updateConfig('fileSystem', e.target.value)}
          placeholder="my-container"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {(config.operation === 'upload' || config.operation === 'download' ||
        config.operation === 'delete' || config.operation === 'copy' || config.operation === 'move') && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            {config.operation === 'copy' || config.operation === 'move' ? 'Source Path *' : 'Path *'}
          </label>
          <input
            type="text"
            value={config.path || ''}
            onChange={(e) => updateConfig('path', e.target.value)}
            placeholder="folder/file.csv"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
          />
        </div>
      )}

      {(config.operation === 'copy' || config.operation === 'move') && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Destination Path *</label>
          <input
            type="text"
            value={config.destinationPath || ''}
            onChange={(e) => updateConfig('destinationPath', e.target.value)}
            placeholder="folder/new-file.csv"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
          />
        </div>
      )}

      {config.operation === 'list' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Directory Path</label>
            <input
              type="text"
              value={config.directoryPath || ''}
              onChange={(e) => updateConfig('directoryPath', e.target.value)}
              placeholder="folder/"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.recursive || false}
              onChange={(e) => updateConfig('recursive', e.target.checked)}
              className="rounded border-gray-600 bg-gray-800"
            />
            <label className="text-xs text-gray-400">Recursive</label>
          </div>
        </>
      )}

      {config.operation === 'create_directory' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Directory Path *</label>
          <input
            type="text"
            value={config.directoryPath || ''}
            onChange={(e) => updateConfig('directoryPath', e.target.value)}
            placeholder="new-folder"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
          />
        </div>
      )}

      {config.operation === 'upload' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Local File Path *</label>
          <input
            type="text"
            value={config.localPath || ''}
            onChange={(e) => updateConfig('localPath', e.target.value)}
            placeholder="/tmp/data.csv"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
          />
        </div>
      )}

      {config.operation === 'download' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Local Destination Path *</label>
          <input
            type="text"
            value={config.localPath || ''}
            onChange={(e) => updateConfig('localPath', e.target.value)}
            placeholder="/tmp/downloaded.csv"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
          />
        </div>
      )}

      <div>
        <label className="block text-xs text-gray-400 mb-1">Azure Data Lake Connection ID</label>
        <input
          type="text"
          value={config.azureDataLakeConnId || ''}
          onChange={(e) => updateConfig('azureDataLakeConnId', e.target.value)}
          placeholder="azure_data_lake_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {config.operation === 'upload' && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.overwrite || false}
            onChange={(e) => updateConfig('overwrite', e.target.checked)}
            className="rounded border-gray-600 bg-gray-800"
          />
          <label className="text-xs text-gray-400">Overwrite if exists</label>
        </div>
      )}
    </div>
  );
};
