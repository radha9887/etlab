interface KafkaProduceConfigProps {
  config: {
    taskId: string;
    kafkaConnId?: string;
    topic?: string;
    messages?: string;
    messageKey?: string;
    partition?: number;
    headers?: string;
    acks?: 'all' | '0' | '1';
    compression?: 'none' | 'gzip' | 'snappy' | 'lz4' | 'zstd';
    batchSize?: number;
    lingerMs?: number;
  };
  onChange: (updates: Partial<KafkaProduceConfigProps['config']>) => void;
  etlPages: any[];
}

export const KafkaProduceConfig = ({ config, onChange }: KafkaProduceConfigProps) => {
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
        <p className="text-xs text-gray-500 mt-1">
          Airflow connection with Kafka bootstrap servers
        </p>
      </div>

      {/* Topic */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Topic *</label>
        <input
          type="text"
          value={config.topic || ''}
          onChange={(e) => onChange({ topic: e.target.value })}
          placeholder="my-topic"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Messages */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Messages (JSON array) *</label>
        <textarea
          value={config.messages || ''}
          onChange={(e) => onChange({ messages: e.target.value })}
          placeholder='[{"event": "start", "timestamp": "{{ ts }}"}, {"event": "complete"}]'
          rows={4}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Array of messages to produce (Jinja templating supported)
        </p>
      </div>

      {/* Message Key */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Message Key</label>
        <input
          type="text"
          value={config.messageKey || ''}
          onChange={(e) => onChange({ messageKey: e.target.value })}
          placeholder="{{ dag_run.run_id }}"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      {/* Partition */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Partition (optional)</label>
        <input
          type="number"
          value={config.partition ?? ''}
          onChange={(e) => onChange({ partition: e.target.value ? parseInt(e.target.value) : undefined })}
          placeholder="Auto"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Headers */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Headers (JSON)</label>
        <input
          type="text"
          value={config.headers || ''}
          onChange={(e) => onChange({ headers: e.target.value })}
          placeholder='{"source": "airflow", "dag": "{{ dag.dag_id }}"}'
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      {/* Producer Settings */}
      <div className="border-t border-gray-700 pt-3">
        <label className="block text-xs text-gray-400 mb-2">Producer Settings</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Acks</label>
            <select
              value={config.acks || 'all'}
              onChange={(e) => onChange({ acks: e.target.value as any })}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="all">All (strongest)</option>
              <option value="1">Leader only</option>
              <option value="0">No ack (fastest)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Compression</label>
            <select
              value={config.compression || 'none'}
              onChange={(e) => onChange({ compression: e.target.value as any })}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="none">None</option>
              <option value="gzip">GZIP</option>
              <option value="snappy">Snappy</option>
              <option value="lz4">LZ4</option>
              <option value="zstd">ZSTD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-md p-2">
        <p className="text-xs text-orange-400">
          {config.topic ? (
            <>Produces messages to Kafka topic <strong>{config.topic}</strong></>
          ) : (
            <>Configure Kafka producer</>
          )}
        </p>
      </div>
    </div>
  );
};
