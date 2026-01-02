interface WorkflowsOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const WorkflowsOperatorConfig = ({ config, onChange }: WorkflowsOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'create_execution'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="create_execution">Create Execution</option>
          <option value="cancel_execution">Cancel Execution</option>
          <option value="create_workflow">Create Workflow</option>
          <option value="update_workflow">Update Workflow</option>
          <option value="delete_workflow">Delete Workflow</option>
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
        <label className="block text-xs text-gray-400 mb-1">Location *</label>
        <input
          type="text"
          value={config.location || ''}
          onChange={(e) => updateConfig('location', e.target.value)}
          placeholder="us-central1"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Workflow ID *</label>
        <input
          type="text"
          value={config.workflowId || ''}
          onChange={(e) => updateConfig('workflowId', e.target.value)}
          placeholder="my-workflow"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {config.operation === 'create_execution' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Execution Arguments (JSON)</label>
            <textarea
              value={config.arguments || ''}
              onChange={(e) => updateConfig('arguments', e.target.value)}
              placeholder='{"input": "value", "config": {...}}'
              rows={4}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Call Log Level</label>
            <select
              value={config.callLogLevel || 'LOG_NONE'}
              onChange={(e) => updateConfig('callLogLevel', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="LOG_NONE">None</option>
              <option value="LOG_ERRORS_ONLY">Errors Only</option>
              <option value="LOG_ALL_CALLS">All Calls</option>
            </select>
          </div>
        </>
      )}

      {config.operation === 'cancel_execution' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Execution ID *</label>
          <input
            type="text"
            value={config.executionId || ''}
            onChange={(e) => updateConfig('executionId', e.target.value)}
            placeholder="12345678-1234-1234-1234-123456789012"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
          />
        </div>
      )}

      {(config.operation === 'create_workflow' || config.operation === 'update_workflow') && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Workflow Source (YAML) *</label>
            <textarea
              value={config.sourceContents || ''}
              onChange={(e) => updateConfig('sourceContents', e.target.value)}
              placeholder="main:&#10;  params: [input]&#10;  steps:&#10;    - step1:&#10;        call: http.get&#10;        args:&#10;          url: https://..."
              rows={8}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Description</label>
            <input
              type="text"
              value={config.description || ''}
              onChange={(e) => updateConfig('description', e.target.value)}
              placeholder="My serverless workflow"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
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

          <div>
            <label className="block text-xs text-gray-400 mb-1">Labels (JSON)</label>
            <textarea
              value={config.labels || ''}
              onChange={(e) => updateConfig('labels', e.target.value)}
              placeholder='{"env": "production", "team": "data"}'
              rows={2}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
            />
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

      {config.operation === 'create_execution' && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.waitForCompletion !== false}
            onChange={(e) => updateConfig('waitForCompletion', e.target.checked)}
            className="rounded border-gray-600 bg-gray-800"
          />
          <label className="text-xs text-gray-400">Wait for Completion</label>
        </div>
      )}
    </div>
  );
};
