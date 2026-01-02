interface NaturalLanguageOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const NaturalLanguageOperatorConfig = ({ config, onChange }: NaturalLanguageOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'analyze_sentiment'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="analyze_sentiment">Analyze Sentiment</option>
          <option value="analyze_entities">Analyze Entities</option>
          <option value="analyze_entity_sentiment">Analyze Entity Sentiment</option>
          <option value="analyze_syntax">Analyze Syntax</option>
          <option value="classify_text">Classify Text</option>
          <option value="moderate_text">Moderate Text</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Content Source</label>
        <select
          value={config.contentSource || 'text'}
          onChange={(e) => updateConfig('contentSource', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="text">Plain Text</option>
          <option value="gcs">GCS File</option>
          <option value="html">HTML</option>
        </select>
      </div>

      {config.contentSource === 'text' || config.contentSource === 'html' ? (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Content *</label>
          <textarea
            value={config.content || ''}
            onChange={(e) => updateConfig('content', e.target.value)}
            placeholder="Enter text to analyze..."
            rows={4}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none resize-none"
          />
        </div>
      ) : (
        <div>
          <label className="block text-xs text-gray-400 mb-1">GCS URI *</label>
          <input
            type="text"
            value={config.gcsUri || ''}
            onChange={(e) => updateConfig('gcsUri', e.target.value)}
            placeholder="gs://bucket/document.txt"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
          />
        </div>
      )}

      <div>
        <label className="block text-xs text-gray-400 mb-1">Language (optional)</label>
        <input
          type="text"
          value={config.language || ''}
          onChange={(e) => updateConfig('language', e.target.value)}
          placeholder="en (leave empty for auto-detect)"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {config.operation === 'analyze_entities' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Entity Types Filter</label>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {['PERSON', 'LOCATION', 'ORGANIZATION', 'EVENT', 'WORK_OF_ART',
              'CONSUMER_GOOD', 'PHONE_NUMBER', 'ADDRESS', 'DATE', 'NUMBER'].map(type => (
              <label key={type} className="flex items-center gap-2 text-xs text-gray-400">
                <input
                  type="checkbox"
                  checked={(config.entityTypes || []).includes(type)}
                  onChange={(e) => {
                    const types = config.entityTypes || [];
                    if (e.target.checked) {
                      updateConfig('entityTypes', [...types, type]);
                    } else {
                      updateConfig('entityTypes', types.filter((t: string) => t !== type));
                    }
                  }}
                  className="rounded border-gray-600 bg-gray-800"
                />
                {type.replace(/_/g, ' ')}
              </label>
            ))}
          </div>
        </div>
      )}

      {config.operation === 'classify_text' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Classification Model</label>
          <select
            value={config.classificationModel || 'v2'}
            onChange={(e) => updateConfig('classificationModel', e.target.value)}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          >
            <option value="v1">V1 (700+ categories)</option>
            <option value="v2">V2 (1000+ categories)</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs text-gray-400 mb-1">Encoding Type</label>
        <select
          value={config.encodingType || 'UTF8'}
          onChange={(e) => updateConfig('encodingType', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="UTF8">UTF-8</option>
          <option value="UTF16">UTF-16</option>
          <option value="UTF32">UTF-32</option>
        </select>
      </div>

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
