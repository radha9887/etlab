
interface RedshiftOperatorConfigProps {
  config: {
    taskId: string;
    redshiftConnId?: string;
    sql?: string;
    database?: string;
    autocommit?: boolean;
    parameters?: string;
    operationType?: 'query' | 'copy' | 'unload';
    // COPY specific
    s3Bucket?: string;
    s3Key?: string;
    tableName?: string;
    copyOptions?: string;
    iamRole?: string;
    // UNLOAD specific
    unloadQuery?: string;
    unloadOptions?: string;
  };
  onChange: (updates: Partial<RedshiftOperatorConfigProps['config']>) => void;
  etlPages: any[];
}

export const RedshiftOperatorConfig = ({ config, onChange }: RedshiftOperatorConfigProps) => {

  return (
    <div className="space-y-3">
      {/* Redshift Connection */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Redshift Connection ID *</label>
        <input
          type="text"
          value={config.redshiftConnId || ''}
          onChange={(e) => onChange({ redshiftConnId: e.target.value })}
          placeholder="redshift_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Operation Type */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation Type</label>
        <select
          value={config.operationType || 'query'}
          onChange={(e) => onChange({ operationType: e.target.value as any })}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="query">Run SQL Query</option>
          <option value="copy">COPY from S3</option>
          <option value="unload">UNLOAD to S3</option>
        </select>
      </div>

      {/* SQL Query (for query type) */}
      {(config.operationType === 'query' || !config.operationType) && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">SQL Query *</label>
          <textarea
            value={config.sql || ''}
            onChange={(e) => onChange({ sql: e.target.value })}
            placeholder="SELECT * FROM my_schema.my_table WHERE date = '{{ ds }}'"
            rows={5}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
          />
        </div>
      )}

      {/* COPY from S3 */}
      {config.operationType === 'copy' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Target Table *</label>
            <input
              type="text"
              value={config.tableName || ''}
              onChange={(e) => onChange({ tableName: e.target.value })}
              placeholder="my_schema.my_table"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">S3 Bucket *</label>
              <input
                type="text"
                value={config.s3Bucket || ''}
                onChange={(e) => onChange({ s3Bucket: e.target.value })}
                placeholder="my-data-bucket"
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">S3 Key/Prefix *</label>
              <input
                type="text"
                value={config.s3Key || ''}
                onChange={(e) => onChange({ s3Key: e.target.value })}
                placeholder="data/input/"
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">COPY Options</label>
            <input
              type="text"
              value={config.copyOptions || ''}
              onChange={(e) => onChange({ copyOptions: e.target.value })}
              placeholder="CSV IGNOREHEADER 1 DATEFORMAT 'auto'"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono"
            />
          </div>
        </>
      )}

      {/* UNLOAD to S3 */}
      {config.operationType === 'unload' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">UNLOAD Query *</label>
            <textarea
              value={config.unloadQuery || ''}
              onChange={(e) => onChange({ unloadQuery: e.target.value })}
              placeholder="SELECT * FROM my_schema.my_table WHERE date = '{{ ds }}'"
              rows={4}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">S3 Bucket *</label>
              <input
                type="text"
                value={config.s3Bucket || ''}
                onChange={(e) => onChange({ s3Bucket: e.target.value })}
                placeholder="my-data-bucket"
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">S3 Key/Prefix *</label>
              <input
                type="text"
                value={config.s3Key || ''}
                onChange={(e) => onChange({ s3Key: e.target.value })}
                placeholder="data/output/"
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">UNLOAD Options</label>
            <input
              type="text"
              value={config.unloadOptions || ''}
              onChange={(e) => onChange({ unloadOptions: e.target.value })}
              placeholder="PARQUET ALLOWOVERWRITE"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono"
            />
          </div>
        </>
      )}

      {/* IAM Role */}
      {(config.operationType === 'copy' || config.operationType === 'unload') && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">IAM Role ARN *</label>
          <input
            type="text"
            value={config.iamRole || ''}
            onChange={(e) => onChange({ iamRole: e.target.value })}
            placeholder="arn:aws:iam::123456789:role/RedshiftCopyRole"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono"
          />
        </div>
      )}

      {/* Database & Options */}
      <div className="border-t border-gray-700 pt-3">
        <div className="mb-2">
          <label className="block text-xs text-gray-400 mb-1">Database</label>
          <input
            type="text"
            value={config.database || ''}
            onChange={(e) => onChange({ database: e.target.value })}
            placeholder="dev"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Autocommit</span>
          <button
            onClick={() => onChange({ autocommit: !config.autocommit })}
            className={`w-10 h-5 rounded-full transition-colors
                      ${config.autocommit ? 'bg-accent' : 'bg-gray-600'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transform transition-transform
                        ${config.autocommit ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-md p-2">
        <p className="text-xs text-orange-400">
          {config.operationType === 'copy' && config.tableName && (
            <>COPY data from S3 to <strong>{config.tableName}</strong></>
          )}
          {config.operationType === 'unload' && config.s3Bucket && (
            <>UNLOAD data to <strong>s3://{config.s3Bucket}/{config.s3Key}</strong></>
          )}
          {(config.operationType === 'query' || !config.operationType) && (
            <>Executes Redshift SQL query</>
          )}
        </p>
      </div>
    </div>
  );
};
