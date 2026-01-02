interface BigQueryDataTransferConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const BigQueryDataTransferConfig = ({ config, onChange }: BigQueryDataTransferConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'start_transfer'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="start_transfer">Start Transfer Run</option>
          <option value="create_transfer">Create Transfer Config</option>
          <option value="delete_transfer">Delete Transfer Config</option>
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
        <label className="block text-xs text-gray-400 mb-1">Region</label>
        <input
          type="text"
          value={config.region || ''}
          onChange={(e) => updateConfig('region', e.target.value)}
          placeholder="us"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {config.operation === 'start_transfer' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Transfer Config ID *</label>
          <input
            type="text"
            value={config.transferConfigId || ''}
            onChange={(e) => updateConfig('transferConfigId', e.target.value)}
            placeholder="12345678-1234-1234-1234-123456789012"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
          />
        </div>
      )}

      {config.operation === 'create_transfer' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Display Name *</label>
            <input
              type="text"
              value={config.displayName || ''}
              onChange={(e) => updateConfig('displayName', e.target.value)}
              placeholder="My Data Transfer"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Data Source *</label>
            <select
              value={config.dataSource || 'google_cloud_storage'}
              onChange={(e) => updateConfig('dataSource', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="google_cloud_storage">Google Cloud Storage</option>
              <option value="google_ads">Google Ads</option>
              <option value="google_play">Google Play</option>
              <option value="youtube_channel">YouTube Channel</option>
              <option value="youtube_content_owner">YouTube Content Owner</option>
              <option value="scheduled_query">Scheduled Query</option>
              <option value="amazon_s3">Amazon S3</option>
              <option value="amazon_redshift">Amazon Redshift</option>
              <option value="teradata">Teradata</option>
              <option value="oracle">Oracle</option>
              <option value="mysql">MySQL</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="salesforce">Salesforce</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Destination Dataset *</label>
            <input
              type="text"
              value={config.destinationDataset || ''}
              onChange={(e) => updateConfig('destinationDataset', e.target.value)}
              placeholder="my_dataset"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Source Parameters (JSON)</label>
            <textarea
              value={config.sourceParams || ''}
              onChange={(e) => updateConfig('sourceParams', e.target.value)}
              placeholder='{"data_path_template": "gs://bucket/data/*"}'
              rows={3}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Schedule (cron)</label>
            <input
              type="text"
              value={config.schedule || ''}
              onChange={(e) => updateConfig('schedule', e.target.value)}
              placeholder="every 24 hours"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Notification Pub/Sub Topic</label>
            <input
              type="text"
              value={config.notificationPubsubTopic || ''}
              onChange={(e) => updateConfig('notificationPubsubTopic', e.target.value)}
              placeholder="projects/project/topics/topic"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.disabled || false}
              onChange={(e) => updateConfig('disabled', e.target.checked)}
              className="rounded border-gray-600 bg-gray-800"
            />
            <label className="text-xs text-gray-400">Create Disabled</label>
          </div>
        </>
      )}

      {config.operation === 'delete_transfer' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Transfer Config ID *</label>
          <input
            type="text"
            value={config.transferConfigId || ''}
            onChange={(e) => updateConfig('transferConfigId', e.target.value)}
            placeholder="12345678-1234-1234-1234-123456789012"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
          />
        </div>
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
