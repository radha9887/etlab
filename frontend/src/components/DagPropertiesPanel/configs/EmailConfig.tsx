interface EmailConfigProps {
  config: {
    taskId: string;
    to?: string;
    cc?: string;
    bcc?: string;
    subject?: string;
    htmlContent?: string;
    files?: string;
    connId?: string;
  };
  onChange: (updates: Partial<EmailConfigProps['config']>) => void;
  etlPages: any[];
}

export const EmailConfig = ({ config, onChange }: EmailConfigProps) => {
  return (
    <div className="space-y-3">
      {/* To */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">To *</label>
        <input
          type="text"
          value={config.to || ''}
          onChange={(e) => onChange({ to: e.target.value })}
          placeholder="user@example.com, team@example.com"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Comma-separated email addresses
        </p>
      </div>

      {/* CC */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">CC</label>
        <input
          type="text"
          value={config.cc || ''}
          onChange={(e) => onChange({ cc: e.target.value })}
          placeholder="manager@example.com"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {/* BCC */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">BCC</label>
        <input
          type="text"
          value={config.bcc || ''}
          onChange={(e) => onChange({ bcc: e.target.value })}
          placeholder="audit@example.com"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Subject */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Subject *</label>
        <input
          type="text"
          value={config.subject || ''}
          onChange={(e) => onChange({ subject: e.target.value })}
          placeholder="DAG {{ dag.dag_id }} completed"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Supports Jinja templates
        </p>
      </div>

      {/* HTML Content */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Content (HTML) *</label>
        <textarea
          value={config.htmlContent || ''}
          onChange={(e) => onChange({ htmlContent: e.target.value })}
          placeholder="<h1>Pipeline Complete</h1><p>Execution date: {{ ds }}</p>"
          rows={6}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
        />
      </div>

      {/* Attachments */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Attachments</label>
        <input
          type="text"
          value={config.files || ''}
          onChange={(e) => onChange({ files: e.target.value })}
          placeholder="/path/to/report.csv, /path/to/summary.pdf"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          Comma-separated file paths
        </p>
      </div>

      {/* SMTP Connection */}
      <div className="border-t border-gray-700 pt-3">
        <label className="block text-xs text-gray-400 mb-1">SMTP Connection ID</label>
        <input
          type="text"
          value={config.connId || ''}
          onChange={(e) => onChange({ connId: e.target.value })}
          placeholder="smtp_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Leave empty to use default SMTP settings
        </p>
      </div>

      {/* Preview */}
      {config.to && config.subject && (
        <div className="bg-pink-500/10 border border-pink-500/30 rounded-md p-2">
          <p className="text-xs text-pink-400">
            Sends email to <strong>{config.to.split(',')[0]}</strong>
            {config.to.includes(',') && ` +${config.to.split(',').length - 1} more`}
          </p>
        </div>
      )}
    </div>
  );
};
