interface MsTeamsOperatorConfigProps {
  config: {
    taskId: string;
    teamsConnId?: string;
    webhookUrl?: string;
    message?: string;
    title?: string;
    subtitle?: string;
    themeColor?: string;
    buttonText?: string;
    buttonUrl?: string;
    imageUrl?: string;
    proxyUrl?: string;
  };
  onChange: (updates: Partial<MsTeamsOperatorConfigProps['config']>) => void;
  etlPages: any[];
}

export const MsTeamsOperatorConfig = ({ config, onChange }: MsTeamsOperatorConfigProps) => {
  return (
    <div className="space-y-3">
      {/* Connection or Webhook */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Teams Connection ID</label>
        <input
          type="text"
          value={config.teamsConnId || ''}
          onChange={(e) => onChange({ teamsConnId: e.target.value })}
          placeholder="ms_teams_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Airflow connection with Teams webhook (or use Webhook URL below)
        </p>
      </div>

      {/* Direct Webhook URL */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Webhook URL (alternative)</label>
        <input
          type="text"
          value={config.webhookUrl || ''}
          onChange={(e) => onChange({ webhookUrl: e.target.value })}
          placeholder="https://outlook.office.com/webhook/..."
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Title</label>
        <input
          type="text"
          value={config.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="DAG {{ dag.dag_id }} Alert"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Subtitle</label>
        <input
          type="text"
          value={config.subtitle || ''}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          placeholder="Run ID: {{ run_id }}"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Message *</label>
        <textarea
          value={config.message || ''}
          onChange={(e) => onChange({ message: e.target.value })}
          placeholder="Task {{ task.task_id }} completed successfully!"
          rows={3}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Jinja templating supported
        </p>
      </div>

      {/* Theme Color */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Theme Color</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={config.themeColor || ''}
            onChange={(e) => onChange({ themeColor: e.target.value })}
            placeholder="#00FF00"
            className="flex-1 bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono"
          />
          <div className="flex gap-1">
            <button
              onClick={() => onChange({ themeColor: '#00FF00' })}
              className="w-8 h-8 rounded bg-green-500 hover:ring-2 ring-white"
              title="Success"
            />
            <button
              onClick={() => onChange({ themeColor: '#FFFF00' })}
              className="w-8 h-8 rounded bg-yellow-500 hover:ring-2 ring-white"
              title="Warning"
            />
            <button
              onClick={() => onChange({ themeColor: '#FF0000' })}
              className="w-8 h-8 rounded bg-red-500 hover:ring-2 ring-white"
              title="Error"
            />
            <button
              onClick={() => onChange({ themeColor: '#0078D4' })}
              className="w-8 h-8 rounded bg-blue-600 hover:ring-2 ring-white"
              title="Info"
            />
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="border-t border-gray-700 pt-3">
        <label className="block text-xs text-gray-400 mb-2">Action Button (optional)</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="text"
              value={config.buttonText || ''}
              onChange={(e) => onChange({ buttonText: e.target.value })}
              placeholder="View Logs"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <input
              type="text"
              value={config.buttonUrl || ''}
              onChange={(e) => onChange({ buttonUrl: e.target.value })}
              placeholder="{{ ti.log_url }}"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-md p-2">
        <p className="text-xs text-purple-400">
          {config.message ? (
            <>Sends Teams message: <strong>{config.title || 'Notification'}</strong></>
          ) : (
            <>Configure Microsoft Teams notification</>
          )}
        </p>
      </div>
    </div>
  );
};
