interface SageMakerOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const SageMakerOperatorConfig = ({ config, onChange }: SageMakerOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation Type</label>
        <select
          value={config.operationType || 'training'}
          onChange={(e) => updateConfig('operationType', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="training">Training Job</option>
          <option value="transform">Transform Job</option>
          <option value="processing">Processing Job</option>
          <option value="endpoint">Create Endpoint</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Job Name *</label>
        <input
          type="text"
          value={config.jobName || ''}
          onChange={(e) => updateConfig('jobName', e.target.value)}
          placeholder="my-training-job-{{ ts_nodash }}"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Container Image URI *</label>
        <input
          type="text"
          value={config.imageUri || ''}
          onChange={(e) => updateConfig('imageUri', e.target.value)}
          placeholder="123456789.dkr.ecr.us-east-1.amazonaws.com/my-image:latest"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">IAM Role ARN *</label>
        <input
          type="text"
          value={config.roleArn || ''}
          onChange={(e) => updateConfig('roleArn', e.target.value)}
          placeholder="arn:aws:iam::123456789:role/SageMakerRole"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Input Data S3 URI</label>
        <input
          type="text"
          value={config.inputDataUri || ''}
          onChange={(e) => updateConfig('inputDataUri', e.target.value)}
          placeholder="s3://my-bucket/training-data/"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Output Data S3 URI</label>
        <input
          type="text"
          value={config.outputDataUri || ''}
          onChange={(e) => updateConfig('outputDataUri', e.target.value)}
          placeholder="s3://my-bucket/model-output/"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Instance Type</label>
        <select
          value={config.instanceType || 'ml.m5.large'}
          onChange={(e) => updateConfig('instanceType', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="ml.m5.large">ml.m5.large</option>
          <option value="ml.m5.xlarge">ml.m5.xlarge</option>
          <option value="ml.m5.2xlarge">ml.m5.2xlarge</option>
          <option value="ml.c5.xlarge">ml.c5.xlarge</option>
          <option value="ml.p3.2xlarge">ml.p3.2xlarge (GPU)</option>
          <option value="ml.g4dn.xlarge">ml.g4dn.xlarge (GPU)</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Instance Count</label>
          <input
            type="number"
            value={config.instanceCount || 1}
            onChange={(e) => updateConfig('instanceCount', parseInt(e.target.value))}
            min={1}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Volume Size (GB)</label>
          <input
            type="number"
            value={config.volumeSize || 30}
            onChange={(e) => updateConfig('volumeSize', parseInt(e.target.value))}
            min={1}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Max Runtime (seconds)</label>
        <input
          type="number"
          value={config.maxRuntimeSeconds || 86400}
          onChange={(e) => updateConfig('maxRuntimeSeconds', parseInt(e.target.value))}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Hyperparameters (JSON)</label>
        <textarea
          value={config.hyperparameters || ''}
          onChange={(e) => updateConfig('hyperparameters', e.target.value)}
          placeholder='{"epochs": "10", "batch_size": "32"}'
          rows={3}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono"
        />
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

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={config.printLog !== false}
          onChange={(e) => updateConfig('printLog', e.target.checked)}
          className="rounded border-gray-600 bg-gray-800"
        />
        <label className="text-xs text-gray-400">Print Log</label>
      </div>
    </div>
  );
};
