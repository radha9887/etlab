interface PagerDutyOperatorConfigProps {
  config: {
    taskId: string;
    pagerdutyConnId?: string;
    routingKey?: string;
    eventAction?: 'trigger' | 'acknowledge' | 'resolve';
    severity?: 'critical' | 'error' | 'warning' | 'info';
    summary?: string;
    source?: string;
    dedupKey?: string;
    component?: string;
    group?: string;
    class?: string;
    customDetails?: string;
    images?: string;
    links?: string;
  };
  onChange: (updates: Partial<PagerDutyOperatorConfigProps['config']>) => void;
  etlPages: any[];
}

export const PagerDutyOperatorConfig = ({ config, onChange }: PagerDutyOperatorConfigProps) => {
  return (
    <div className="space-y-3">
      {/* Connection */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">PagerDuty Connection ID *</label>
        <input
          type="text"
          value={config.pagerdutyConnId || ''}
          onChange={(e) => onChange({ pagerdutyConnId: e.target.value })}
          placeholder="pagerduty_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Airflow connection with PagerDuty API key
        </p>
      </div>

      {/* Routing Key (optional override) */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Routing Key (override)</label>
        <input
          type="text"
          value={config.routingKey || ''}
          onChange={(e) => onChange({ routingKey: e.target.value })}
          placeholder="Optional - uses connection default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      {/* Event Action */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Event Action *</label>
        <select
          value={config.eventAction || 'trigger'}
          onChange={(e) => onChange({ eventAction: e.target.value as any })}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="trigger">Trigger (create incident)</option>
          <option value="acknowledge">Acknowledge</option>
          <option value="resolve">Resolve</option>
        </select>
      </div>

      {/* Severity */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Severity *</label>
        <select
          value={config.severity || 'error'}
          onChange={(e) => onChange({ severity: e.target.value as any })}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="critical">Critical</option>
          <option value="error">Error</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
      </div>

      {/* Summary */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Summary *</label>
        <textarea
          value={config.summary || ''}
          onChange={(e) => onChange({ summary: e.target.value })}
          placeholder="Task {{ task.task_id }} in DAG {{ dag.dag_id }} failed"
          rows={2}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none"
        />
      </div>

      {/* Source */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Source</label>
        <input
          type="text"
          value={config.source || ''}
          onChange={(e) => onChange({ source: e.target.value })}
          placeholder="Airflow - {{ dag.dag_id }}"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Dedup Key */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Deduplication Key</label>
        <input
          type="text"
          value={config.dedupKey || ''}
          onChange={(e) => onChange({ dedupKey: e.target.value })}
          placeholder="{{ dag.dag_id }}-{{ task.task_id }}-{{ ds }}"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          Used to deduplicate or update existing incidents
        </p>
      </div>

      {/* Component and Group */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Component</label>
          <input
            type="text"
            value={config.component || ''}
            onChange={(e) => onChange({ component: e.target.value })}
            placeholder="Data Pipeline"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Group</label>
          <input
            type="text"
            value={config.group || ''}
            onChange={(e) => onChange({ group: e.target.value })}
            placeholder="ETL"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Custom Details */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Custom Details (JSON)</label>
        <textarea
          value={config.customDetails || ''}
          onChange={(e) => onChange({ customDetails: e.target.value })}
          placeholder={'{\n  "run_id": "{{ run_id }}",\n  "execution_date": "{{ ds }}"\n}'}
          rows={3}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
        />
      </div>

      {/* Preview */}
      <div className={`border rounded-md p-2 ${
        config.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
        config.severity === 'error' ? 'bg-orange-500/10 border-orange-500/30' :
        config.severity === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
        'bg-blue-500/10 border-blue-500/30'
      }`}>
        <p className={`text-xs ${
          config.severity === 'critical' ? 'text-red-400' :
          config.severity === 'error' ? 'text-orange-400' :
          config.severity === 'warning' ? 'text-yellow-400' :
          'text-blue-400'
        }`}>
          {config.summary ? (
            <><strong>[{(config.severity || 'error').toUpperCase()}]</strong> {config.eventAction === 'trigger' ? 'Creates' : config.eventAction === 'acknowledge' ? 'Acknowledges' : 'Resolves'} PagerDuty incident</>
          ) : (
            <>Configure PagerDuty alert</>
          )}
        </p>
      </div>
    </div>
  );
};
