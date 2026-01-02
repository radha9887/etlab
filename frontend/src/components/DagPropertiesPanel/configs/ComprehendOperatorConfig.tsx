interface ComprehendOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const ComprehendOperatorConfig = ({ config, onChange }: ComprehendOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Analysis Type</label>
        <select
          value={config.analysisType || 'sentiment'}
          onChange={(e) => updateConfig('analysisType', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="sentiment">Sentiment Analysis</option>
          <option value="entities">Entity Detection</option>
          <option value="key_phrases">Key Phrase Extraction</option>
          <option value="language">Language Detection</option>
          <option value="pii">PII Detection</option>
          <option value="topics">Topic Modeling</option>
          <option value="document_classification">Document Classification</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Input Text (single document)</label>
        <textarea
          value={config.inputText || ''}
          onChange={(e) => updateConfig('inputText', e.target.value)}
          placeholder="Enter text to analyze..."
          rows={4}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Input S3 URI (batch)</label>
        <input
          type="text"
          value={config.inputS3Uri || ''}
          onChange={(e) => updateConfig('inputS3Uri', e.target.value)}
          placeholder="s3://my-bucket/input/"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Output S3 URI</label>
        <input
          type="text"
          value={config.outputS3Uri || ''}
          onChange={(e) => updateConfig('outputS3Uri', e.target.value)}
          placeholder="s3://my-bucket/output/"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Input Format</label>
        <select
          value={config.inputFormat || 'ONE_DOC_PER_LINE'}
          onChange={(e) => updateConfig('inputFormat', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="ONE_DOC_PER_LINE">One Document Per Line</option>
          <option value="ONE_DOC_PER_FILE">One Document Per File</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Language Code</label>
        <select
          value={config.languageCode || 'en'}
          onChange={(e) => updateConfig('languageCode', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="it">Italian</option>
          <option value="pt">Portuguese</option>
          <option value="ja">Japanese</option>
          <option value="ko">Korean</option>
          <option value="zh">Chinese</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Data Access Role ARN</label>
        <input
          type="text"
          value={config.dataAccessRoleArn || ''}
          onChange={(e) => updateConfig('dataAccessRoleArn', e.target.value)}
          placeholder="arn:aws:iam::123456789:role/ComprehendRole"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">AWS Connection ID</label>
        <input
          type="text"
          value={config.awsConnId || ''}
          onChange={(e) => updateConfig('awsConnId', e.target.value)}
          placeholder="aws_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Region</label>
        <input
          type="text"
          value={config.regionName || ''}
          onChange={(e) => updateConfig('regionName', e.target.value)}
          placeholder="us-east-1"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>
    </div>
  );
};
