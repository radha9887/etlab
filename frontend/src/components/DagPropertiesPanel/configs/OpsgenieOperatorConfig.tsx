interface OpsgenieOperatorConfigProps {
  config: {
    taskId: string;
    opsgenieConnId?: string;
    message?: string;
    alias?: string;
    description?: string;
    responders?: string;
    priority?: 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
    tags?: string;
    entity?: string;
    source?: string;
    actions?: string;
    details?: string;
    closeAlert?: boolean;
    note?: string;
  };
  onChange: (updates: Partial<OpsgenieOperatorConfigProps['config']>) => void;
  etlPages: any[];
}

export const OpsgenieOperatorConfig = ({ config, onChange }: OpsgenieOperatorConfigProps) => {
  return (
    <div className="space-y-3">
      {/* Connection */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Opsgenie Connection ID *</label>
        <input
          type="text"
          value={config.opsgenieConnId || ''}
          onChange={(e) => onChange({ opsgenieConnId: e.target.value })}
          placeholder="opsgenie_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Airflow connection with Opsgenie API key
        </p>
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Message *</label>
        <input
          type="text"
          value={config.message || ''}
          onChange={(e) => onChange({ message: e.target.value })}
          placeholder="DAG {{ dag.dag_id }} - Task {{ task.task_id }} failed"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Alert message (max 130 characters)
        </p>
      </div>

      {/* Alias */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Alias (dedup key)</label>
        <input
          type="text"
          value={config.alias || ''}
          onChange={(e) => onChange({ alias: e.target.value })}
          placeholder="{{ dag.dag_id }}-{{ task.task_id }}"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          Used to deduplicate alerts
        </p>
      </div>

      {/* Priority */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Priority</label>
        <select
          value={config.priority || 'P3'}
          onChange={(e) => onChange({ priority: e.target.value as any })}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="P1">P1 - Critical</option>
          <option value="P2">P2 - High</option>
          <option value="P3">P3 - Moderate</option>
          <option value="P4">P4 - Low</option>
          <option value="P5">P5 - Informational</option>
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Description</label>
        <textarea
          value={config.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Detailed description of the alert..."
          rows={3}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none"
        />
      </div>

      {/* Responders */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Responders (JSON array)</label>
        <textarea
          value={config.responders || ''}
          onChange={(e) => onChange({ responders: e.target.value })}
          placeholder={'[\n  {"type": "team", "name": "Data Engineering"},\n  {"type": "user", "username": "oncall@example.com"}\n]'}
          rows={3}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Tags</label>
        <input
          type="text"
          value={config.tags || ''}
          onChange={(e) => onChange({ tags: e.target.value })}
          placeholder="airflow,data-pipeline,{{ dag.dag_id }}"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Comma-separated tags for filtering
        </p>
      </div>

      {/* Entity and Source */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Entity</label>
          <input
            type="text"
            value={config.entity || ''}
            onChange={(e) => onChange({ entity: e.target.value })}
            placeholder="Data Pipeline"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Source</label>
          <input
            type="text"
            value={config.source || ''}
            onChange={(e) => onChange({ source: e.target.value })}
            placeholder="Airflow"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Custom Details */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Details (JSON)</label>
        <textarea
          value={config.details || ''}
          onChange={(e) => onChange({ details: e.target.value })}
          placeholder={'{\n  "dag_id": "{{ dag.dag_id }}",\n  "run_id": "{{ run_id }}"\n}'}
          rows={2}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
        />
      </div>

      {/* Close Alert Option */}
      <div className="border-t border-gray-700 pt-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400">Close Alert (instead of create)</span>
            <p className="text-xs text-gray-500">Will close an existing alert with matching alias</p>
          </div>
          <button
            onClick={() => onChange({ closeAlert: !config.closeAlert })}
            className={`w-10 h-5 rounded-full transition-colors
                      ${config.closeAlert ? 'bg-accent' : 'bg-gray-600'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transform transition-transform
                        ${config.closeAlert ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>
      </div>

      {/* Note (for close operation) */}
      {config.closeAlert && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Close Note</label>
          <input
            type="text"
            value={config.note || ''}
            onChange={(e) => onChange({ note: e.target.value })}
            placeholder="Alert resolved by Airflow"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      )}

      {/* Preview */}
      <div className={`border rounded-md p-2 ${
        config.priority === 'P1' ? 'bg-red-500/10 border-red-500/30' :
        config.priority === 'P2' ? 'bg-orange-500/10 border-orange-500/30' :
        config.priority === 'P3' ? 'bg-yellow-500/10 border-yellow-500/30' :
        'bg-blue-500/10 border-blue-500/30'
      }`}>
        <p className={`text-xs ${
          config.priority === 'P1' ? 'text-red-400' :
          config.priority === 'P2' ? 'text-orange-400' :
          config.priority === 'P3' ? 'text-yellow-400' :
          'text-blue-400'
        }`}>
          {config.message ? (
            <><strong>[{config.priority || 'P3'}]</strong> {config.closeAlert ? 'Closes' : 'Creates'} Opsgenie alert</>
          ) : (
            <>Configure Opsgenie alert</>
          )}
        </p>
      </div>
    </div>
  );
};
