interface SftpOperatorConfigProps {
  config: {
    taskId: string;
    sshConnId?: string;
    operation?: 'get' | 'put' | 'delete' | 'list';
    remotePath?: string;
    localPath?: string;
    createIntermediateDirs?: boolean;
    confirmRead?: boolean;
    filePattern?: string;
  };
  onChange: (updates: Partial<SftpOperatorConfigProps['config']>) => void;
  etlPages: any[];
}

export const SftpOperatorConfig = ({ config, onChange }: SftpOperatorConfigProps) => {
  return (
    <div className="space-y-3">
      {/* SSH Connection */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">SSH Connection ID *</label>
        <input
          type="text"
          value={config.sshConnId || ''}
          onChange={(e) => onChange({ sshConnId: e.target.value })}
          placeholder="ssh_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Airflow SSH connection with SFTP credentials
        </p>
      </div>

      {/* Operation Type */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation *</label>
        <select
          value={config.operation || 'get'}
          onChange={(e) => onChange({ operation: e.target.value as any })}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="get">Download (GET)</option>
          <option value="put">Upload (PUT)</option>
          <option value="delete">Delete</option>
          <option value="list">List Directory</option>
        </select>
      </div>

      {/* Remote Path */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Remote Path *</label>
        <input
          type="text"
          value={config.remotePath || ''}
          onChange={(e) => onChange({ remotePath: e.target.value })}
          placeholder="/remote/path/to/file.csv"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      {/* Local Path - for get/put operations */}
      {(config.operation === 'get' || config.operation === 'put') && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Local Path *</label>
          <input
            type="text"
            value={config.localPath || ''}
            onChange={(e) => onChange({ localPath: e.target.value })}
            placeholder="/tmp/local/file.csv"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono"
          />
        </div>
      )}

      {/* File Pattern - for list operation */}
      {config.operation === 'list' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">File Pattern</label>
          <input
            type="text"
            value={config.filePattern || ''}
            onChange={(e) => onChange({ filePattern: e.target.value })}
            placeholder="*.csv"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono"
          />
        </div>
      )}

      {/* Options */}
      <div className="border-t border-gray-700 pt-3 space-y-2">
        {config.operation === 'put' && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Create Intermediate Dirs</span>
            <button
              onClick={() => onChange({ createIntermediateDirs: !config.createIntermediateDirs })}
              className={`w-10 h-5 rounded-full transition-colors
                        ${config.createIntermediateDirs ? 'bg-accent' : 'bg-gray-600'}`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transform transition-transform
                          ${config.createIntermediateDirs ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </button>
          </div>
        )}

        {config.operation === 'get' && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Confirm Read</span>
            <button
              onClick={() => onChange({ confirmRead: config.confirmRead === false ? true : !config.confirmRead })}
              className={`w-10 h-5 rounded-full transition-colors
                        ${config.confirmRead !== false ? 'bg-accent' : 'bg-gray-600'}`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transform transition-transform
                          ${config.confirmRead !== false ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </button>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-md p-2">
        <p className="text-xs text-cyan-400">
          {config.operation === 'get' && config.remotePath && (
            <>Downloads <strong>{config.remotePath.split('/').pop()}</strong> from SFTP server</>
          )}
          {config.operation === 'put' && config.localPath && (
            <>Uploads <strong>{config.localPath.split('/').pop()}</strong> to SFTP server</>
          )}
          {config.operation === 'delete' && config.remotePath && (
            <>Deletes <strong>{config.remotePath}</strong> from SFTP server</>
          )}
          {config.operation === 'list' && (
            <>Lists files in remote directory</>
          )}
          {!config.operation && <>Configure SFTP operation</>}
        </p>
      </div>
    </div>
  );
};
