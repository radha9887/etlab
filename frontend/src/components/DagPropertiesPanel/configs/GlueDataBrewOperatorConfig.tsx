interface GlueDataBrewOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const GlueDataBrewOperatorConfig = ({ config, onChange }: GlueDataBrewOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Job Type</label>
        <select
          value={config.jobType || 'recipe'}
          onChange={(e) => updateConfig('jobType', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="recipe">Recipe Job</option>
          <option value="profile">Profile Job</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Job Name *</label>
        <input
          type="text"
          value={config.jobName || ''}
          onChange={(e) => updateConfig('jobName', e.target.value)}
          placeholder="my-databrew-job"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Dataset Name</label>
        <input
          type="text"
          value={config.datasetName || ''}
          onChange={(e) => updateConfig('datasetName', e.target.value)}
          placeholder="my-dataset"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Recipe Name</label>
        <input
          type="text"
          value={config.recipeName || ''}
          onChange={(e) => updateConfig('recipeName', e.target.value)}
          placeholder="my-recipe"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Output Location (S3)</label>
        <input
          type="text"
          value={config.outputLocation || ''}
          onChange={(e) => updateConfig('outputLocation', e.target.value)}
          placeholder="s3://my-bucket/output/"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Output Format</label>
        <select
          value={config.outputFormat || 'CSV'}
          onChange={(e) => updateConfig('outputFormat', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="CSV">CSV</option>
          <option value="JSON">JSON</option>
          <option value="PARQUET">Parquet</option>
          <option value="AVRO">Avro</option>
          <option value="ORC">ORC</option>
          <option value="XML">XML</option>
          <option value="GLUEPARQUET">Glue Parquet</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Encryption Mode</label>
        <select
          value={config.encryptionMode || 'SSE-S3'}
          onChange={(e) => updateConfig('encryptionMode', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="SSE-S3">SSE-S3</option>
          <option value="SSE-KMS">SSE-KMS</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Role ARN</label>
        <input
          type="text"
          value={config.roleArn || ''}
          onChange={(e) => updateConfig('roleArn', e.target.value)}
          placeholder="arn:aws:iam::123456789:role/DataBrewRole"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Max Capacity</label>
          <input
            type="number"
            value={config.maxCapacity || 5}
            onChange={(e) => updateConfig('maxCapacity', parseInt(e.target.value))}
            min={1}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Timeout (min)</label>
          <input
            type="number"
            value={config.timeout || 2880}
            onChange={(e) => updateConfig('timeout', parseInt(e.target.value))}
            min={1}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">AWS Connection ID</label>
        <input
          type="text"
          value={config.awsConnId || ''}
          onChange={(e) => updateConfig('awsConnId', e.target.value)}
          placeholder="aws_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Region</label>
        <input
          type="text"
          value={config.regionName || ''}
          onChange={(e) => updateConfig('regionName', e.target.value)}
          placeholder="us-east-1"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={config.waitForCompletion !== false}
          onChange={(e) => updateConfig('waitForCompletion', e.target.checked)}
          className="rounded border-gray-600 bg-gray-800"
        />
        <label className="text-xs text-gray-400">Wait for Completion</label>
      </div>
    </div>
  );
};
