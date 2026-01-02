interface DataprocOperatorConfigProps {
  config: {
    taskId: string;
    projectId?: string;
    region?: string;
    clusterName?: string;
    jobType?: 'pyspark' | 'spark' | 'hive' | 'pig' | 'spark_sql';
    mainPythonFile?: string;
    mainJarFile?: string;
    mainClass?: string;
    queryFile?: string;
    query?: string;
    args?: string;
    pyFiles?: string;
    jarFiles?: string;
    gcpConnId?: string;
  };
  onChange: (updates: Partial<DataprocOperatorConfigProps['config']>) => void;
  etlPages: any[];
}

export const DataprocOperatorConfig = ({ config, onChange }: DataprocOperatorConfigProps) => {

  return (
    <div className="space-y-3">
      {/* Project ID */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">GCP Project ID *</label>
        <input
          type="text"
          value={config.projectId || ''}
          onChange={(e) => onChange({ projectId: e.target.value })}
          placeholder="my-gcp-project"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      {/* Region */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Region *</label>
        <input
          type="text"
          value={config.region || ''}
          onChange={(e) => onChange({ region: e.target.value })}
          placeholder="us-central1"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Cluster Name */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Cluster Name *</label>
        <input
          type="text"
          value={config.clusterName || ''}
          onChange={(e) => onChange({ clusterName: e.target.value })}
          placeholder="my-dataproc-cluster"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      {/* Job Type */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Job Type *</label>
        <select
          value={config.jobType || 'pyspark'}
          onChange={(e) => onChange({ jobType: e.target.value as any })}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="pyspark">PySpark</option>
          <option value="spark">Spark (Scala/Java)</option>
          <option value="spark_sql">Spark SQL</option>
          <option value="hive">Hive</option>
          <option value="pig">Pig</option>
        </select>
      </div>

      {/* Job Type Specific Fields */}
      {(config.jobType === 'pyspark' || !config.jobType) && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Main Python File *</label>
          <input
            type="text"
            value={config.mainPythonFile || ''}
            onChange={(e) => onChange({ mainPythonFile: e.target.value })}
            placeholder="gs://bucket/scripts/main.py"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono"
          />
        </div>
      )}

      {config.jobType === 'spark' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Main JAR File *</label>
            <input
              type="text"
              value={config.mainJarFile || ''}
              onChange={(e) => onChange({ mainJarFile: e.target.value })}
              placeholder="gs://bucket/jars/my-app.jar"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Main Class *</label>
            <input
              type="text"
              value={config.mainClass || ''}
              onChange={(e) => onChange({ mainClass: e.target.value })}
              placeholder="com.mycompany.MySparkApp"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono"
            />
          </div>
        </>
      )}

      {(config.jobType === 'spark_sql' || config.jobType === 'hive') && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Query</label>
          <textarea
            value={config.query || ''}
            onChange={(e) => onChange({ query: e.target.value })}
            placeholder="SELECT * FROM my_table WHERE date = '{{ ds }}'"
            rows={4}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
          />
        </div>
      )}

      {/* Arguments */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Arguments (JSON array)</label>
        <input
          type="text"
          value={config.args || ''}
          onChange={(e) => onChange({ args: e.target.value })}
          placeholder='["--input", "gs://bucket/input"]'
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      {/* Additional Files */}
      <div className="border-t border-gray-700 pt-3">
        <h4 className="text-xs font-medium text-gray-300 mb-2">Additional Files</h4>

        <div className="mb-2">
          <label className="block text-xs text-gray-400 mb-1">Python Files (comma-separated)</label>
          <input
            type="text"
            value={config.pyFiles || ''}
            onChange={(e) => onChange({ pyFiles: e.target.value })}
            placeholder="gs://bucket/libs/utils.py, gs://bucket/libs/helpers.py"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">JAR Files (comma-separated)</label>
          <input
            type="text"
            value={config.jarFiles || ''}
            onChange={(e) => onChange({ jarFiles: e.target.value })}
            placeholder="gs://bucket/jars/dependency.jar"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* GCP Connection */}
      <div className="border-t border-gray-700 pt-3">
        <label className="block text-xs text-gray-400 mb-1">GCP Connection ID</label>
        <input
          type="text"
          value={config.gcpConnId || ''}
          onChange={(e) => onChange({ gcpConnId: e.target.value })}
          placeholder="google_cloud_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Preview */}
      {config.clusterName && config.projectId && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-2">
          <p className="text-xs text-blue-400">
            Submits {config.jobType || 'pyspark'} job to <strong>{config.clusterName}</strong> in {config.region || 'us-central1'}
          </p>
        </div>
      )}
    </div>
  );
};
