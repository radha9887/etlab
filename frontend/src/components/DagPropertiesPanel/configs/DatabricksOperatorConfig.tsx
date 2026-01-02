import { ConnectionPicker } from '../shared';

interface DatabricksOperatorConfigProps {
  config: {
    taskId: string;
    databricksConnId?: string;
    operationType?: 'run_now' | 'submit_run' | 'notebook';
    jobId?: string;
    jobName?: string;
    notebookPath?: string;
    notebookParams?: string;
    pythonFile?: string;
    pythonParams?: string;
    sparkSubmitParams?: string;
    newClusterSpec?: string;
    existingClusterId?: string;
    libraries?: string;
    waitForTermination?: boolean;
    timeoutSeconds?: number;
    pollingPeriodSeconds?: number;
  };
  onChange: (updates: Partial<DatabricksOperatorConfigProps['config']>) => void;
  etlPages: any[];
}

export const DatabricksOperatorConfig = ({ config, onChange }: DatabricksOperatorConfigProps) => {

  return (
    <div className="space-y-3">
      {/* Databricks Connection */}
      <ConnectionPicker
        value={config.databricksConnId || 'databricks_default'}
        onChange={(value) => onChange({ databricksConnId: value })}
        connectionType="databricks"
        label="Databricks Connection ID"
        required
        helpText="Connection with Databricks host and token. Create in Airflow Admin > Connections."
      />

      {/* Operation Type */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation Type *</label>
        <select
          value={config.operationType || 'run_now'}
          onChange={(e) => onChange({ operationType: e.target.value as any })}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="run_now">Run Existing Job</option>
          <option value="notebook">Run Notebook</option>
          <option value="submit_run">Submit New Run</option>
        </select>
      </div>

      {/* Run Existing Job */}
      {config.operationType === 'run_now' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Job ID *</label>
            <input
              type="text"
              value={config.jobId || ''}
              onChange={(e) => onChange({ jobId: e.target.value })}
              placeholder="123456"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              Databricks Job ID to trigger
            </p>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Notebook Parameters (JSON)</label>
            <textarea
              value={config.notebookParams || ''}
              onChange={(e) => onChange({ notebookParams: e.target.value })}
              placeholder='{"date": "{{ ds }}", "env": "prod"}'
              rows={2}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
            />
          </div>
        </>
      )}

      {/* Run Notebook */}
      {config.operationType === 'notebook' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Notebook Path *</label>
            <input
              type="text"
              value={config.notebookPath || ''}
              onChange={(e) => onChange({ notebookPath: e.target.value })}
              placeholder="/Users/user@company.com/my_notebook"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Notebook Parameters (JSON)</label>
            <textarea
              value={config.notebookParams || ''}
              onChange={(e) => onChange({ notebookParams: e.target.value })}
              placeholder='{"date": "{{ ds }}", "env": "prod"}'
              rows={3}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Existing Cluster ID</label>
            <input
              type="text"
              value={config.existingClusterId || ''}
              onChange={(e) => onChange({ existingClusterId: e.target.value })}
              placeholder="0123-456789-abcdefgh"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              Or leave empty to use new cluster config
            </p>
          </div>
        </>
      )}

      {/* Submit Run */}
      {config.operationType === 'submit_run' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Python File</label>
            <input
              type="text"
              value={config.pythonFile || ''}
              onChange={(e) => onChange({ pythonFile: e.target.value })}
              placeholder="dbfs:/scripts/my_script.py"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Python Parameters (JSON array)</label>
            <input
              type="text"
              value={config.pythonParams || ''}
              onChange={(e) => onChange({ pythonParams: e.target.value })}
              placeholder='["--input", "s3://bucket/data"]'
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono"
            />
          </div>
        </>
      )}

      {/* Libraries */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Libraries (JSON array)</label>
        <textarea
          value={config.libraries || ''}
          onChange={(e) => onChange({ libraries: e.target.value })}
          placeholder='[{"pypi": {"package": "pandas"}}, {"jar": "dbfs:/jars/my.jar"}]'
          rows={2}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
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
              <label className="block text-xs text-gray-400 mb-1">Poll Interval (s)</label>
              <input
                type="number"
                value={config.pollingPeriodSeconds || 30}
                onChange={(e) => onChange({ pollingPeriodSeconds: parseInt(e.target.value) || 30 })}
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
          {config.operationType === 'run_now' && config.jobId && (
            <>Triggers Databricks job <strong>{config.jobId}</strong></>
          )}
          {config.operationType === 'notebook' && config.notebookPath && (
            <>Runs notebook <strong>{config.notebookPath.split('/').pop()}</strong></>
          )}
          {config.operationType === 'submit_run' && (
            <>Submits new Databricks run</>
          )}
          {!config.operationType && <>Configure Databricks operation</>}
        </p>
      </div>
    </div>
  );
};
