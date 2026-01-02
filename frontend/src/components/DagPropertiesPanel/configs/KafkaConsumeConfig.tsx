interface KafkaConsumeConfigProps {
  config: {
    taskId: string;
    kafkaConnId?: string;
    topics?: string;
    consumerGroup?: string;
    maxMessages?: number;
    maxBatchSize?: number;
    pollTimeoutS?: number;
    commitOnComplete?: boolean;
    autoOffsetReset?: 'earliest' | 'latest' | 'none';
    processorFunction?: string;
  };
  onChange: (updates: Partial<KafkaConsumeConfigProps['config']>) => void;
  etlPages: any[];
}

export const KafkaConsumeConfig = ({ config, onChange }: KafkaConsumeConfigProps) => {
  return (
    <div className="space-y-3">
      {/* Kafka Connection */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Kafka Connection ID *</label>
        <input
          type="text"
          value={config.kafkaConnId || ''}
          onChange={(e) => onChange({ kafkaConnId: e.target.value })}
          placeholder="kafka_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Topics */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Topics *</label>
        <input
          type="text"
          value={config.topics || ''}
          onChange={(e) => onChange({ topics: e.target.value })}
          placeholder="topic1,topic2"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Comma-separated list of topics to consume
        </p>
      </div>

      {/* Consumer Group */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Consumer Group *</label>
        <input
          type="text"
          value={config.consumerGroup || ''}
          onChange={(e) => onChange({ consumerGroup: e.target.value })}
          placeholder="airflow-consumer-group"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Auto Offset Reset */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Auto Offset Reset</label>
        <select
          value={config.autoOffsetReset || 'earliest'}
          onChange={(e) => onChange({ autoOffsetReset: e.target.value as any })}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="earliest">Earliest</option>
          <option value="latest">Latest</option>
          <option value="none">None (error if no offset)</option>
        </select>
      </div>

      {/* Message Limits */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Max Messages</label>
          <input
            type="number"
            value={config.maxMessages || 100}
            onChange={(e) => onChange({ maxMessages: parseInt(e.target.value) || 100 })}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Batch Size</label>
          <input
            type="number"
            value={config.maxBatchSize || 50}
            onChange={(e) => onChange({ maxBatchSize: parseInt(e.target.value) || 50 })}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Poll Timeout */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Poll Timeout (s)</label>
        <input
          type="number"
          value={config.pollTimeoutS || 60}
          onChange={(e) => onChange({ pollTimeoutS: parseInt(e.target.value) || 60 })}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Processor Function */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Processor Function (Python)</label>
        <textarea
          value={config.processorFunction || ''}
          onChange={(e) => onChange({ processorFunction: e.target.value })}
          placeholder="def process_message(message):\n    print(message.value())\n    return message"
          rows={4}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Optional Python function to process each message
        </p>
      </div>

      {/* Options */}
      <div className="border-t border-gray-700 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Commit Offset on Complete</span>
          <button
            onClick={() => onChange({ commitOnComplete: config.commitOnComplete === false ? true : !config.commitOnComplete })}
            className={`w-10 h-5 rounded-full transition-colors
                      ${config.commitOnComplete !== false ? 'bg-accent' : 'bg-gray-600'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transform transition-transform
                        ${config.commitOnComplete !== false ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-md p-2">
        <p className="text-xs text-orange-400">
          {config.topics ? (
            <>Consumes up to {config.maxMessages || 100} messages from <strong>{config.topics}</strong></>
          ) : (
            <>Configure Kafka consumer</>
          )}
        </p>
      </div>
    </div>
  );
};
