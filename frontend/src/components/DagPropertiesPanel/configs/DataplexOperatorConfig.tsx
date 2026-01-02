interface DataplexOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const DataplexOperatorConfig = ({ config, onChange }: DataplexOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'create_task'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="create_task">Create Task</option>
          <option value="delete_task">Delete Task</option>
          <option value="run_task">Run Task</option>
          <option value="create_lake">Create Lake</option>
          <option value="delete_lake">Delete Lake</option>
          <option value="create_zone">Create Zone</option>
          <option value="delete_zone">Delete Zone</option>
          <option value="create_asset">Create Asset</option>
          <option value="delete_asset">Delete Asset</option>
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
        <label className="block text-xs text-gray-400 mb-1">Lake ID *</label>
        <input
          type="text"
          value={config.lakeId || ''}
          onChange={(e) => updateConfig('lakeId', e.target.value)}
          placeholder="my-lake"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {(config.operation?.includes('zone') || config.operation?.includes('asset')) && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Zone ID</label>
          <input
            type="text"
            value={config.zoneId || ''}
            onChange={(e) => updateConfig('zoneId', e.target.value)}
            placeholder="my-zone"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      )}

      {(config.operation === 'create_task' || config.operation === 'delete_task' || config.operation === 'run_task') && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Task ID *</label>
            <input
              type="text"
              value={config.taskId || ''}
              onChange={(e) => updateConfig('taskId', e.target.value)}
              placeholder="my-task"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </>
      )}

      {config.operation === 'create_task' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Task Type</label>
            <select
              value={config.taskType || 'SPARK'}
              onChange={(e) => updateConfig('taskType', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="SPARK">Spark</option>
              <option value="NOTEBOOK">Notebook</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Main File (GCS path)</label>
            <input
              type="text"
              value={config.mainFile || ''}
              onChange={(e) => updateConfig('mainFile', e.target.value)}
              placeholder="gs://bucket/scripts/main.py"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Arguments (one per line)</label>
            <textarea
              value={config.arguments || ''}
              onChange={(e) => updateConfig('arguments', e.target.value)}
              placeholder="--input=gs://bucket/input&#10;--output=gs://bucket/output"
              rows={3}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
            />
          </div>

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
        </>
      )}

      {config.operation === 'create_lake' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Lake Display Name</label>
          <input
            type="text"
            value={config.lakeDisplayName || ''}
            onChange={(e) => updateConfig('lakeDisplayName', e.target.value)}
            placeholder="My Data Lake"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      )}

      {config.operation === 'create_zone' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Zone Type</label>
            <select
              value={config.zoneType || 'RAW'}
              onChange={(e) => updateConfig('zoneType', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="RAW">Raw</option>
              <option value="CURATED">Curated</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Location Type</label>
            <select
              value={config.locationType || 'SINGLE_REGION'}
              onChange={(e) => updateConfig('locationType', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="SINGLE_REGION">Single Region</option>
              <option value="MULTI_REGION">Multi Region</option>
            </select>
          </div>
        </>
      )}

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
    </div>
  );
};
