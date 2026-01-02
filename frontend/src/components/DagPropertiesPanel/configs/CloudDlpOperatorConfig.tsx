interface CloudDlpOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const CloudDlpOperatorConfig = ({ config, onChange }: CloudDlpOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'deidentify'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="deidentify">Deidentify Content</option>
          <option value="inspect">Inspect Content</option>
          <option value="create_dlp_job">Create DLP Job</option>
          <option value="cancel_dlp_job">Cancel DLP Job</option>
          <option value="create_inspect_template">Create Inspect Template</option>
          <option value="delete_inspect_template">Delete Inspect Template</option>
          <option value="create_deidentify_template">Create Deidentify Template</option>
          <option value="delete_deidentify_template">Delete Deidentify Template</option>
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

      {(config.operation === 'deidentify' || config.operation === 'inspect') && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Content Type</label>
            <select
              value={config.contentType || 'text'}
              onChange={(e) => updateConfig('contentType', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="text">Text</option>
              <option value="table">Table (JSON)</option>
              <option value="image">Image (base64)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Content *</label>
            <textarea
              value={config.content || ''}
              onChange={(e) => updateConfig('content', e.target.value)}
              placeholder="Text content to inspect or deidentify..."
              rows={4}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Info Types (comma-separated)</label>
            <input
              type="text"
              value={config.infoTypes || ''}
              onChange={(e) => updateConfig('infoTypes', e.target.value)}
              placeholder="EMAIL_ADDRESS, PHONE_NUMBER, CREDIT_CARD_NUMBER"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Inspect Template (optional)</label>
            <input
              type="text"
              value={config.inspectTemplateName || ''}
              onChange={(e) => updateConfig('inspectTemplateName', e.target.value)}
              placeholder="projects/project/inspectTemplates/template-id"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
            />
          </div>
        </>
      )}

      {config.operation === 'deidentify' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Deidentify Method</label>
            <select
              value={config.deidentifyMethod || 'mask'}
              onChange={(e) => updateConfig('deidentifyMethod', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="mask">Character Masking</option>
              <option value="redact">Redact</option>
              <option value="replace">Replace with Value</option>
              <option value="crypto_hash">Crypto Hash</option>
              <option value="crypto_replace">Crypto Replace (FPE)</option>
              <option value="date_shift">Date Shift</option>
            </select>
          </div>

          {config.deidentifyMethod === 'mask' && (
            <>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Masking Character</label>
                <input
                  type="text"
                  value={config.maskingChar || '*'}
                  onChange={(e) => updateConfig('maskingChar', e.target.value)}
                  maxLength={1}
                  className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                             border border-gray-600 focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Characters to Mask (0 = all)</label>
                <input
                  type="number"
                  value={config.numberToMask || 0}
                  onChange={(e) => updateConfig('numberToMask', parseInt(e.target.value))}
                  min={0}
                  className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                             border border-gray-600 focus:border-accent focus:outline-none"
                />
              </div>
            </>
          )}

          {config.deidentifyMethod === 'replace' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Replacement Value</label>
              <input
                type="text"
                value={config.replaceValue || '[REDACTED]'}
                onChange={(e) => updateConfig('replaceValue', e.target.value)}
                placeholder="[REDACTED]"
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-400 mb-1">Deidentify Template (optional)</label>
            <input
              type="text"
              value={config.deidentifyTemplateName || ''}
              onChange={(e) => updateConfig('deidentifyTemplateName', e.target.value)}
              placeholder="projects/project/deidentifyTemplates/template-id"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
            />
          </div>
        </>
      )}

      {config.operation === 'create_dlp_job' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Job Type</label>
            <select
              value={config.jobType || 'inspect'}
              onChange={(e) => updateConfig('jobType', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="inspect">Inspect Job</option>
              <option value="risk_analysis">Risk Analysis Job</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Storage Type</label>
            <select
              value={config.storageType || 'bigquery'}
              onChange={(e) => updateConfig('storageType', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="bigquery">BigQuery Table</option>
              <option value="gcs">Cloud Storage</option>
              <option value="datastore">Datastore</option>
            </select>
          </div>

          {config.storageType === 'bigquery' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">BigQuery Table *</label>
              <input
                type="text"
                value={config.bigqueryTable || ''}
                onChange={(e) => updateConfig('bigqueryTable', e.target.value)}
                placeholder="project.dataset.table"
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
              />
            </div>
          )}

          {config.storageType === 'gcs' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">GCS Path *</label>
              <input
                type="text"
                value={config.gcsPath || ''}
                onChange={(e) => updateConfig('gcsPath', e.target.value)}
                placeholder="gs://bucket/path/"
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
              />
            </div>
          )}
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

      {config.operation === 'create_dlp_job' && (
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
