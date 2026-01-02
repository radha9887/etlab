interface DbtCloudOperatorConfigProps {
  config: {
    taskId: string;
    dbtCloudConnId?: string;
    jobId?: string;
    accountId?: string;
    waitForTermination?: boolean;
    timeoutSeconds?: number;
    checkInterval?: number;
    trigger?: 'run' | 'rerun' | 'cancel';
    cause?: string;
    steps?: string;
    schemaOverride?: string;
    additionalRunConfig?: string;
  };
  onChange: (updates: Partial<DbtCloudOperatorConfigProps['config']>) => void;
  etlPages: any[];
}

export const DbtCloudOperatorConfig = ({ config, onChange }: DbtCloudOperatorConfigProps) => {
  return (
    <div className="space-y-3">
      {/* dbt Cloud Connection */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">dbt Cloud Connection ID *</label>
        <input
          type="text"
          value={config.dbtCloudConnId || ''}
          onChange={(e) => onChange({ dbtCloudConnId: e.target.value })}
          placeholder="dbt_cloud_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Airflow connection with dbt Cloud API token
        </p>
      </div>

      {/* Account ID */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Account ID *</label>
        <input
          type="text"
          value={config.accountId || ''}
          onChange={(e) => onChange({ accountId: e.target.value })}
          placeholder="12345"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      {/* Job ID */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Job ID *</label>
        <input
          type="text"
          value={config.jobId || ''}
          onChange={(e) => onChange({ jobId: e.target.value })}
          placeholder="54321"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          dbt Cloud Job ID to trigger
        </p>
      </div>

      {/* Trigger Type */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Trigger Action</label>
        <select
          value={config.trigger || 'run'}
          onChange={(e) => onChange({ trigger: e.target.value as any })}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="run">Run Job</option>
          <option value="rerun">Rerun Failed Steps</option>
          <option value="cancel">Cancel Run</option>
        </select>
      </div>

      {/* Cause */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Run Cause</label>
        <input
          type="text"
          value={config.cause || ''}
          onChange={(e) => onChange({ cause: e.target.value })}
          placeholder="Triggered by Airflow {{ ds }}"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Steps Override */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Steps Override (JSON array)</label>
        <textarea
          value={config.steps || ''}
          onChange={(e) => onChange({ steps: e.target.value })}
          placeholder='["dbt run --select model_name", "dbt test"]'
          rows={2}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Override default job steps (optional)
        </p>
      </div>

      {/* Schema Override */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Schema Override</label>
        <input
          type="text"
          value={config.schemaOverride || ''}
          onChange={(e) => onChange({ schemaOverride: e.target.value })}
          placeholder="dbt_{{ ds_nodash }}"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      {/* Wait and Timing */}
      <div className="border-t border-gray-700 pt-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-400">Wait for Completion</span>
          <button
            onClick={() => onChange({ waitForTermination: !config.waitForTermination })}
            className={`w-10 h-5 rounded-full transition-colors
                      ${config.waitForTermination !== false ? 'bg-accent' : 'bg-gray-600'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transform transition-transform
                        ${config.waitForTermination !== false ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>

        {config.waitForTermination !== false && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Timeout (s)</label>
              <input
                type="number"
                value={config.timeoutSeconds || 3600}
                onChange={(e) => onChange({ timeoutSeconds: parseInt(e.target.value) || 3600 })}
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Check Interval (s)</label>
              <input
                type="number"
                value={config.checkInterval || 60}
                onChange={(e) => onChange({ checkInterval: parseInt(e.target.value) || 60 })}
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-md p-2">
        <p className="text-xs text-orange-400">
          {config.jobId ? (
            <>Triggers dbt Cloud job <strong>{config.jobId}</strong> in account {config.accountId || '?'}</>
          ) : (
            <>Configure dbt Cloud job to trigger</>
          )}
        </p>
      </div>
    </div>
  );
};
