interface S3SensorConfigProps {
  config: {
    taskId: string;
    bucketName?: string;
    bucketKey?: string;
    wildcardMatch?: boolean;
    awsConnId?: string;
    pokeIntervalSeconds?: number;
    timeoutSeconds?: number;
    deferrable?: boolean;
    exponentialBackoff?: boolean;
    softFail?: boolean;
  };
  onChange: (updates: Partial<S3SensorConfigProps['config']>) => void;
  etlPages: any[];
}

export const S3SensorConfig = ({ config, onChange }: S3SensorConfigProps) => {

  return (
    <div className="space-y-3">
      {/* Bucket Name */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Bucket Name *</label>
        <input
          type="text"
          value={config.bucketName || ''}
          onChange={(e) => onChange({ bucketName: e.target.value })}
          placeholder="my-data-bucket"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      {/* Bucket Key */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Key / Prefix *</label>
        <input
          type="text"
          value={config.bucketKey || ''}
          onChange={(e) => onChange({ bucketKey: e.target.value })}
          placeholder="data/input/file.csv or data/input/*"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      {/* Wildcard Match */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400">Wildcard Match</span>
          <p className="text-xs text-gray-500">Enable glob patterns in key</p>
        </div>
        <button
          onClick={() => onChange({ wildcardMatch: !config.wildcardMatch })}
          className={`w-10 h-5 rounded-full transition-colors
                    ${config.wildcardMatch ? 'bg-accent' : 'bg-gray-600'}`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transform transition-transform
                      ${config.wildcardMatch ? 'translate-x-5' : 'translate-x-0.5'}`}
          />
        </button>
      </div>

      {/* AWS Connection */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">AWS Connection ID</label>
        <input
          type="text"
          value={config.awsConnId || ''}
          onChange={(e) => onChange({ awsConnId: e.target.value })}
          placeholder="aws_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Airflow connection for AWS credentials
        </p>
      </div>

      {/* Timing Settings */}
      <div className="border-t border-gray-700 pt-3">
        <h4 className="text-xs font-medium text-gray-300 mb-2">Timing</h4>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Poke Interval (s)</label>
            <input
              type="number"
              value={config.pokeIntervalSeconds || 300}
              onChange={(e) => onChange({ pokeIntervalSeconds: parseInt(e.target.value) || 300 })}
              min={30}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Timeout (s)</label>
            <input
              type="number"
              value={config.timeoutSeconds || 7200}
              onChange={(e) => onChange({ timeoutSeconds: parseInt(e.target.value) || 7200 })}
              min={300}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Timeout: {Math.floor((config.timeoutSeconds || 7200) / 60)} minutes
        </p>
      </div>

      {/* Sensor Options */}
      <div className="border-t border-gray-700 pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400">Deferrable</span>
            <p className="text-xs text-gray-500">Use async triggerer</p>
          </div>
          <button
            onClick={() => onChange({ deferrable: !config.deferrable })}
            className={`w-10 h-5 rounded-full transition-colors
                      ${config.deferrable ? 'bg-accent' : 'bg-gray-600'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transform transition-transform
                        ${config.deferrable ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400">Exponential Backoff</span>
            <p className="text-xs text-gray-500">Increase poke interval</p>
          </div>
          <button
            onClick={() => onChange({ exponentialBackoff: !config.exponentialBackoff })}
            className={`w-10 h-5 rounded-full transition-colors
                      ${config.exponentialBackoff ? 'bg-accent' : 'bg-gray-600'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transform transition-transform
                        ${config.exponentialBackoff ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400">Soft Fail</span>
            <p className="text-xs text-gray-500">Mark as skipped on timeout</p>
          </div>
          <button
            onClick={() => onChange({ softFail: !config.softFail })}
            className={`w-10 h-5 rounded-full transition-colors
                      ${config.softFail ? 'bg-accent' : 'bg-gray-600'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transform transition-transform
                        ${config.softFail ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>
      </div>

      {/* Full S3 Path Preview */}
      {config.bucketName && config.bucketKey && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-2">
          <p className="text-xs text-blue-400 font-mono">
            s3://{config.bucketName}/{config.bucketKey}
          </p>
        </div>
      )}
    </div>
  );
};
