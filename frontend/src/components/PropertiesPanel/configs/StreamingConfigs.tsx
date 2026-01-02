import { useState } from 'react';
import { Save, Plus, Trash2, AlertTriangle, Clock, Waves } from 'lucide-react';
import type { TransformNodeData, SourceNodeData } from '../../../types';
import type { WithAvailableColumns } from '../shared';

interface StreamingConfigProps extends Partial<WithAvailableColumns> {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

interface SourceConfigProps {
  data: SourceNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

// ============================================
// Watermark Configuration
// ============================================
export const WatermarkConfig = ({ data, onUpdate, availableColumns }: StreamingConfigProps) => {
  const [config, setConfig] = useState({
    eventTimeColumn: (data.config?.eventTimeColumn as string) || '',
    delayThreshold: (data.config?.delayThreshold as string) || '10 seconds',
    delayUnit: (data.config?.delayUnit as string) || 'seconds',
    delayValue: (data.config?.delayValue as number) || 10,
  });

  const updateConfig = (key: string, value: unknown) => {
    setConfig({ ...config, [key]: value });
  };

  const handleSave = () => {
    const delayThreshold = `${config.delayValue} ${config.delayUnit}`;
    onUpdate({
      ...config,
      delayThreshold,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 px-3 py-2 rounded">
        <Clock className="w-4 h-4" />
        <span>Handle late arriving data in streaming pipelines</span>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Event Time Column *</label>
        <select
          value={config.eventTimeColumn}
          onChange={(e) => updateConfig('eventTimeColumn', e.target.value)}
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        >
          <option value="">Select timestamp column...</option>
          {(availableColumns || []).map((col) => (
            <option key={col.name} value={col.name}>{col.name} ({col.dataType})</option>
          ))}
        </select>
        <p className="text-[10px] text-gray-500 mt-1">The timestamp column representing event time</p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Delay Threshold</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={config.delayValue}
            onChange={(e) => updateConfig('delayValue', parseInt(e.target.value) || 0)}
            min={0}
            className="flex-1 px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
          />
          <select
            value={config.delayUnit}
            onChange={(e) => updateConfig('delayUnit', e.target.value)}
            className="w-28 px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
          >
            <option value="seconds">Seconds</option>
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
          </select>
        </div>
        <p className="text-[10px] text-gray-500 mt-1">How late data can arrive before being dropped</p>
      </div>

      <div className="text-xs text-yellow-500 bg-yellow-500/10 px-3 py-2 rounded">
        <AlertTriangle className="w-3 h-3 inline mr-1" />
        Watermarking enables stateful operations like windowed aggregations
      </div>

      <button
        onClick={handleSave}
        disabled={!config.eventTimeColumn}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
      >
        <Save className="w-4 h-4" />
        Save Configuration
      </button>
    </div>
  );
};

// ============================================
// Streaming Window Configuration
// ============================================
export const StreamingWindowConfig = ({ data, onUpdate, availableColumns }: StreamingConfigProps) => {
  const [config, setConfig] = useState({
    windowType: (data.config?.windowType as string) || 'tumbling',
    timeColumn: (data.config?.timeColumn as string) || '',
    windowDuration: (data.config?.windowDuration as string) || '10 minutes',
    windowDurationValue: (data.config?.windowDurationValue as number) || 10,
    windowDurationUnit: (data.config?.windowDurationUnit as string) || 'minutes',
    slideDuration: (data.config?.slideDuration as string) || '5 minutes',
    slideDurationValue: (data.config?.slideDurationValue as number) || 5,
    slideDurationUnit: (data.config?.slideDurationUnit as string) || 'minutes',
    startTime: (data.config?.startTime as string) || '',
    sessionGap: (data.config?.sessionGap as string) || '10 minutes',
    sessionGapValue: (data.config?.sessionGapValue as number) || 10,
    sessionGapUnit: (data.config?.sessionGapUnit as string) || 'minutes',
    groupByColumns: (data.config?.groupByColumns as string[]) || [],
    aggregations: (data.config?.aggregations as Array<{column: string; function: string; alias: string}>) || [],
  });

  const updateConfig = (key: string, value: unknown) => {
    setConfig({ ...config, [key]: value });
  };

  const addAggregation = () => {
    updateConfig('aggregations', [
      ...config.aggregations,
      { column: '', function: 'count', alias: '' }
    ]);
  };

  const updateAggregation = (index: number, field: string, value: string) => {
    const updated = [...config.aggregations];
    updated[index] = { ...updated[index], [field]: value };
    updateConfig('aggregations', updated);
  };

  const removeAggregation = (index: number) => {
    updateConfig('aggregations', config.aggregations.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const windowDuration = `${config.windowDurationValue} ${config.windowDurationUnit}`;
    const slideDuration = `${config.slideDurationValue} ${config.slideDurationUnit}`;
    const sessionGap = `${config.sessionGapValue} ${config.sessionGapUnit}`;
    onUpdate({
      ...config,
      windowDuration,
      slideDuration,
      sessionGap,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 px-3 py-2 rounded">
        <Waves className="w-4 h-4" />
        <span>Time-based windowed aggregations for streaming</span>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Window Type</label>
        <select
          value={config.windowType}
          onChange={(e) => updateConfig('windowType', e.target.value)}
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        >
          <option value="tumbling">Tumbling Window (fixed, non-overlapping)</option>
          <option value="sliding">Sliding Window (overlapping)</option>
          <option value="session">Session Window (gap-based)</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Time Column *</label>
        <select
          value={config.timeColumn}
          onChange={(e) => updateConfig('timeColumn', e.target.value)}
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        >
          <option value="">Select timestamp column...</option>
          {(availableColumns || []).map((col) => (
            <option key={col.name} value={col.name}>{col.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Window Duration</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={config.windowDurationValue}
            onChange={(e) => updateConfig('windowDurationValue', parseInt(e.target.value) || 0)}
            min={1}
            className="flex-1 px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
          />
          <select
            value={config.windowDurationUnit}
            onChange={(e) => updateConfig('windowDurationUnit', e.target.value)}
            className="w-28 px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
          >
            <option value="seconds">Seconds</option>
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
          </select>
        </div>
      </div>

      {config.windowType === 'sliding' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Slide Duration</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={config.slideDurationValue}
              onChange={(e) => updateConfig('slideDurationValue', parseInt(e.target.value) || 0)}
              min={1}
              className="flex-1 px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
            />
            <select
              value={config.slideDurationUnit}
              onChange={(e) => updateConfig('slideDurationUnit', e.target.value)}
              className="w-28 px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
            >
              <option value="seconds">Seconds</option>
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </select>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">How often windows advance</p>
        </div>
      )}

      {config.windowType === 'session' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Session Gap</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={config.sessionGapValue}
              onChange={(e) => updateConfig('sessionGapValue', parseInt(e.target.value) || 0)}
              min={1}
              className="flex-1 px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
            />
            <select
              value={config.sessionGapUnit}
              onChange={(e) => updateConfig('sessionGapUnit', e.target.value)}
              className="w-28 px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
            >
              <option value="seconds">Seconds</option>
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </select>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Inactivity gap that ends a session</p>
        </div>
      )}

      {config.windowType !== 'session' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Start Time (Optional)</label>
          <input
            type="text"
            value={config.startTime}
            onChange={(e) => updateConfig('startTime', e.target.value)}
            placeholder="e.g., 0 seconds"
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
          />
          <p className="text-[10px] text-gray-500 mt-1">Offset from epoch for window alignment</p>
        </div>
      )}

      <div>
        <label className="block text-xs text-gray-400 mb-1">Group By Columns</label>
        <select
          multiple
          value={config.groupByColumns}
          onChange={(e) => updateConfig('groupByColumns', Array.from(e.target.selectedOptions, opt => opt.value))}
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white min-h-[60px]"
        >
          {(availableColumns || []).map((col) => (
            <option key={col.name} value={col.name}>{col.name}</option>
          ))}
        </select>
        <p className="text-[10px] text-gray-500 mt-1">Ctrl+click to select multiple</p>
      </div>

      {/* Aggregations */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Aggregations</label>
        <div className="space-y-2">
          {config.aggregations.map((agg, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <select
                value={agg.function}
                onChange={(e) => updateAggregation(idx, 'function', e.target.value)}
                className="w-24 px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white"
              >
                <option value="count">count</option>
                <option value="sum">sum</option>
                <option value="avg">avg</option>
                <option value="min">min</option>
                <option value="max">max</option>
                <option value="first">first</option>
                <option value="last">last</option>
              </select>
              <select
                value={agg.column}
                onChange={(e) => updateAggregation(idx, 'column', e.target.value)}
                className="flex-1 px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white"
              >
                <option value="">Column...</option>
                <option value="*">* (all)</option>
                {(availableColumns || []).map((col) => (
                  <option key={col.name} value={col.name}>{col.name}</option>
                ))}
              </select>
              <input
                type="text"
                value={agg.alias}
                onChange={(e) => updateAggregation(idx, 'alias', e.target.value)}
                placeholder="alias"
                className="w-24 px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white"
              />
              <button
                onClick={() => removeAggregation(idx)}
                className="p-1.5 text-red-400 hover:bg-red-500/10 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addAggregation}
          className="mt-2 w-full flex items-center justify-center gap-1 px-3 py-1.5 border border-dashed border-gray-600 text-gray-400 hover:text-gray-200 rounded text-xs"
        >
          <Plus className="w-3 h-3" />
          Add Aggregation
        </button>
      </div>

      <button
        onClick={handleSave}
        disabled={!config.timeColumn}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
      >
        <Save className="w-4 h-4" />
        Save Configuration
      </button>
    </div>
  );
};

// ============================================
// Streaming Trigger Configuration
// ============================================
export const StreamingTriggerConfig = ({ data, onUpdate }: StreamingConfigProps) => {
  const [config, setConfig] = useState({
    triggerType: (data.config?.triggerType as string) || 'processingTime',
    processingTime: (data.config?.processingTime as string) || '10 seconds',
    processingTimeValue: (data.config?.processingTimeValue as number) || 10,
    processingTimeUnit: (data.config?.processingTimeUnit as string) || 'seconds',
    continuousInterval: (data.config?.continuousInterval as string) || '1 second',
    continuousIntervalValue: (data.config?.continuousIntervalValue as number) || 1,
    continuousIntervalUnit: (data.config?.continuousIntervalUnit as string) || 'second',
  });

  const updateConfig = (key: string, value: unknown) => {
    setConfig({ ...config, [key]: value });
  };

  const handleSave = () => {
    const processingTime = `${config.processingTimeValue} ${config.processingTimeUnit}`;
    const continuousInterval = `${config.continuousIntervalValue} ${config.continuousIntervalUnit}`;
    onUpdate({
      ...config,
      processingTime,
      continuousInterval,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 px-3 py-2 rounded">
        <Clock className="w-4 h-4" />
        <span>Control when streaming output is produced</span>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Trigger Type</label>
        <select
          value={config.triggerType}
          onChange={(e) => updateConfig('triggerType', e.target.value)}
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        >
          <option value="processingTime">Processing Time (micro-batch)</option>
          <option value="once">Once (single batch)</option>
          <option value="availableNow">Available Now (all available data)</option>
          <option value="continuous">Continuous (low-latency experimental)</option>
        </select>
      </div>

      {config.triggerType === 'processingTime' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Processing Interval</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={config.processingTimeValue}
              onChange={(e) => updateConfig('processingTimeValue', parseInt(e.target.value) || 0)}
              min={0}
              className="flex-1 px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
            />
            <select
              value={config.processingTimeUnit}
              onChange={(e) => updateConfig('processingTimeUnit', e.target.value)}
              className="w-28 px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
            >
              <option value="milliseconds">Milliseconds</option>
              <option value="seconds">Seconds</option>
              <option value="minutes">Minutes</option>
            </select>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">How often to trigger micro-batches</p>
        </div>
      )}

      {config.triggerType === 'continuous' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Checkpoint Interval</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={config.continuousIntervalValue}
                onChange={(e) => updateConfig('continuousIntervalValue', parseInt(e.target.value) || 0)}
                min={1}
                className="flex-1 px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
              />
              <select
                value={config.continuousIntervalUnit}
                onChange={(e) => updateConfig('continuousIntervalUnit', e.target.value)}
                className="w-28 px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
              >
                <option value="milliseconds">Milliseconds</option>
                <option value="second">Second</option>
                <option value="seconds">Seconds</option>
              </select>
            </div>
          </div>
          <div className="text-xs text-yellow-500 bg-yellow-500/10 px-3 py-2 rounded">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            Continuous mode is experimental and supports limited operations
          </div>
        </>
      )}

      {config.triggerType === 'once' && (
        <div className="text-xs text-gray-400 bg-gray-500/10 px-3 py-2 rounded">
          Processes all available data in a single batch, then stops
        </div>
      )}

      {config.triggerType === 'availableNow' && (
        <div className="text-xs text-gray-400 bg-gray-500/10 px-3 py-2 rounded">
          Processes all available data in multiple batches, then stops
        </div>
      )}

      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm transition-colors"
      >
        <Save className="w-4 h-4" />
        Save Configuration
      </button>
    </div>
  );
};

// ============================================
// ForeachBatch Configuration
// ============================================
export const ForeachBatchConfig = ({ data, onUpdate }: StreamingConfigProps) => {
  const [config, setConfig] = useState({
    functionName: (data.config?.functionName as string) || 'process_batch',
    customCode: (data.config?.customCode as string) || `def process_batch(df, batch_id):
    # Custom processing for each micro-batch
    # df: DataFrame for this batch
    # batch_id: unique identifier for this batch

    # Example: Write to multiple sinks
    df.write.mode("append").parquet("/path/to/parquet")
    df.write.format("jdbc").save()

    # Example: Custom transformations
    # processed = df.filter(col("status") == "active")
    # processed.write.mode("append").delta("/path/to/delta")
`,
  });

  const updateConfig = (key: string, value: unknown) => {
    setConfig({ ...config, [key]: value });
  };

  const handleSave = () => {
    onUpdate(config);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 px-3 py-2 rounded">
        <Waves className="w-4 h-4" />
        <span>Custom processing for each streaming micro-batch</span>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Function Name</label>
        <input
          type="text"
          value={config.functionName}
          onChange={(e) => updateConfig('functionName', e.target.value)}
          placeholder="process_batch"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white font-mono"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Custom Code</label>
        <textarea
          value={config.customCode}
          onChange={(e) => updateConfig('customCode', e.target.value)}
          rows={15}
          className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white font-mono"
          spellCheck={false}
        />
        <p className="text-[10px] text-gray-500 mt-1">
          This function receives (df, batch_id) and is called for each micro-batch
        </p>
      </div>

      <div className="text-xs text-yellow-500 bg-yellow-500/10 px-3 py-2 rounded">
        <AlertTriangle className="w-3 h-3 inline mr-1" />
        foreachBatch enables writing to multiple sinks and custom logic per batch
      </div>

      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm transition-colors"
      >
        <Save className="w-4 h-4" />
        Save Configuration
      </button>
    </div>
  );
};

// ============================================
// Kinesis Source Configuration
// ============================================
export const KinesisSourceConfig = ({ data, onUpdate }: SourceConfigProps) => {
  const [config, setConfig] = useState(data.config || {});
  const [path] = useState((config.path as string) || '');

  const updateConfig = (key: string, value: unknown) => {
    setConfig({ ...config, [key]: value });
  };

  const handleSave = () => {
    onUpdate({ ...config, path, format: 'kinesis' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-orange-400 bg-orange-500/10 px-3 py-2 rounded">
        <Waves className="w-4 h-4" />
        <span>AWS Kinesis Streaming Source</span>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Stream Name *</label>
        <input
          type="text"
          value={(config.streamName as string) || ''}
          onChange={(e) => updateConfig('streamName', e.target.value)}
          placeholder="my-kinesis-stream"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">AWS Region *</label>
        <input
          type="text"
          value={(config.region as string) || 'us-east-1'}
          onChange={(e) => updateConfig('region', e.target.value)}
          placeholder="us-east-1"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Endpoint URL (Optional)</label>
        <input
          type="text"
          value={(config.endpointUrl as string) || ''}
          onChange={(e) => updateConfig('endpointUrl', e.target.value)}
          placeholder="https://kinesis.us-east-1.amazonaws.com"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Starting Position</label>
        <select
          value={(config.startingPosition as string) || 'latest'}
          onChange={(e) => updateConfig('startingPosition', e.target.value)}
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        >
          <option value="latest">Latest</option>
          <option value="trim_horizon">Trim Horizon (oldest)</option>
          <option value="at_timestamp">At Timestamp</option>
        </select>
      </div>

      {config.startingPosition === 'at_timestamp' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Starting Timestamp</label>
          <input
            type="text"
            value={(config.startingTimestamp as string) || ''}
            onChange={(e) => updateConfig('startingTimestamp', e.target.value)}
            placeholder="2024-01-01T00:00:00Z"
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
          />
        </div>
      )}

      <div>
        <label className="block text-xs text-gray-400 mb-1">AWS Access Key (Optional)</label>
        <input
          type="text"
          value={(config.awsAccessKeyId as string) || ''}
          onChange={(e) => updateConfig('awsAccessKeyId', e.target.value)}
          placeholder="Leave empty for IAM role"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">AWS Secret Key (Optional)</label>
        <input
          type="password"
          value={(config.awsSecretAccessKey as string) || ''}
          onChange={(e) => updateConfig('awsSecretAccessKey', e.target.value)}
          placeholder="Leave empty for IAM role"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        />
      </div>

      <p className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
        Requires spark-sql-kinesis package
      </p>

      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm transition-colors"
      >
        <Save className="w-4 h-4" />
        Save Configuration
      </button>
    </div>
  );
};

// ============================================
// Event Hubs Source Configuration
// ============================================
export const EventHubsSourceConfig = ({ data, onUpdate }: SourceConfigProps) => {
  const [config, setConfig] = useState(data.config || {});
  const [path] = useState((config.path as string) || '');

  const updateConfig = (key: string, value: unknown) => {
    setConfig({ ...config, [key]: value });
  };

  const handleSave = () => {
    onUpdate({ ...config, path, format: 'eventHubs' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 px-3 py-2 rounded">
        <Waves className="w-4 h-4" />
        <span>Azure Event Hubs Streaming Source</span>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Connection String *</label>
        <textarea
          value={(config.connectionString as string) || ''}
          onChange={(e) => updateConfig('connectionString', e.target.value)}
          placeholder="Endpoint=sb://namespace.servicebus.windows.net/;SharedAccessKeyName=...;SharedAccessKey=...;EntityPath=eventhub"
          rows={3}
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white font-mono"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Event Hub Name *</label>
        <input
          type="text"
          value={(config.eventHubName as string) || ''}
          onChange={(e) => updateConfig('eventHubName', e.target.value)}
          placeholder="my-event-hub"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Consumer Group</label>
        <input
          type="text"
          value={(config.consumerGroup as string) || '$Default'}
          onChange={(e) => updateConfig('consumerGroup', e.target.value)}
          placeholder="$Default"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Starting Position</label>
        <select
          value={(config.startingPosition as string) || 'latest'}
          onChange={(e) => updateConfig('startingPosition', e.target.value)}
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        >
          <option value="latest">Latest</option>
          <option value="earliest">Earliest</option>
          <option value="enqueued_time">Enqueued Time</option>
        </select>
      </div>

      {config.startingPosition === 'enqueued_time' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Enqueued Time</label>
          <input
            type="text"
            value={(config.enqueuedTime as string) || ''}
            onChange={(e) => updateConfig('enqueuedTime', e.target.value)}
            placeholder="2024-01-01T00:00:00Z"
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
          />
        </div>
      )}

      <div>
        <label className="block text-xs text-gray-400 mb-1">Max Events Per Trigger</label>
        <input
          type="number"
          value={(config.maxEventsPerTrigger as number) || ''}
          onChange={(e) => updateConfig('maxEventsPerTrigger', parseInt(e.target.value))}
          placeholder="Unlimited"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        />
      </div>

      <p className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
        Requires azure-eventhubs-spark package
      </p>

      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm transition-colors"
      >
        <Save className="w-4 h-4" />
        Save Configuration
      </button>
    </div>
  );
};

// ============================================
// Pub/Sub Source Configuration
// ============================================
export const PubSubSourceConfig = ({ data, onUpdate }: SourceConfigProps) => {
  const [config, setConfig] = useState(data.config || {});
  const [path] = useState((config.path as string) || '');

  const updateConfig = (key: string, value: unknown) => {
    setConfig({ ...config, [key]: value });
  };

  const handleSave = () => {
    onUpdate({ ...config, path, format: 'pubsub' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-2 rounded">
        <Waves className="w-4 h-4" />
        <span>Google Cloud Pub/Sub Streaming Source</span>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Project ID *</label>
        <input
          type="text"
          value={(config.projectId as string) || ''}
          onChange={(e) => updateConfig('projectId', e.target.value)}
          placeholder="my-gcp-project"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Subscription *</label>
        <input
          type="text"
          value={(config.subscription as string) || ''}
          onChange={(e) => updateConfig('subscription', e.target.value)}
          placeholder="projects/my-project/subscriptions/my-subscription"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Credentials File (Optional)</label>
        <input
          type="text"
          value={(config.credentialsFile as string) || ''}
          onChange={(e) => updateConfig('credentialsFile', e.target.value)}
          placeholder="/path/to/service-account.json"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        />
        <p className="text-[10px] text-gray-500 mt-1">Leave empty for Application Default Credentials</p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Messages Per Second</label>
        <input
          type="number"
          value={(config.messagesPerSecond as number) || ''}
          onChange={(e) => updateConfig('messagesPerSecond', parseInt(e.target.value))}
          placeholder="1000"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="includeAttributes"
          checked={(config.includeAttributes as boolean) ?? false}
          onChange={(e) => updateConfig('includeAttributes', e.target.checked)}
          className="rounded"
        />
        <label htmlFor="includeAttributes" className="text-xs text-gray-300">Include Message Attributes</label>
      </div>

      <p className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
        Requires spark-streaming-pubsub package
      </p>

      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm transition-colors"
      >
        <Save className="w-4 h-4" />
        Save Configuration
      </button>
    </div>
  );
};
