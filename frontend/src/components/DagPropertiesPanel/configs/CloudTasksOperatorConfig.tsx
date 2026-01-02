interface CloudTasksOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const CloudTasksOperatorConfig = ({ config, onChange }: CloudTasksOperatorConfigProps) => {
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
          <option value="create_queue">Create Queue</option>
          <option value="delete_queue">Delete Queue</option>
          <option value="pause_queue">Pause Queue</option>
          <option value="resume_queue">Resume Queue</option>
          <option value="purge_queue">Purge Queue</option>
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
        <label className="block text-xs text-gray-400 mb-1">Queue ID *</label>
        <input
          type="text"
          value={config.queueId || ''}
          onChange={(e) => updateConfig('queueId', e.target.value)}
          placeholder="my-queue"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {(config.operation === 'create_task' || config.operation === 'delete_task') && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Task ID</label>
          <input
            type="text"
            value={config.taskId || ''}
            onChange={(e) => updateConfig('taskId', e.target.value)}
            placeholder="Leave empty for auto-generated"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      )}

      {config.operation === 'create_task' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Task Type</label>
            <select
              value={config.taskType || 'http'}
              onChange={(e) => updateConfig('taskType', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="http">HTTP Target</option>
              <option value="app_engine">App Engine HTTP Target</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Target URL *</label>
            <input
              type="text"
              value={config.targetUrl || ''}
              onChange={(e) => updateConfig('targetUrl', e.target.value)}
              placeholder="https://my-service.run.app/process"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">HTTP Method</label>
            <select
              value={config.httpMethod || 'POST'}
              onChange={(e) => updateConfig('httpMethod', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="POST">POST</option>
              <option value="GET">GET</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Request Body (JSON)</label>
            <textarea
              value={config.body || ''}
              onChange={(e) => updateConfig('body', e.target.value)}
              placeholder='{"action": "process", "data": "..."}'
              rows={3}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Headers (JSON)</label>
            <textarea
              value={config.headers || ''}
              onChange={(e) => updateConfig('headers', e.target.value)}
              placeholder='{"Content-Type": "application/json"}'
              rows={2}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Schedule Time (ISO format)</label>
            <input
              type="text"
              value={config.scheduleTime || ''}
              onChange={(e) => updateConfig('scheduleTime', e.target.value)}
              placeholder="2025-01-01T12:00:00Z"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.useOidcToken || false}
              onChange={(e) => updateConfig('useOidcToken', e.target.checked)}
              className="rounded border-gray-600 bg-gray-800"
            />
            <label className="text-xs text-gray-400">Use OIDC Token</label>
          </div>

          {config.useOidcToken && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Service Account Email</label>
              <input
                type="text"
                value={config.serviceAccountEmail || ''}
                onChange={(e) => updateConfig('serviceAccountEmail', e.target.value)}
                placeholder="sa@project.iam.gserviceaccount.com"
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
              />
            </div>
          )}
        </>
      )}

      {config.operation === 'create_queue' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Max Dispatches Per Second</label>
            <input
              type="number"
              value={config.maxDispatchesPerSecond || 500}
              onChange={(e) => updateConfig('maxDispatchesPerSecond', parseInt(e.target.value))}
              min={1}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Max Concurrent Dispatches</label>
            <input
              type="number"
              value={config.maxConcurrentDispatches || 1000}
              onChange={(e) => updateConfig('maxConcurrentDispatches', parseInt(e.target.value))}
              min={1}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
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
    </div>
  );
};
