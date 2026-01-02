interface DataflowOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const DataflowOperatorConfig = ({ config, onChange }: DataflowOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Job Type</label>
        <select
          value={config.jobType || 'template'}
          onChange={(e) => updateConfig('jobType', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="template">Classic Template</option>
          <option value="flex_template">Flex Template</option>
          <option value="streaming">Streaming Job</option>
          <option value="batch">Batch Job</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Job Name *</label>
        <input
          type="text"
          value={config.jobName || ''}
          onChange={(e) => updateConfig('jobName', e.target.value)}
          placeholder="my-dataflow-job"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {(config.jobType === 'template' || config.jobType === 'flex_template') && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Template Path *</label>
          <input
            type="text"
            value={config.templatePath || ''}
            onChange={(e) => updateConfig('templatePath', e.target.value)}
            placeholder="gs://dataflow-templates/..."
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
          />
        </div>
      )}

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
        <label className="block text-xs text-gray-400 mb-1">Temp Location</label>
        <input
          type="text"
          value={config.tempLocation || ''}
          onChange={(e) => updateConfig('tempLocation', e.target.value)}
          placeholder="gs://my-bucket/temp"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Staging Location</label>
        <input
          type="text"
          value={config.stagingLocation || ''}
          onChange={(e) => updateConfig('stagingLocation', e.target.value)}
          placeholder="gs://my-bucket/staging"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Parameters (JSON)</label>
        <textarea
          value={config.parameters || ''}
          onChange={(e) => updateConfig('parameters', e.target.value)}
          placeholder='{"inputTable": "project:dataset.table"}'
          rows={3}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Machine Type</label>
          <input
            type="text"
            value={config.machineType || ''}
            onChange={(e) => updateConfig('machineType', e.target.value)}
            placeholder="n1-standard-4"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Max Workers</label>
          <input
            type="number"
            value={config.maxWorkers || ''}
            onChange={(e) => updateConfig('maxWorkers', parseInt(e.target.value) || undefined)}
            placeholder="10"
            min={1}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Network</label>
        <input
          type="text"
          value={config.network || ''}
          onChange={(e) => updateConfig('network', e.target.value)}
          placeholder="default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Subnetwork</label>
        <input
          type="text"
          value={config.subnetwork || ''}
          onChange={(e) => updateConfig('subnetwork', e.target.value)}
          placeholder="regions/us-central1/subnetworks/default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
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

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={config.drainPipeline || false}
          onChange={(e) => updateConfig('drainPipeline', e.target.checked)}
          className="rounded border-gray-600 bg-gray-800"
        />
        <label className="text-xs text-gray-400">Drain Pipeline on Stop</label>
      </div>
    </div>
  );
};
