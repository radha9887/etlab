interface SlackConfigProps {
  config: {
    taskId: string;
    channel?: string;
    message?: string;
    username?: string;
    iconEmoji?: string;
    slackConnId?: string;
    attachments?: string;
    blocks?: string;
  };
  onChange: (updates: Partial<SlackConfigProps['config']>) => void;
  etlPages: any[];
}

export const SlackConfig = ({ config, onChange }: SlackConfigProps) => {
  return (
    <div className="space-y-3">
      {/* Channel */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Channel *</label>
        <input
          type="text"
          value={config.channel || ''}
          onChange={(e) => onChange({ channel: e.target.value })}
          placeholder="#data-alerts or @username"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Channel name or user mention
        </p>
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Message *</label>
        <textarea
          value={config.message || ''}
          onChange={(e) => onChange({ message: e.target.value })}
          placeholder="Pipeline {{ dag.dag_id }} completed successfully! :tada:"
          rows={4}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Supports Slack markdown and Jinja templates
        </p>
      </div>

      {/* Username */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Bot Username</label>
        <input
          type="text"
          value={config.username || ''}
          onChange={(e) => onChange({ username: e.target.value })}
          placeholder="Airflow Bot"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Icon Emoji */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Icon Emoji</label>
        <input
          type="text"
          value={config.iconEmoji || ''}
          onChange={(e) => onChange({ iconEmoji: e.target.value })}
          placeholder=":robot_face: or :airflow:"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Blocks (Advanced) */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Blocks (JSON)</label>
        <textarea
          value={config.blocks || ''}
          onChange={(e) => onChange({ blocks: e.target.value })}
          placeholder='[{"type": "section", "text": {"type": "mrkdwn", "text": "*Bold*"}}]'
          rows={3}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Optional: Slack Block Kit JSON for rich formatting
        </p>
      </div>

      {/* Connection */}
      <div className="border-t border-gray-700 pt-3">
        <label className="block text-xs text-gray-400 mb-1">Slack Connection ID *</label>
        <input
          type="text"
          value={config.slackConnId || ''}
          onChange={(e) => onChange({ slackConnId: e.target.value })}
          placeholder="slack_webhook_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Airflow connection with Slack webhook URL
        </p>
      </div>

      {/* Preview */}
      {config.channel && config.message && (
        <div className="bg-pink-500/10 border border-pink-500/30 rounded-md p-2">
          <p className="text-xs text-pink-400">
            Posts to <strong>{config.channel}</strong>
          </p>
        </div>
      )}
    </div>
  );
};
