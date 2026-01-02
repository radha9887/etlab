interface SparkSubmitConfigProps {
  config: {
    taskId: string;
    application?: string;
    sparkConfig?: {
      driverMemory?: string;
      executorMemory?: string;
      executorCores?: number;
      numExecutors?: number;
    };
    applicationArgs?: string[];
    sparkArgs?: string[];
  };
  onChange: (updates: Partial<SparkSubmitConfigProps['config']>) => void;
  etlPages: any[];
}

export const SparkSubmitConfig = ({ config, onChange }: SparkSubmitConfigProps) => {
  const sparkConfig = config.sparkConfig || {};

  return (
    <div className="space-y-3">
      {/* Application Path */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Application Path *</label>
        <input
          type="text"
          value={config.application || ''}
          onChange={(e) => onChange({ application: e.target.value })}
          placeholder="/path/to/app.py or s3://bucket/app.py"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      {/* Spark Config Section */}
      <div className="border-t border-gray-700 pt-3">
        <h4 className="text-xs font-medium text-gray-300 mb-2">Spark Configuration</h4>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Driver Memory</label>
            <input
              type="text"
              value={sparkConfig.driverMemory || ''}
              onChange={(e) => onChange({
                sparkConfig: { ...sparkConfig, driverMemory: e.target.value }
              })}
              placeholder="2g"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Executor Memory</label>
            <input
              type="text"
              value={sparkConfig.executorMemory || ''}
              onChange={(e) => onChange({
                sparkConfig: { ...sparkConfig, executorMemory: e.target.value }
              })}
              placeholder="4g"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Executor Cores</label>
            <input
              type="number"
              value={sparkConfig.executorCores || ''}
              onChange={(e) => onChange({
                sparkConfig: { ...sparkConfig, executorCores: parseInt(e.target.value) || undefined }
              })}
              placeholder="2"
              min={1}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Num Executors</label>
            <input
              type="number"
              value={sparkConfig.numExecutors || ''}
              onChange={(e) => onChange({
                sparkConfig: { ...sparkConfig, numExecutors: parseInt(e.target.value) || undefined }
              })}
              placeholder="4"
              min={1}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Application Arguments */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Application Arguments</label>
        <textarea
          value={(config.applicationArgs || []).join('\n')}
          onChange={(e) => onChange({
            applicationArgs: e.target.value.split('\n').filter(Boolean)
          })}
          placeholder="One argument per line"
          rows={3}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono"
        />
      </div>
    </div>
  );
};
