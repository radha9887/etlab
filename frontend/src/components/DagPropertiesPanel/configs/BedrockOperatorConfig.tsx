interface BedrockOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const BedrockOperatorConfig = ({ config, onChange }: BedrockOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Model ID</label>
        <select
          value={config.modelId || 'anthropic.claude-3-sonnet-20240229-v1:0'}
          onChange={(e) => updateConfig('modelId', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="anthropic.claude-3-sonnet-20240229-v1:0">Claude 3 Sonnet</option>
          <option value="anthropic.claude-3-haiku-20240307-v1:0">Claude 3 Haiku</option>
          <option value="anthropic.claude-3-opus-20240229-v1:0">Claude 3 Opus</option>
          <option value="amazon.titan-text-express-v1">Amazon Titan Text</option>
          <option value="amazon.titan-embed-text-v1">Amazon Titan Embeddings</option>
          <option value="meta.llama3-8b-instruct-v1:0">Llama 3 8B</option>
          <option value="meta.llama3-70b-instruct-v1:0">Llama 3 70B</option>
          <option value="cohere.command-r-v1:0">Cohere Command R</option>
          <option value="mistral.mistral-7b-instruct-v0:2">Mistral 7B</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Prompt / Input *</label>
        <textarea
          value={config.prompt || ''}
          onChange={(e) => updateConfig('prompt', e.target.value)}
          placeholder="Enter your prompt here..."
          rows={5}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">System Prompt (Optional)</label>
        <textarea
          value={config.systemPrompt || ''}
          onChange={(e) => updateConfig('systemPrompt', e.target.value)}
          placeholder="You are a helpful assistant..."
          rows={2}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Max Tokens</label>
          <input
            type="number"
            value={config.maxTokens || 1024}
            onChange={(e) => updateConfig('maxTokens', parseInt(e.target.value))}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Temperature</label>
          <input
            type="number"
            step="0.1"
            min={0}
            max={1}
            value={config.temperature || 0.7}
            onChange={(e) => updateConfig('temperature', parseFloat(e.target.value))}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Top P</label>
          <input
            type="number"
            step="0.1"
            min={0}
            max={1}
            value={config.topP || 0.9}
            onChange={(e) => updateConfig('topP', parseFloat(e.target.value))}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Top K</label>
          <input
            type="number"
            value={config.topK || 50}
            onChange={(e) => updateConfig('topK', parseInt(e.target.value))}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Additional Model Parameters (JSON)</label>
        <textarea
          value={config.modelParams || ''}
          onChange={(e) => updateConfig('modelParams', e.target.value)}
          placeholder='{"stop_sequences": ["\\n\\nHuman:"]}'
          rows={2}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono"
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

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={config.deferrable || false}
          onChange={(e) => updateConfig('deferrable', e.target.checked)}
          className="rounded border-gray-600 bg-gray-800"
        />
        <label className="text-xs text-gray-400">Deferrable</label>
      </div>
    </div>
  );
};
