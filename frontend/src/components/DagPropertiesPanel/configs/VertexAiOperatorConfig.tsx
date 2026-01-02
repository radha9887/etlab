interface VertexAiOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const VertexAiOperatorConfig = ({ config, onChange }: VertexAiOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'create_training_job'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="create_training_job">Create Training Job</option>
          <option value="create_custom_job">Create Custom Job</option>
          <option value="run_pipeline">Run Pipeline Job</option>
          <option value="create_endpoint">Create Endpoint</option>
          <option value="deploy_model">Deploy Model</option>
          <option value="batch_prediction">Batch Prediction</option>
          <option value="create_dataset">Create Dataset</option>
          <option value="hyperparameter_tuning">Hyperparameter Tuning</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Project ID</label>
        <input
          type="text"
          value={config.projectId || ''}
          onChange={(e) => updateConfig('projectId', e.target.value)}
          placeholder="my-gcp-project"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Region *</label>
        <input
          type="text"
          value={config.region || ''}
          onChange={(e) => updateConfig('region', e.target.value)}
          placeholder="us-central1"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Display Name *</label>
        <input
          type="text"
          value={config.displayName || ''}
          onChange={(e) => updateConfig('displayName', e.target.value)}
          placeholder="my-vertex-job"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {(config.operation === 'create_training_job' || config.operation === 'create_custom_job') && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Container Image URI *</label>
            <input
              type="text"
              value={config.containerUri || ''}
              onChange={(e) => updateConfig('containerUri', e.target.value)}
              placeholder="gcr.io/project/training-image:latest"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Machine Type</label>
            <select
              value={config.machineType || 'n1-standard-4'}
              onChange={(e) => updateConfig('machineType', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="n1-standard-4">n1-standard-4</option>
              <option value="n1-standard-8">n1-standard-8</option>
              <option value="n1-standard-16">n1-standard-16</option>
              <option value="n1-highmem-8">n1-highmem-8</option>
              <option value="n1-highmem-16">n1-highmem-16</option>
              <option value="a2-highgpu-1g">a2-highgpu-1g (1 A100)</option>
              <option value="a2-highgpu-2g">a2-highgpu-2g (2 A100)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Accelerator Type</label>
            <select
              value={config.acceleratorType || 'none'}
              onChange={(e) => updateConfig('acceleratorType', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="none">None</option>
              <option value="NVIDIA_TESLA_T4">NVIDIA Tesla T4</option>
              <option value="NVIDIA_TESLA_V100">NVIDIA Tesla V100</option>
              <option value="NVIDIA_TESLA_A100">NVIDIA Tesla A100</option>
              <option value="NVIDIA_L4">NVIDIA L4</option>
            </select>
          </div>

          {config.acceleratorType && config.acceleratorType !== 'none' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Accelerator Count</label>
              <input
                type="number"
                value={config.acceleratorCount || 1}
                onChange={(e) => updateConfig('acceleratorCount', parseInt(e.target.value))}
                min={1}
                max={8}
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-400 mb-1">Replica Count</label>
            <input
              type="number"
              value={config.replicaCount || 1}
              onChange={(e) => updateConfig('replicaCount', parseInt(e.target.value))}
              min={1}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Arguments (one per line)</label>
            <textarea
              value={config.args || ''}
              onChange={(e) => updateConfig('args', e.target.value)}
              placeholder="--epochs=10&#10;--batch-size=32"
              rows={3}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
            />
          </div>
        </>
      )}

      {config.operation === 'run_pipeline' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Template Path *</label>
            <input
              type="text"
              value={config.templatePath || ''}
              onChange={(e) => updateConfig('templatePath', e.target.value)}
              placeholder="gs://bucket/pipeline.json"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Pipeline Parameters (JSON)</label>
            <textarea
              value={config.pipelineParams || ''}
              onChange={(e) => updateConfig('pipelineParams', e.target.value)}
              placeholder='{"input_data": "gs://bucket/data"}'
              rows={3}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
            />
          </div>
        </>
      )}

      {config.operation === 'deploy_model' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Model ID *</label>
            <input
              type="text"
              value={config.modelId || ''}
              onChange={(e) => updateConfig('modelId', e.target.value)}
              placeholder="123456789"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Endpoint ID</label>
            <input
              type="text"
              value={config.endpointId || ''}
              onChange={(e) => updateConfig('endpointId', e.target.value)}
              placeholder="Leave empty to create new"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Traffic Split (%)</label>
            <input
              type="number"
              value={config.trafficSplit || 100}
              onChange={(e) => updateConfig('trafficSplit', parseInt(e.target.value))}
              min={0}
              max={100}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </>
      )}

      {config.operation === 'batch_prediction' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Model ID *</label>
            <input
              type="text"
              value={config.modelId || ''}
              onChange={(e) => updateConfig('modelId', e.target.value)}
              placeholder="123456789"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Input URI *</label>
            <input
              type="text"
              value={config.inputUri || ''}
              onChange={(e) => updateConfig('inputUri', e.target.value)}
              placeholder="gs://bucket/input/"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Output URI *</label>
            <input
              type="text"
              value={config.outputUri || ''}
              onChange={(e) => updateConfig('outputUri', e.target.value)}
              placeholder="gs://bucket/output/"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-xs text-gray-400 mb-1">Service Account</label>
        <input
          type="text"
          value={config.serviceAccount || ''}
          onChange={(e) => updateConfig('serviceAccount', e.target.value)}
          placeholder="sa@project.iam.gserviceaccount.com"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">GCP Connection ID</label>
        <input
          type="text"
          value={config.gcpConnId || ''}
          onChange={(e) => updateConfig('gcpConnId', e.target.value)}
          placeholder="google_cloud_default"
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
