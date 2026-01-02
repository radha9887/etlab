interface SynapseOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
  etlPages?: any[];
}

export const SynapseOperatorConfig = ({ config, onChange }: SynapseOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      {/* Azure Synapse Connection */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Azure Synapse Connection ID *</label>
        <input
          type="text"
          value={config.azureSynapseConnId || ''}
          onChange={(e) => updateConfig('azureSynapseConnId', e.target.value)}
          placeholder="azure_synapse_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Operation Type */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation Type</label>
        <select
          value={config.operationType || 'sql'}
          onChange={(e) => updateConfig('operationType', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="sql">SQL Query</option>
          <option value="spark">Spark Job</option>
          <option value="pipeline">Run Pipeline</option>
        </select>
      </div>

      {/* SQL Operation */}
      {(config.operationType === 'sql' || !config.operationType) && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">SQL Query *</label>
            <textarea
              value={config.sql || ''}
              onChange={(e) => updateConfig('sql', e.target.value)}
              placeholder="SELECT * FROM dbo.my_table WHERE date = '{{ ds }}'"
              rows={5}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Database</label>
              <input
                type="text"
                value={config.database || ''}
                onChange={(e) => updateConfig('database', e.target.value)}
                placeholder="mydb"
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Schema</label>
              <input
                type="text"
                value={config.schema || ''}
                onChange={(e) => updateConfig('schema', e.target.value)}
                placeholder="dbo"
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Autocommit</span>
            <button
              onClick={() => updateConfig('autocommit', !config.autocommit)}
              className={`w-10 h-5 rounded-full transition-colors
                        ${config.autocommit ? 'bg-accent' : 'bg-gray-600'}`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transform transition-transform
                          ${config.autocommit ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </button>
          </div>
        </>
      )}

      {/* Spark Operation */}
      {config.operationType === 'spark' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Spark Pool Name *</label>
            <input
              type="text"
              value={config.sparkPoolName || ''}
              onChange={(e) => updateConfig('sparkPoolName', e.target.value)}
              placeholder="mysparkpool"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Spark Job Name *</label>
            <input
              type="text"
              value={config.sparkJobName || ''}
              onChange={(e) => updateConfig('sparkJobName', e.target.value)}
              placeholder="my_spark_job"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Spark Job Definition (JSON)</label>
            <textarea
              value={config.sparkJobDefinition || ''}
              onChange={(e) => updateConfig('sparkJobDefinition', e.target.value)}
              placeholder='{"file": "abfss://container@storage.dfs.core.windows.net/script.py"}'
              rows={4}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Executor Size</label>
              <select
                value={config.executorSize || 'Medium'}
                onChange={(e) => updateConfig('executorSize', e.target.value)}
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none"
              >
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
                <option value="XLarge">XLarge</option>
                <option value="XXLarge">XXLarge</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Executor Count</label>
              <input
                type="number"
                value={config.executorCount || 2}
                onChange={(e) => updateConfig('executorCount', parseInt(e.target.value) || 2)}
                min={1}
                max={200}
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none"
              />
            </div>
          </div>
        </>
      )}

      {/* Pipeline Operation */}
      {config.operationType === 'pipeline' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Pipeline Name *</label>
            <input
              type="text"
              value={config.pipelineName || ''}
              onChange={(e) => updateConfig('pipelineName', e.target.value)}
              placeholder="my_synapse_pipeline"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Pipeline Parameters (JSON)</label>
            <textarea
              value={config.pipelineParameters || ''}
              onChange={(e) => updateConfig('pipelineParameters', e.target.value)}
              placeholder='{"date": "{{ ds }}", "env": "prod"}'
              rows={3}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400">Wait for Completion</span>
              <p className="text-xs text-gray-500">Block until pipeline finishes</p>
            </div>
            <button
              onClick={() => updateConfig('waitForTermination', !config.waitForTermination)}
              className={`w-10 h-5 rounded-full transition-colors
                        ${config.waitForTermination !== false ? 'bg-accent' : 'bg-gray-600'}`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transform transition-transform
                          ${config.waitForTermination !== false ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </button>
          </div>
        </>
      )}

      {/* Preview */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-2">
        <p className="text-xs text-blue-400">
          {(config.operationType === 'sql' || !config.operationType) && (
            <>Executes SQL on Azure Synapse</>
          )}
          {config.operationType === 'spark' && config.sparkPoolName && (
            <>Runs Spark job on <strong>{config.sparkPoolName}</strong></>
          )}
          {config.operationType === 'pipeline' && config.pipelineName && (
            <>Triggers pipeline <strong>{config.pipelineName}</strong></>
          )}
        </p>
      </div>
    </div>
  );
};
