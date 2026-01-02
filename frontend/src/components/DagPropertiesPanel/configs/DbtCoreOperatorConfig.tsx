interface DbtCoreOperatorConfigProps {
  config: {
    taskId: string;
    projectDir?: string;
    profilesDir?: string;
    target?: string;
    command?: 'run' | 'test' | 'build' | 'seed' | 'snapshot' | 'compile' | 'docs' | 'source' | 'custom';
    customCommand?: string;
    select?: string;
    exclude?: string;
    fullRefresh?: boolean;
    vars?: string;
    threads?: number;
    failFast?: boolean;
    warnError?: boolean;
    installDeps?: boolean;
  };
  onChange: (updates: Partial<DbtCoreOperatorConfigProps['config']>) => void;
  etlPages: any[];
}

export const DbtCoreOperatorConfig = ({ config, onChange }: DbtCoreOperatorConfigProps) => {
  return (
    <div className="space-y-3">
      {/* Project Directory */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Project Directory *</label>
        <input
          type="text"
          value={config.projectDir || ''}
          onChange={(e) => onChange({ projectDir: e.target.value })}
          placeholder="/opt/airflow/dbt/my_project"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          Path to dbt project containing dbt_project.yml
        </p>
      </div>

      {/* Profiles Directory */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Profiles Directory</label>
        <input
          type="text"
          value={config.profilesDir || ''}
          onChange={(e) => onChange({ profilesDir: e.target.value })}
          placeholder="/opt/airflow/dbt/profiles"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      {/* Target */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Target</label>
        <input
          type="text"
          value={config.target || ''}
          onChange={(e) => onChange({ target: e.target.value })}
          placeholder="prod"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Command Type */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Command *</label>
        <select
          value={config.command || 'run'}
          onChange={(e) => onChange({ command: e.target.value as any })}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="run">dbt run</option>
          <option value="test">dbt test</option>
          <option value="build">dbt build</option>
          <option value="seed">dbt seed</option>
          <option value="snapshot">dbt snapshot</option>
          <option value="compile">dbt compile</option>
          <option value="docs">dbt docs generate</option>
          <option value="source">dbt source freshness</option>
          <option value="custom">Custom Command</option>
        </select>
      </div>

      {/* Custom Command */}
      {config.command === 'custom' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Custom Command</label>
          <input
            type="text"
            value={config.customCommand || ''}
            onChange={(e) => onChange({ customCommand: e.target.value })}
            placeholder="dbt run --select model1 model2"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono"
          />
        </div>
      )}

      {/* Select Models */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Select (--select)</label>
        <input
          type="text"
          value={config.select || ''}
          onChange={(e) => onChange({ select: e.target.value })}
          placeholder="tag:daily,+downstream_model"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          Model selection syntax (e.g., tag:daily, +model_name, path:models/staging)
        </p>
      </div>

      {/* Exclude Models */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Exclude (--exclude)</label>
        <input
          type="text"
          value={config.exclude || ''}
          onChange={(e) => onChange({ exclude: e.target.value })}
          placeholder="tag:deprecated"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      {/* Variables */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Variables (--vars JSON)</label>
        <textarea
          value={config.vars || ''}
          onChange={(e) => onChange({ vars: e.target.value })}
          placeholder='{"execution_date": "{{ ds }}", "env": "prod"}'
          rows={2}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
        />
      </div>

      {/* Threads */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Threads</label>
        <input
          type="number"
          value={config.threads || 4}
          onChange={(e) => onChange({ threads: parseInt(e.target.value) || 4 })}
          min={1}
          max={64}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Options */}
      <div className="border-t border-gray-700 pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Full Refresh (--full-refresh)</span>
          <button
            onClick={() => onChange({ fullRefresh: !config.fullRefresh })}
            className={`w-10 h-5 rounded-full transition-colors
                      ${config.fullRefresh ? 'bg-accent' : 'bg-gray-600'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transform transition-transform
                        ${config.fullRefresh ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Fail Fast (--fail-fast)</span>
          <button
            onClick={() => onChange({ failFast: !config.failFast })}
            className={`w-10 h-5 rounded-full transition-colors
                      ${config.failFast ? 'bg-accent' : 'bg-gray-600'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transform transition-transform
                        ${config.failFast ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Warn as Error (--warn-error)</span>
          <button
            onClick={() => onChange({ warnError: !config.warnError })}
            className={`w-10 h-5 rounded-full transition-colors
                      ${config.warnError ? 'bg-accent' : 'bg-gray-600'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transform transition-transform
                        ${config.warnError ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Install Dependencies (dbt deps)</span>
          <button
            onClick={() => onChange({ installDeps: !config.installDeps })}
            className={`w-10 h-5 rounded-full transition-colors
                      ${config.installDeps ? 'bg-accent' : 'bg-gray-600'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transform transition-transform
                        ${config.installDeps ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-md p-2">
        <p className="text-xs text-purple-400 font-mono">
          dbt {config.command || 'run'}
          {config.select && ` --select ${config.select}`}
          {config.exclude && ` --exclude ${config.exclude}`}
          {config.fullRefresh && ' --full-refresh'}
          {config.failFast && ' --fail-fast'}
        </p>
      </div>
    </div>
  );
};
