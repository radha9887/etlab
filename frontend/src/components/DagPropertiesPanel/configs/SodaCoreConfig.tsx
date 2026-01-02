interface SodaCoreConfigProps {
  config: {
    taskId: string;
    configurationPath?: string;
    checksPath?: string;
    dataSource?: string;
    scanDefinition?: string;
    variables?: string;
    failOnError?: boolean;
    failOnWarn?: boolean;
    verbose?: boolean;
    sodaCloudApiKey?: string;
    sodaCloudApiKeySecret?: string;
  };
  onChange: (updates: Partial<SodaCoreConfigProps['config']>) => void;
  etlPages: any[];
}

export const SodaCoreConfig = ({ config, onChange }: SodaCoreConfigProps) => {
  return (
    <div className="space-y-3">
      {/* Configuration Path */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Configuration Path *</label>
        <input
          type="text"
          value={config.configurationPath || ''}
          onChange={(e) => onChange({ configurationPath: e.target.value })}
          placeholder="/opt/airflow/soda/configuration.yml"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          Path to Soda configuration file with data source connections
        </p>
      </div>

      {/* Checks Path */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Checks Path *</label>
        <input
          type="text"
          value={config.checksPath || ''}
          onChange={(e) => onChange({ checksPath: e.target.value })}
          placeholder="/opt/airflow/soda/checks/"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          Path to checks YAML file or directory
        </p>
      </div>

      {/* Data Source */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Data Source *</label>
        <input
          type="text"
          value={config.dataSource || ''}
          onChange={(e) => onChange({ dataSource: e.target.value })}
          placeholder="my_postgres"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Name of data source defined in configuration.yml
        </p>
      </div>

      {/* Scan Definition */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Scan Definition</label>
        <input
          type="text"
          value={config.scanDefinition || ''}
          onChange={(e) => onChange({ scanDefinition: e.target.value })}
          placeholder="daily_scan"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Variables */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Variables (JSON)</label>
        <textarea
          value={config.variables || ''}
          onChange={(e) => onChange({ variables: e.target.value })}
          placeholder='{"date": "{{ ds }}", "schema": "public"}'
          rows={2}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Variables to pass to Soda scan (Jinja supported)
        </p>
      </div>

      {/* Soda Cloud Integration */}
      <div className="border-t border-gray-700 pt-3">
        <label className="block text-xs text-gray-400 mb-2">Soda Cloud (Optional)</label>
        <div className="space-y-2">
          <input
            type="text"
            value={config.sodaCloudApiKey || ''}
            onChange={(e) => onChange({ sodaCloudApiKey: e.target.value })}
            placeholder="API Key (or use secret)"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
          <input
            type="text"
            value={config.sodaCloudApiKeySecret || ''}
            onChange={(e) => onChange({ sodaCloudApiKeySecret: e.target.value })}
            placeholder="Airflow secret name for API key"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Options */}
      <div className="border-t border-gray-700 pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Fail on Error</span>
          <button
            onClick={() => onChange({ failOnError: config.failOnError === false ? true : !config.failOnError })}
            className={`w-10 h-5 rounded-full transition-colors
                      ${config.failOnError !== false ? 'bg-accent' : 'bg-gray-600'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transform transition-transform
                        ${config.failOnError !== false ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Fail on Warning</span>
          <button
            onClick={() => onChange({ failOnWarn: !config.failOnWarn })}
            className={`w-10 h-5 rounded-full transition-colors
                      ${config.failOnWarn ? 'bg-accent' : 'bg-gray-600'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transform transition-transform
                        ${config.failOnWarn ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Verbose Logging</span>
          <button
            onClick={() => onChange({ verbose: !config.verbose })}
            className={`w-10 h-5 rounded-full transition-colors
                      ${config.verbose ? 'bg-accent' : 'bg-gray-600'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transform transition-transform
                        ${config.verbose ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-2">
        <p className="text-xs text-blue-400">
          {config.dataSource ? (
            <>Runs Soda scan on <strong>{config.dataSource}</strong> data source</>
          ) : (
            <>Configure Soda Core data quality scan</>
          )}
        </p>
      </div>
    </div>
  );
};
