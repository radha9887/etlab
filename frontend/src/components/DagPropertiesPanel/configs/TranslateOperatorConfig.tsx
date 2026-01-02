interface TranslateOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const TranslateOperatorConfig = ({ config, onChange }: TranslateOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'translate_text'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="translate_text">Translate Text</option>
          <option value="detect_language">Detect Language</option>
          <option value="batch_translate">Batch Translate (GCS)</option>
          <option value="create_glossary">Create Glossary</option>
          <option value="delete_glossary">Delete Glossary</option>
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
        <label className="block text-xs text-gray-400 mb-1">Location</label>
        <input
          type="text"
          value={config.location || 'global'}
          onChange={(e) => updateConfig('location', e.target.value)}
          placeholder="global"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {(config.operation === 'translate_text' || config.operation === 'detect_language') && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Text to Translate *</label>
          <textarea
            value={config.text || ''}
            onChange={(e) => updateConfig('text', e.target.value)}
            placeholder="Enter text to translate..."
            rows={4}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none resize-none"
          />
        </div>
      )}

      {config.operation === 'translate_text' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Target Language *</label>
            <select
              value={config.targetLanguage || 'en'}
              onChange={(e) => updateConfig('targetLanguage', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
              <option value="zh">Chinese (Simplified)</option>
              <option value="zh-TW">Chinese (Traditional)</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
              <option value="ar">Arabic</option>
              <option value="hi">Hindi</option>
              <option value="ru">Russian</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Source Language (optional)</label>
            <input
              type="text"
              value={config.sourceLanguage || ''}
              onChange={(e) => updateConfig('sourceLanguage', e.target.value)}
              placeholder="Leave empty for auto-detect"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Model</label>
            <select
              value={config.model || 'nmt'}
              onChange={(e) => updateConfig('model', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="nmt">Neural Machine Translation</option>
              <option value="base">Phrase-Based (Legacy)</option>
            </select>
          </div>
        </>
      )}

      {config.operation === 'batch_translate' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Input GCS URI *</label>
            <input
              type="text"
              value={config.inputUri || ''}
              onChange={(e) => updateConfig('inputUri', e.target.value)}
              placeholder="gs://bucket/input/"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Output GCS URI *</label>
            <input
              type="text"
              value={config.outputUri || ''}
              onChange={(e) => updateConfig('outputUri', e.target.value)}
              placeholder="gs://bucket/output/"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Source Language *</label>
            <input
              type="text"
              value={config.sourceLanguage || ''}
              onChange={(e) => updateConfig('sourceLanguage', e.target.value)}
              placeholder="en"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Target Languages (comma-separated) *</label>
            <input
              type="text"
              value={config.targetLanguages || ''}
              onChange={(e) => updateConfig('targetLanguages', e.target.value)}
              placeholder="es, fr, de"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Input MIME Type</label>
            <select
              value={config.mimeType || 'text/plain'}
              onChange={(e) => updateConfig('mimeType', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="text/plain">Plain Text</option>
              <option value="text/html">HTML</option>
            </select>
          </div>
        </>
      )}

      {config.operation === 'create_glossary' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Glossary ID *</label>
            <input
              type="text"
              value={config.glossaryId || ''}
              onChange={(e) => updateConfig('glossaryId', e.target.value)}
              placeholder="my-glossary"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Glossary GCS URI *</label>
            <input
              type="text"
              value={config.glossaryUri || ''}
              onChange={(e) => updateConfig('glossaryUri', e.target.value)}
              placeholder="gs://bucket/glossary.csv"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Language Pair (source-target)</label>
            <input
              type="text"
              value={config.languagePair || ''}
              onChange={(e) => updateConfig('languagePair', e.target.value)}
              placeholder="en-es"
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
