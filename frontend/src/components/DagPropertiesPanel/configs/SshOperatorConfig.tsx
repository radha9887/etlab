interface SshOperatorConfigProps {
  config: {
    taskId: string;
    sshConnId?: string;
    command?: string;
    environment?: string;
    getOutput?: boolean;
    timeout?: number;
    cmdTimeout?: number;
    skipOnExitCode?: string;
    bannerTimeout?: number;
  };
  onChange: (updates: Partial<SshOperatorConfigProps['config']>) => void;
  etlPages: any[];
}

export const SshOperatorConfig = ({ config, onChange }: SshOperatorConfigProps) => {
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
          Airflow SSH connection to remote host
        </p>
      </div>

      {/* Command */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Command *</label>
        <textarea
          value={config.command || ''}
          onChange={(e) => onChange({ command: e.target.value })}
          placeholder="cd /app && ./run_script.sh --date {{ ds }}"
          rows={4}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Shell command to execute on remote host (Jinja templating supported)
        </p>
      </div>

      {/* Environment Variables */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Environment Variables (JSON)</label>
        <textarea
          value={config.environment || ''}
          onChange={(e) => onChange({ environment: e.target.value })}
          placeholder='{"ENV": "production", "DATE": "{{ ds }}"}'
          rows={2}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
        />
      </div>

      {/* Timeouts */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Connection Timeout (s)</label>
          <input
            type="number"
            value={config.timeout || 30}
            onChange={(e) => onChange({ timeout: parseInt(e.target.value) || 30 })}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Command Timeout (s)</label>
          <input
            type="number"
            value={config.cmdTimeout || 600}
            onChange={(e) => onChange({ cmdTimeout: parseInt(e.target.value) || 600 })}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Skip Exit Codes */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Skip on Exit Codes</label>
        <input
          type="text"
          value={config.skipOnExitCode || ''}
          onChange={(e) => onChange({ skipOnExitCode: e.target.value })}
          placeholder="0,1"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          Comma-separated exit codes that should not fail the task
        </p>
      </div>

      {/* Options */}
      <div className="border-t border-gray-700 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Capture Output (XCom)</span>
          <button
            onClick={() => onChange({ getOutput: !config.getOutput })}
            className={`w-10 h-5 rounded-full transition-colors
                      ${config.getOutput ? 'bg-accent' : 'bg-gray-600'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transform transition-transform
                        ${config.getOutput ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gray-500/10 border border-gray-500/30 rounded-md p-2">
        <p className="text-xs text-gray-400 font-mono truncate">
          {config.command ? (
            <>$ {config.command.split('\n')[0]}{config.command.includes('\n') && '...'}</>
          ) : (
            <>Configure SSH command to execute</>
          )}
        </p>
      </div>
    </div>
  );
};
