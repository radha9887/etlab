import { useState } from 'react';
import { Save } from 'lucide-react';
import { MultiColumnSelector } from '../shared';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData, SinkNodeData } from '../../../types';

// Sample Configuration Component
interface SampleConfigProps {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

export const SampleConfig = ({ data, onUpdate }: SampleConfigProps) => {
  const [fraction, setFraction] = useState((data.config?.fraction as number) || 0.1);
  const [withReplacement, setWithReplacement] = useState((data.config?.withReplacement as boolean) || false);
  const [seed, setSeed] = useState((data.config?.seed as string) || '');

  const handleSave = () => {
    onUpdate({ fraction, withReplacement, seed: seed ? parseInt(seed) : undefined });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Sample Fraction (0.0 - 1.0)</label>
        <input type="number" min="0" max="1" step="0.01" value={fraction}
          onChange={(e) => setFraction(parseFloat(e.target.value))}
          className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white" />
        <p className="text-[10px] text-gray-500 mt-1">0.1 = 10% of data, 0.5 = 50% of data</p>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="withReplacement" checked={withReplacement}
          onChange={(e) => setWithReplacement(e.target.checked)} className="rounded" />
        <label htmlFor="withReplacement" className="text-sm text-gray-300">With Replacement</label>
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Random Seed (optional)</label>
        <input type="number" value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="42"
          className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white" />
        <p className="text-[10px] text-gray-500 mt-1">Set seed for reproducible sampling</p>
      </div>
      <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm">
        <Save className="w-4 h-4" /> Save
      </button>
    </div>
  );
};

// DropNA Configuration Component
interface DropNAConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

export const DropNAConfig = ({ data, onUpdate, availableColumns }: DropNAConfigProps) => {
  const [how, setHow] = useState<'any' | 'all'>((data.config?.how as 'any' | 'all') || 'any');
  const [thresh, setThresh] = useState((data.config?.thresh as string) || '');
  const [subset, setSubset] = useState((data.config?.subset as string) || '');

  const handleSave = () => {
    onUpdate({ how, thresh: thresh ? parseInt(thresh) : undefined, subset: subset || undefined });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-gray-400 mb-2">Drop Rows Where</label>
        <div className="flex gap-2">
          <button onClick={() => setHow('any')}
            className={`flex-1 px-3 py-2 text-xs rounded ${how === 'any' ? 'bg-accent text-white' : 'bg-panel text-gray-400'}`}>ANY null</button>
          <button onClick={() => setHow('all')}
            className={`flex-1 px-3 py-2 text-xs rounded ${how === 'all' ? 'bg-accent text-white' : 'bg-panel text-gray-400'}`}>ALL null</button>
        </div>
        <p className="text-[10px] text-gray-500 mt-1">{how === 'any' ? 'Drop if any column is null' : 'Drop only if all columns are null'}</p>
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Threshold (optional)</label>
        <input type="number" value={thresh} onChange={(e) => setThresh(e.target.value)} placeholder="Min non-null values to keep"
          className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white" />
        <p className="text-[10px] text-gray-500 mt-1">Keep rows with at least this many non-null values</p>
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Subset Columns (optional)</label>
        <MultiColumnSelector value={subset} onChange={setSubset} columns={availableColumns} placeholder="Select columns to check" />
        <p className="text-[10px] text-gray-500 mt-1">Only check these columns for nulls</p>
      </div>
      <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm">
        <Save className="w-4 h-4" /> Save
      </button>
    </div>
  );
};

// FillNA Configuration Component
interface FillNAConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

export const FillNAConfig = ({ data, onUpdate, availableColumns }: FillNAConfigProps) => {
  const [mode, setMode] = useState<'single' | 'perColumn'>((data.config?.mode as 'single' | 'perColumn') || 'single');
  const [fillValue, setFillValue] = useState((data.config?.fillValue as string) || '');
  const [subset, setSubset] = useState((data.config?.subset as string) || '');

  const handleSave = () => {
    onUpdate({ mode, fillValue: mode === 'single' ? fillValue : undefined, subset: mode === 'single' && subset ? subset : undefined });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-gray-400 mb-2">Fill Mode</label>
        <div className="flex gap-2">
          <button onClick={() => setMode('single')}
            className={`flex-1 px-3 py-2 text-xs rounded ${mode === 'single' ? 'bg-accent text-white' : 'bg-panel text-gray-400'}`}>Single Value</button>
          <button onClick={() => setMode('perColumn')}
            className={`flex-1 px-3 py-2 text-xs rounded ${mode === 'perColumn' ? 'bg-accent text-white' : 'bg-panel text-gray-400'}`}>Per Column</button>
        </div>
      </div>
      {mode === 'single' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Fill Value</label>
            <input type="text" value={fillValue} onChange={(e) => setFillValue(e.target.value)} placeholder="0, 'unknown', etc."
              className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Subset Columns (optional)</label>
            <MultiColumnSelector value={subset} onChange={setSubset} columns={availableColumns} placeholder="Apply to specific columns" />
          </div>
        </>
      )}
      <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm">
        <Save className="w-4 h-4" /> Save
      </button>
    </div>
  );
};

// Union Configuration Component
interface UnionConfigProps {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

export const UnionConfig = ({ data, onUpdate }: UnionConfigProps) => {
  const [byName, setByName] = useState((data.config?.byName as boolean) || false);
  const [allowMissingColumns, setAllowMissingColumns] = useState((data.config?.allowMissingColumns as boolean) || false);

  const handleSave = () => {
    onUpdate({ byName, allowMissingColumns });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-panel rounded border border-gray-700">
        <p className="text-xs text-gray-400 mb-2">Union combines rows from two DataFrames.</p>
        <p className="text-[10px] text-gray-500">Connect a second input to this node using the context menu.</p>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="byName" checked={byName} onChange={(e) => setByName(e.target.checked)} className="rounded" />
        <label htmlFor="byName" className="text-sm text-gray-300">Union By Name</label>
      </div>
      <p className="text-[10px] text-gray-500 -mt-2 ml-6">Match columns by name instead of position</p>
      {byName && (
        <div className="flex items-center gap-2 ml-4">
          <input type="checkbox" id="allowMissing" checked={allowMissingColumns} onChange={(e) => setAllowMissingColumns(e.target.checked)} className="rounded" />
          <label htmlFor="allowMissing" className="text-sm text-gray-300">Allow Missing Columns</label>
        </div>
      )}
      <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm">
        <Save className="w-4 h-4" /> Save
      </button>
    </div>
  );
};

// Generic Transform Configuration (for remaining transforms)
interface GenericTransformConfigProps {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

export const GenericTransformConfig = ({ data, onUpdate }: GenericTransformConfigProps) => {
  const [columns, setColumns] = useState((data.config?.columns as string) || '');
  const [value, setValue] = useState((data.config?.value as string) || '');

  const getConfigFields = () => {
    switch (data.transformType) {
      case 'limit':
        return (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Number of Rows</label>
            <input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="100"
              className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white" />
          </div>
        );
      case 'rename':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Old Column Name</label>
              <input type="text" value={columns} onChange={(e) => setColumns(e.target.value)} placeholder="old_name"
                className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">New Column Name</label>
              <input type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder="new_name"
                className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white" />
            </div>
          </div>
        );
      default:
        return <p className="text-xs text-gray-500">No additional configuration needed.</p>;
    }
  };

  const handleSave = () => {
    onUpdate({ columns, value });
  };

  return (
    <div className="space-y-4">
      {getConfigFields()}
      <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm">
        <Save className="w-4 h-4" /> Save
      </button>
    </div>
  );
};

// Sink Configuration Component
interface SinkConfigProps {
  data: SinkNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Collapsible = ({ title, children, defaultOpen = false }: CollapsibleProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-700 rounded">
      <button onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-panel-light">
        <span>{isOpen ? '▼' : '▶'}</span> {title}
      </button>
      {isOpen && <div className="px-3 pb-3 space-y-3">{children}</div>}
    </div>
  );
};

export const SinkConfig = ({ data, onUpdate }: SinkConfigProps) => {
  const [config, setConfig] = useState(data.config || {});
  const [path, setPath] = useState((config.path as string) || '');
  const [mode, setMode] = useState((config.mode as string) || 'overwrite');
  const [partitionBy, setPartitionBy] = useState((config.partitionBy as string) || '');

  const updateConfig = (key: string, value: unknown) => {
    setConfig({ ...config, [key]: value });
  };

  const handleSave = () => {
    onUpdate({ ...config, path, mode, partitionBy });
  };

  const renderCsvOptions = () => (
    <>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="header" checked={(config.header as boolean) ?? true}
          onChange={(e) => updateConfig('header', e.target.checked)} className="rounded" />
        <label htmlFor="header" className="text-xs text-gray-300">Include Header</label>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Delimiter</label>
        <select value={(config.delimiter as string) || ','}
          onChange={(e) => updateConfig('delimiter', e.target.value)}
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white">
          <option value=",">Comma (,)</option>
          <option value="\t">Tab</option>
          <option value="|">Pipe (|)</option>
          <option value=";">Semicolon (;)</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Compression</label>
        <select value={(config.compression as string) || 'none'}
          onChange={(e) => updateConfig('compression', e.target.value)}
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white">
          <option value="none">None</option>
          <option value="gzip">GZIP</option>
          <option value="bzip2">BZIP2</option>
        </select>
      </div>

      <Collapsible title="Advanced Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Quote Character</label>
          <input type="text" value={(config.quote as string) || '"'} maxLength={1}
            onChange={(e) => updateConfig('quote', e.target.value)}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Escape Character</label>
          <input type="text" value={(config.escape as string) || '\\'} maxLength={1}
            onChange={(e) => updateConfig('escape', e.target.value)}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Null Value String</label>
          <input type="text" value={(config.nullValue as string) || ''}
            onChange={(e) => updateConfig('nullValue', e.target.value)} placeholder="NULL"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Date Format</label>
          <input type="text" value={(config.dateFormat as string) || ''}
            onChange={(e) => updateConfig('dateFormat', e.target.value)} placeholder="yyyy-MM-dd"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Timestamp Format</label>
          <input type="text" value={(config.timestampFormat as string) || ''}
            onChange={(e) => updateConfig('timestampFormat', e.target.value)} placeholder="yyyy-MM-dd HH:mm:ss"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="emptyValue" checked={(config.emptyValue as boolean) ?? false}
            onChange={(e) => updateConfig('emptyValue', e.target.checked)} className="rounded" />
          <label htmlFor="emptyValue" className="text-xs text-gray-300">Write Empty String for Null</label>
        </div>
      </Collapsible>
    </>
  );

  const renderParquetOptions = () => (
    <>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Compression</label>
        <select value={(config.compression as string) || 'snappy'}
          onChange={(e) => updateConfig('compression', e.target.value)}
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white">
          <option value="snappy">Snappy (Recommended)</option>
          <option value="gzip">GZIP</option>
          <option value="lz4">LZ4</option>
          <option value="zstd">ZSTD</option>
          <option value="none">None</option>
        </select>
      </div>
    </>
  );

  const renderJsonOptions = () => (
    <>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Compression</label>
        <select value={(config.compression as string) || 'none'}
          onChange={(e) => updateConfig('compression', e.target.value)}
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white">
          <option value="none">None</option>
          <option value="gzip">GZIP</option>
          <option value="bzip2">BZIP2</option>
        </select>
      </div>

      <Collapsible title="Advanced Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Date Format</label>
          <input type="text" value={(config.dateFormat as string) || ''}
            onChange={(e) => updateConfig('dateFormat', e.target.value)} placeholder="yyyy-MM-dd"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Timestamp Format</label>
          <input type="text" value={(config.timestampFormat as string) || ''}
            onChange={(e) => updateConfig('timestampFormat', e.target.value)} placeholder="yyyy-MM-dd'T'HH:mm:ss"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="lineSep" checked={(config.lineSep as boolean) ?? true}
            onChange={(e) => updateConfig('lineSep', e.target.checked)} className="rounded" />
          <label htmlFor="lineSep" className="text-xs text-gray-300">JSON Lines Format</label>
        </div>
      </Collapsible>
    </>
  );

  const renderJdbcOptions = () => (
    <>
      <div>
        <label className="block text-xs text-gray-400 mb-1">JDBC URL</label>
        <input type="text" value={(config.url as string) || ''}
          onChange={(e) => updateConfig('url', e.target.value)}
          placeholder="jdbc:postgresql://host:5432/database"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Table Name</label>
        <input type="text" value={(config.dbtable as string) || ''}
          onChange={(e) => updateConfig('dbtable', e.target.value)} placeholder="schema.table_name"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Username</label>
        <input type="text" value={(config.user as string) || ''}
          onChange={(e) => updateConfig('user', e.target.value)} placeholder="username"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Password</label>
        <input type="password" value={(config.password as string) || ''}
          onChange={(e) => updateConfig('password', e.target.value)} placeholder="********"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
      </div>

      <Collapsible title="Advanced Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Batch Size</label>
          <input type="number" value={(config.batchsize as number) || ''}
            onChange={(e) => updateConfig('batchsize', parseInt(e.target.value))} placeholder="1000"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="truncate" checked={(config.truncate as boolean) ?? false}
            onChange={(e) => updateConfig('truncate', e.target.checked)} className="rounded" />
          <label htmlFor="truncate" className="text-xs text-gray-300">Truncate Before Insert</label>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Create Table Options</label>
          <input type="text" value={(config.createTableOptions as string) || ''}
            onChange={(e) => updateConfig('createTableOptions', e.target.value)}
            placeholder="ENGINE=InnoDB"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Isolation Level</label>
          <select value={(config.isolationLevel as string) || 'READ_UNCOMMITTED'}
            onChange={(e) => updateConfig('isolationLevel', e.target.value)}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white">
            <option value="NONE">None</option>
            <option value="READ_UNCOMMITTED">Read Uncommitted</option>
            <option value="READ_COMMITTED">Read Committed</option>
            <option value="REPEATABLE_READ">Repeatable Read</option>
            <option value="SERIALIZABLE">Serializable</option>
          </select>
        </div>
      </Collapsible>
    </>
  );

  const renderDeltaOptions = () => (
    <>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="mergeSchema" checked={(config.mergeSchema as boolean) ?? false}
          onChange={(e) => updateConfig('mergeSchema', e.target.checked)} className="rounded" />
        <label htmlFor="mergeSchema" className="text-xs text-gray-300">Merge Schema</label>
      </div>
      <p className="text-[10px] text-gray-500 -mt-2 ml-6">Add new columns automatically</p>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="overwriteSchema" checked={(config.overwriteSchema as boolean) ?? false}
          onChange={(e) => updateConfig('overwriteSchema', e.target.checked)} className="rounded" />
        <label htmlFor="overwriteSchema" className="text-xs text-gray-300">Overwrite Schema</label>
      </div>

      <Collapsible title="Z-Order Optimization">
        <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded mb-3">
          <p className="text-[10px] text-blue-400">
            Z-Order co-locates related data for faster queries. Best for columns used in WHERE clauses.
          </p>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <input type="checkbox" id="enableZOrder" checked={(config.enableZOrder as boolean) ?? false}
            onChange={(e) => updateConfig('enableZOrder', e.target.checked)} className="rounded" />
          <label htmlFor="enableZOrder" className="text-xs text-gray-300">Enable Z-Order after write</label>
        </div>

        {(config.enableZOrder as boolean) && (
          <>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Z-Order Columns</label>
              <input type="text" value={(config.zOrderColumns as string) || ''}
                onChange={(e) => updateConfig('zOrderColumns', e.target.value)}
                placeholder="date, region, customer_id"
                className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
              <p className="text-[10px] text-gray-500 mt-1">Comma-separated columns (max 4 recommended)</p>
            </div>

            <div className="mt-2">
              <label className="block text-xs text-gray-400 mb-1">Optimize Where (optional)</label>
              <input type="text" value={(config.optimizeWhere as string) || ''}
                onChange={(e) => updateConfig('optimizeWhere', e.target.value)}
                placeholder="date >= '2024-01-01'"
                className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
              <p className="text-[10px] text-gray-500 mt-1">Only optimize partitions matching condition</p>
            </div>
          </>
        )}
      </Collapsible>

      <Collapsible title="Advanced Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Replace Where (Conditional Overwrite)</label>
          <input type="text" value={(config.replaceWhere as string) || ''}
            onChange={(e) => updateConfig('replaceWhere', e.target.value)}
            placeholder="date >= '2024-01-01'"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
          <p className="text-[10px] text-gray-500 mt-1">Only replace partitions matching condition</p>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">User Metadata</label>
          <input type="text" value={(config.userMetadata as string) || ''}
            onChange={(e) => updateConfig('userMetadata', e.target.value)}
            placeholder="JSON string"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>
      </Collapsible>
    </>
  );

  const renderKafkaOptions = () => (
    <>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Bootstrap Servers</label>
        <input type="text" value={(config.bootstrapServers as string) || ''}
          onChange={(e) => updateConfig('bootstrapServers', e.target.value)} placeholder="localhost:9092"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Topic</label>
        <input type="text" value={(config.topic as string) || ''}
          onChange={(e) => updateConfig('topic', e.target.value)} placeholder="output-topic"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
      </div>

      <Collapsible title="Advanced Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Key Column (optional)</label>
          <input type="text" value={(config.keyColumn as string) || ''}
            onChange={(e) => updateConfig('keyColumn', e.target.value)} placeholder="id"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Value Column (optional)</label>
          <input type="text" value={(config.valueColumn as string) || ''}
            onChange={(e) => updateConfig('valueColumn', e.target.value)} placeholder="Default: all columns as JSON"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>
      </Collapsible>
    </>
  );

  const renderOrcOptions = () => (
    <>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Compression</label>
        <select value={(config.compression as string) || 'snappy'}
          onChange={(e) => updateConfig('compression', e.target.value)}
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white">
          <option value="snappy">Snappy (Recommended)</option>
          <option value="zlib">ZLIB</option>
          <option value="lzo">LZO</option>
          <option value="none">None</option>
        </select>
      </div>
    </>
  );

  const renderAvroOptions = () => (
    <>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Compression</label>
        <select value={(config.compression as string) || 'snappy'}
          onChange={(e) => updateConfig('compression', e.target.value)}
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white">
          <option value="snappy">Snappy (Recommended)</option>
          <option value="deflate">Deflate</option>
          <option value="uncompressed">Uncompressed</option>
        </select>
      </div>

      <Collapsible title="Advanced Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Avro Schema (Optional)</label>
          <textarea value={(config.avroSchema as string) || ''}
            onChange={(e) => updateConfig('avroSchema', e.target.value)}
            placeholder='{"type": "record", "name": "...", "fields": [...]}'
            rows={4}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white font-mono" />
        </div>
      </Collapsible>
    </>
  );

  const renderTextOptions = () => (
    <>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Compression</label>
        <select value={(config.compression as string) || 'none'}
          onChange={(e) => updateConfig('compression', e.target.value)}
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white">
          <option value="none">None</option>
          <option value="gzip">GZIP</option>
          <option value="bzip2">BZIP2</option>
        </select>
      </div>

      <Collapsible title="Advanced Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Line Separator</label>
          <select value={(config.lineSep as string) || '\\n'}
            onChange={(e) => updateConfig('lineSep', e.target.value)}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white">
            <option value="\n">Unix (LF)</option>
            <option value="\r\n">Windows (CRLF)</option>
          </select>
        </div>
      </Collapsible>

      <p className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
        Text format requires DataFrame with a single string column named "value"
      </p>
    </>
  );

  const renderXmlOptions = () => (
    <>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Row Tag</label>
        <input type="text" value={(config.rowTag as string) || 'row'}
          onChange={(e) => updateConfig('rowTag', e.target.value)} placeholder="row"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Root Tag (Optional)</label>
        <input type="text" value={(config.rootTag as string) || ''}
          onChange={(e) => updateConfig('rootTag', e.target.value)} placeholder="root"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
      </div>

      <Collapsible title="Advanced Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Null Value</label>
          <input type="text" value={(config.nullValue as string) || ''}
            onChange={(e) => updateConfig('nullValue', e.target.value)} placeholder="null"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>
      </Collapsible>

      <p className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
        Requires spark-xml package
      </p>
    </>
  );

  const renderIcebergOptions = () => (
    <>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="mergeSchema" checked={(config.mergeSchema as boolean) ?? false}
          onChange={(e) => updateConfig('mergeSchema', e.target.checked)} className="rounded" />
        <label htmlFor="mergeSchema" className="text-xs text-gray-300">Merge Schema</label>
      </div>
      <p className="text-[10px] text-gray-500 -mt-2 ml-6">Add new columns automatically</p>

      <p className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
        Requires iceberg-spark-runtime package
      </p>
    </>
  );

  const renderHudiOptions = () => (
    <>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Table Name</label>
        <input type="text" value={(config.tableName as string) || ''}
          onChange={(e) => updateConfig('tableName', e.target.value)} placeholder="hudi_table"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Record Key Field</label>
        <input type="text" value={(config.recordKeyField as string) || ''}
          onChange={(e) => updateConfig('recordKeyField', e.target.value)} placeholder="id"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Precombine Field</label>
        <input type="text" value={(config.precombineField as string) || ''}
          onChange={(e) => updateConfig('precombineField', e.target.value)} placeholder="timestamp"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
      </div>

      <Collapsible title="Advanced Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Operation</label>
          <select value={(config.operation as string) || 'upsert'}
            onChange={(e) => updateConfig('operation', e.target.value)}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white">
            <option value="upsert">Upsert</option>
            <option value="insert">Insert</option>
            <option value="bulk_insert">Bulk Insert</option>
            <option value="delete">Delete</option>
          </select>
        </div>
      </Collapsible>

      <p className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
        Requires hudi-spark-bundle package
      </p>
    </>
  );

  const renderSnowflakeSinkOptions = () => (
    <>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Account</label>
        <input type="text" value={(config.sfAccount as string) || ''}
          onChange={(e) => updateConfig('sfAccount', e.target.value)}
          placeholder="your_account.region"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
        <p className="text-[10px] text-gray-500 mt-1">e.g., xy12345.us-east-1</p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Warehouse</label>
        <input type="text" value={(config.sfWarehouse as string) || ''}
          onChange={(e) => updateConfig('sfWarehouse', e.target.value)}
          placeholder="COMPUTE_WH"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Database</label>
        <input type="text" value={(config.sfDatabase as string) || ''}
          onChange={(e) => updateConfig('sfDatabase', e.target.value)}
          placeholder="MY_DATABASE"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Schema</label>
        <input type="text" value={(config.sfSchema as string) || 'PUBLIC'}
          onChange={(e) => updateConfig('sfSchema', e.target.value)}
          placeholder="PUBLIC"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Table</label>
        <input type="text" value={(config.dbtable as string) || ''}
          onChange={(e) => updateConfig('dbtable', e.target.value)}
          placeholder="MY_TABLE"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
      </div>

      <Collapsible title="Authentication">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Username</label>
          <input type="text" value={(config.sfUser as string) || ''}
            onChange={(e) => updateConfig('sfUser', e.target.value)}
            placeholder="username"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Password</label>
          <input type="password" value={(config.sfPassword as string) || ''}
            onChange={(e) => updateConfig('sfPassword', e.target.value)}
            placeholder="********"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Role (Optional)</label>
          <input type="text" value={(config.sfRole as string) || ''}
            onChange={(e) => updateConfig('sfRole', e.target.value)}
            placeholder="ACCOUNTADMIN"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>
      </Collapsible>

      <Collapsible title="Advanced Options">
        <div className="flex items-center gap-2">
          <input type="checkbox" id="sfTruncate" checked={(config.truncateTable as boolean) ?? false}
            onChange={(e) => updateConfig('truncateTable', e.target.checked)} className="rounded" />
          <label htmlFor="sfTruncate" className="text-xs text-gray-300">Truncate Table Before Write</label>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="sfPreActions" checked={(config.useStagingTable as boolean) ?? true}
            onChange={(e) => updateConfig('useStagingTable', e.target.checked)} className="rounded" />
          <label htmlFor="sfPreActions" className="text-xs text-gray-300">Use Staging Table</label>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Pre-SQL Actions</label>
          <textarea value={(config.preActions as string) || ''}
            onChange={(e) => updateConfig('preActions', e.target.value)}
            placeholder="DROP TABLE IF EXISTS temp_table;"
            rows={2}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white font-mono" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Post-SQL Actions</label>
          <textarea value={(config.postActions as string) || ''}
            onChange={(e) => updateConfig('postActions', e.target.value)}
            placeholder="GRANT SELECT ON table TO role;"
            rows={2}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white font-mono" />
        </div>
      </Collapsible>

      <p className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
        Requires snowflake-spark-connector package
      </p>
    </>
  );

  const renderBigQuerySinkOptions = () => (
    <>
      <div>
        <label className="block text-xs text-gray-400 mb-1">GCP Project</label>
        <input type="text" value={(config.project as string) || ''}
          onChange={(e) => updateConfig('project', e.target.value)}
          placeholder="my-gcp-project"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Dataset</label>
        <input type="text" value={(config.dataset as string) || ''}
          onChange={(e) => updateConfig('dataset', e.target.value)}
          placeholder="my_dataset"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Table</label>
        <input type="text" value={(config.table as string) || ''}
          onChange={(e) => updateConfig('table', e.target.value)}
          placeholder="my_table"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Temporary GCS Bucket</label>
        <input type="text" value={(config.temporaryGcsBucket as string) || ''}
          onChange={(e) => updateConfig('temporaryGcsBucket', e.target.value)}
          placeholder="my-temp-bucket"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
        <p className="text-[10px] text-gray-500 mt-1">Required for writing to BigQuery</p>
      </div>

      <Collapsible title="Write Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Write Disposition</label>
          <select value={(config.writeDisposition as string) || 'WRITE_TRUNCATE'}
            onChange={(e) => updateConfig('writeDisposition', e.target.value)}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white">
            <option value="WRITE_TRUNCATE">Truncate (Overwrite)</option>
            <option value="WRITE_APPEND">Append</option>
            <option value="WRITE_EMPTY">Write Empty (Fail if exists)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Create Disposition</label>
          <select value={(config.createDisposition as string) || 'CREATE_IF_NEEDED'}
            onChange={(e) => updateConfig('createDisposition', e.target.value)}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white">
            <option value="CREATE_IF_NEEDED">Create If Needed</option>
            <option value="CREATE_NEVER">Never Create</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="bqAllowFieldAddition" checked={(config.allowFieldAddition as boolean) ?? false}
            onChange={(e) => updateConfig('allowFieldAddition', e.target.checked)} className="rounded" />
          <label htmlFor="bqAllowFieldAddition" className="text-xs text-gray-300">Allow Field Addition</label>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="bqAllowFieldRelaxation" checked={(config.allowFieldRelaxation as boolean) ?? false}
            onChange={(e) => updateConfig('allowFieldRelaxation', e.target.checked)} className="rounded" />
          <label htmlFor="bqAllowFieldRelaxation" className="text-xs text-gray-300">Allow Field Relaxation</label>
        </div>
      </Collapsible>

      <Collapsible title="Partitioning">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Partition Field</label>
          <input type="text" value={(config.partitionField as string) || ''}
            onChange={(e) => updateConfig('partitionField', e.target.value)}
            placeholder="date_column"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Partition Type</label>
          <select value={(config.partitionType as string) || 'DAY'}
            onChange={(e) => updateConfig('partitionType', e.target.value)}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white">
            <option value="DAY">Day</option>
            <option value="HOUR">Hour</option>
            <option value="MONTH">Month</option>
            <option value="YEAR">Year</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Clustering Fields</label>
          <input type="text" value={(config.clusteringFields as string) || ''}
            onChange={(e) => updateConfig('clusteringFields', e.target.value)}
            placeholder="col1, col2, col3, col4"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
          <p className="text-[10px] text-gray-500 mt-1">Max 4 columns, comma-separated</p>
        </div>
      </Collapsible>

      <Collapsible title="Authentication">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Auth Type</label>
          <select value={(config.authType as string) || 'application_default'}
            onChange={(e) => updateConfig('authType', e.target.value)}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white">
            <option value="application_default">Application Default</option>
            <option value="service_account">Service Account JSON</option>
          </select>
        </div>

        {config.authType === 'service_account' && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Credentials File Path</label>
            <input type="text" value={(config.credentialsFile as string) || ''}
              onChange={(e) => updateConfig('credentialsFile', e.target.value)}
              placeholder="/path/to/service-account.json"
              className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
          </div>
        )}
      </Collapsible>

      <p className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
        Requires spark-bigquery-with-dependencies package
      </p>
    </>
  );

  const renderRedshiftSinkOptions = () => (
    <>
      <div>
        <label className="block text-xs text-gray-400 mb-1">JDBC URL</label>
        <input type="text" value={(config.url as string) || ''}
          onChange={(e) => updateConfig('url', e.target.value)}
          placeholder="jdbc:redshift://cluster.region.redshift.amazonaws.com:5439/database"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Table</label>
        <input type="text" value={(config.dbtable as string) || ''}
          onChange={(e) => updateConfig('dbtable', e.target.value)}
          placeholder="schema.table_name"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Temp S3 Directory</label>
        <input type="text" value={(config.tempdir as string) || ''}
          onChange={(e) => updateConfig('tempdir', e.target.value)}
          placeholder="s3://my-bucket/temp/"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
        <p className="text-[10px] text-gray-500 mt-1">Required for COPY operations</p>
      </div>

      <Collapsible title="Authentication">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Username</label>
          <input type="text" value={(config.user as string) || ''}
            onChange={(e) => updateConfig('user', e.target.value)}
            placeholder="username"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Password</label>
          <input type="password" value={(config.password as string) || ''}
            onChange={(e) => updateConfig('password', e.target.value)}
            placeholder="********"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">IAM Role ARN (for COPY)</label>
          <input type="text" value={(config.iamRole as string) || ''}
            onChange={(e) => updateConfig('iamRole', e.target.value)}
            placeholder="arn:aws:iam::123456789:role/my-role"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>
      </Collapsible>

      <Collapsible title="AWS Credentials (for S3)">
        <div>
          <label className="block text-xs text-gray-400 mb-1">AWS Access Key ID</label>
          <input type="text" value={(config.awsAccessKeyId as string) || ''}
            onChange={(e) => updateConfig('awsAccessKeyId', e.target.value)}
            placeholder="AKIAIOSFODNN7EXAMPLE"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">AWS Secret Access Key</label>
          <input type="password" value={(config.awsSecretAccessKey as string) || ''}
            onChange={(e) => updateConfig('awsSecretAccessKey', e.target.value)}
            placeholder="********"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>
      </Collapsible>

      <Collapsible title="Advanced Options">
        <div className="flex items-center gap-2">
          <input type="checkbox" id="rsPreActions" checked={(config.preActions as boolean) ?? false}
            onChange={(e) => updateConfig('preActions', e.target.checked)} className="rounded" />
          <label htmlFor="rsPreActions" className="text-xs text-gray-300">Run Pre-Actions SQL</label>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Pre-Actions SQL</label>
          <textarea value={(config.preActionsSql as string) || ''}
            onChange={(e) => updateConfig('preActionsSql', e.target.value)}
            placeholder="TRUNCATE TABLE schema.table;"
            rows={2}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white font-mono" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Post-Actions SQL</label>
          <textarea value={(config.postActionsSql as string) || ''}
            onChange={(e) => updateConfig('postActionsSql', e.target.value)}
            placeholder="ANALYZE schema.table;"
            rows={2}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white font-mono" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Forward Spark S3 Credentials</label>
          <select value={(config.forwardSparkS3Credentials as string) || 'true'}
            onChange={(e) => updateConfig('forwardSparkS3Credentials', e.target.value)}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white">
            <option value="true">Yes (Recommended)</option>
            <option value="false">No</option>
          </select>
        </div>
      </Collapsible>

      <p className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
        Requires spark-redshift package
      </p>
    </>
  );

  const renderCustomSinkOptions = () => (
    <>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Format Name</label>
        <input type="text" value={(config.format as string) || ''}
          onChange={(e) => updateConfig('format', e.target.value)} placeholder="custom_format"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
        <p className="text-[10px] text-gray-500 mt-1">The Spark format name (e.g., bigquery, snowflake)</p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Custom Options (JSON)</label>
        <textarea value={(config.customOptions as string) || '{}'}
          onChange={(e) => updateConfig('customOptions', e.target.value)}
          placeholder='{"option1": "value1", "option2": "value2"}'
          rows={6}
          className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white font-mono" />
        <p className="text-[10px] text-gray-500 mt-1">JSON object with format-specific options</p>
      </div>
    </>
  );

  const renderConsoleOptions = () => (
    <>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Number of Rows</label>
        <input type="number" value={(config.numRows as number) || 20}
          onChange={(e) => updateConfig('numRows', parseInt(e.target.value))} placeholder="20"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="truncate" checked={(config.truncate as boolean) ?? true}
          onChange={(e) => updateConfig('truncate', e.target.checked)} className="rounded" />
        <label htmlFor="truncate" className="text-xs text-gray-300">Truncate Long Values</label>
      </div>

      <p className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
        Console sink outputs to stdout - useful for debugging
      </p>
    </>
  );

  // Redis sink options
  const renderRedisSinkOptions = () => (
    <>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Host</label>
        <input type="text" value={(config.host as string) || ''}
          onChange={(e) => updateConfig('host', e.target.value)}
          placeholder="localhost"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Port</label>
        <input type="number" value={(config.port as number) || 6379}
          onChange={(e) => updateConfig('port', parseInt(e.target.value))}
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Database Index</label>
        <input type="number" value={(config.dbIndex as number) || 0}
          onChange={(e) => updateConfig('dbIndex', parseInt(e.target.value))}
          placeholder="0"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Key Column</label>
        <input type="text" value={(config.keyColumn as string) || ''}
          onChange={(e) => updateConfig('keyColumn', e.target.value)}
          placeholder="id"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
        <p className="text-[10px] text-gray-500 mt-1">Column to use as Redis key</p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Key Prefix</label>
        <input type="text" value={(config.keyPrefix as string) || ''}
          onChange={(e) => updateConfig('keyPrefix', e.target.value)}
          placeholder="user:"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Data Type</label>
        <select value={(config.dataType as string) || 'hash'}
          onChange={(e) => updateConfig('dataType', e.target.value)}
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white">
          <option value="hash">Hash</option>
          <option value="string">String (JSON)</option>
          <option value="list">List</option>
          <option value="set">Set</option>
          <option value="stream">Stream</option>
        </select>
      </div>

      <Collapsible title="Authentication">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Password</label>
          <input type="password" value={(config.password as string) || ''}
            onChange={(e) => updateConfig('password', e.target.value)}
            placeholder="Optional"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Username (Redis 6+)</label>
          <input type="text" value={(config.username as string) || ''}
            onChange={(e) => updateConfig('username', e.target.value)}
            placeholder="default"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="useSsl" checked={(config.useSsl as boolean) ?? false}
            onChange={(e) => updateConfig('useSsl', e.target.checked)} className="rounded" />
          <label htmlFor="useSsl" className="text-xs text-gray-300">Use SSL/TLS</label>
        </div>
      </Collapsible>

      <Collapsible title="Advanced Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">TTL (seconds)</label>
          <input type="number" value={(config.ttl as number) || ''}
            onChange={(e) => updateConfig('ttl', parseInt(e.target.value))}
            placeholder="No expiration"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Batch Size</label>
          <input type="number" value={(config.batchSize as number) || 1000}
            onChange={(e) => updateConfig('batchSize', parseInt(e.target.value))}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>
      </Collapsible>

      <p className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
        Requires spark-redis package
      </p>
    </>
  );

  // Neo4j sink options
  const renderNeo4jSinkOptions = () => (
    <>
      <div>
        <label className="block text-xs text-gray-400 mb-1">URI</label>
        <input type="text" value={(config.uri as string) || ''}
          onChange={(e) => updateConfig('uri', e.target.value)}
          placeholder="bolt://localhost:7687"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Database</label>
        <input type="text" value={(config.database as string) || ''}
          onChange={(e) => updateConfig('database', e.target.value)}
          placeholder="neo4j"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Write Mode</label>
        <select value={(config.saveMode as string) || 'Overwrite'}
          onChange={(e) => updateConfig('saveMode', e.target.value)}
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white">
          <option value="Overwrite">Overwrite</option>
          <option value="Append">Append</option>
          <option value="ErrorIfExists">Error If Exists</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Labels</label>
        <input type="text" value={(config.labels as string) || ''}
          onChange={(e) => updateConfig('labels', e.target.value)}
          placeholder="Person, Employee"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
        <p className="text-[10px] text-gray-500 mt-1">Comma-separated node labels</p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Node Keys</label>
        <input type="text" value={(config.nodeKeys as string) || ''}
          onChange={(e) => updateConfig('nodeKeys', e.target.value)}
          placeholder="id"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
        <p className="text-[10px] text-gray-500 mt-1">Columns used as unique identifiers</p>
      </div>

      <Collapsible title="Relationship Options">
        <div className="flex items-center gap-2 mb-2">
          <input type="checkbox" id="writeRelationship" checked={(config.writeRelationship as boolean) ?? false}
            onChange={(e) => updateConfig('writeRelationship', e.target.checked)} className="rounded" />
          <label htmlFor="writeRelationship" className="text-xs text-gray-300">Write as Relationship</label>
        </div>

        {(config.writeRelationship as boolean) && (
          <>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Relationship Type</label>
              <input type="text" value={(config.relationshipType as string) || ''}
                onChange={(e) => updateConfig('relationshipType', e.target.value)}
                placeholder="KNOWS"
                className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Source Node Label</label>
              <input type="text" value={(config.sourceNodeLabel as string) || ''}
                onChange={(e) => updateConfig('sourceNodeLabel', e.target.value)}
                placeholder="Person"
                className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Target Node Label</label>
              <input type="text" value={(config.targetNodeLabel as string) || ''}
                onChange={(e) => updateConfig('targetNodeLabel', e.target.value)}
                placeholder="Person"
                className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
            </div>
          </>
        )}
      </Collapsible>

      <Collapsible title="Authentication">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Username</label>
          <input type="text" value={(config.username as string) || ''}
            onChange={(e) => updateConfig('username', e.target.value)}
            placeholder="neo4j"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Password</label>
          <input type="password" value={(config.password as string) || ''}
            onChange={(e) => updateConfig('password', e.target.value)}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>
      </Collapsible>

      <Collapsible title="Advanced Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Batch Size</label>
          <input type="number" value={(config.batchSize as number) || 5000}
            onChange={(e) => updateConfig('batchSize', parseInt(e.target.value))}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="encrypted" checked={(config.encrypted as boolean) ?? true}
            onChange={(e) => updateConfig('encrypted', e.target.checked)} className="rounded" />
          <label htmlFor="encrypted" className="text-xs text-gray-300">Use Encryption</label>
        </div>
      </Collapsible>

      <p className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
        Requires neo4j-spark-connector package
      </p>
    </>
  );

  const renderSinkOptions = () => {
    switch (data.sinkType) {
      case 'csv': return renderCsvOptions();
      case 'parquet': return renderParquetOptions();
      case 'json': return renderJsonOptions();
      case 'jdbc': return renderJdbcOptions();
      case 'delta': return renderDeltaOptions();
      case 'kafka': return renderKafkaOptions();
      case 'orc': return renderOrcOptions();
      case 'avro': return renderAvroOptions();
      case 'text': return renderTextOptions();
      case 'xml': return renderXmlOptions();
      case 'iceberg': return renderIcebergOptions();
      case 'hudi': return renderHudiOptions();
      case 'custom': return renderCustomSinkOptions();
      case 'console': return renderConsoleOptions();
      case 'snowflake': return renderSnowflakeSinkOptions();
      case 'bigquery': return renderBigQuerySinkOptions();
      case 'redshift': return renderRedshiftSinkOptions();
      case 'redis': return renderRedisSinkOptions();
      case 'neo4j': return renderNeo4jSinkOptions();
      // Placeholder for other new sinks
      case 'mongodb':
      case 'cassandra':
      case 'elasticsearch':
        return (
          <div className="text-xs text-yellow-500 bg-yellow-500/10 px-3 py-2 rounded">
            Configuration coming soon. Use Custom Sink for now.
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Output Type</label>
        <div className="px-3 py-2 bg-panel rounded text-sm text-gray-300 capitalize">{data.sinkType}</div>
      </div>

      {data.sinkType !== 'jdbc' && data.sinkType !== 'kafka' && data.sinkType !== 'console' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Output Path</label>
          <input type="text" value={path} onChange={(e) => setPath(e.target.value)}
            placeholder={data.sinkType === 'delta' || data.sinkType === 'iceberg' || data.sinkType === 'hudi' ? 's3://bucket/table/' : 's3://bucket/output/path/'}
            className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white" />
        </div>
      )}

      {data.sinkType !== 'console' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Write Mode</label>
          <select value={mode} onChange={(e) => setMode(e.target.value)}
            className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white">
            <option value="overwrite">Overwrite</option>
            <option value="append">Append</option>
            <option value="ignore">Ignore (if exists)</option>
            <option value="error">Error (if exists)</option>
          </select>
        </div>
      )}

      {data.sinkType !== 'jdbc' && data.sinkType !== 'kafka' && data.sinkType !== 'console' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Partition By (optional)</label>
          <input type="text" value={partitionBy} onChange={(e) => setPartitionBy(e.target.value)} placeholder="year, month"
            className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white" />
          <p className="text-[10px] text-gray-500 mt-1">Comma-separated column names</p>
        </div>
      )}

      {renderSinkOptions()}

      {data.sinkType !== 'jdbc' && data.sinkType !== 'kafka' && data.sinkType !== 'console' && (
        <Collapsible title="Bucketing Options">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Bucket By Columns</label>
            <input type="text" value={(config.bucketBy as string) || ''}
              onChange={(e) => updateConfig('bucketBy', e.target.value)} placeholder="user_id"
              className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Number of Buckets</label>
            <input type="number" value={(config.numBuckets as number) || ''}
              onChange={(e) => updateConfig('numBuckets', parseInt(e.target.value))} placeholder="100"
              className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Sort By (within buckets)</label>
            <input type="text" value={(config.sortBy as string) || ''}
              onChange={(e) => updateConfig('sortBy', e.target.value)} placeholder="timestamp"
              className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
          </div>
        </Collapsible>
      )}

      <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm">
        <Save className="w-4 h-4" /> Save
      </button>
    </div>
  );
};
