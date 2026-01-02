import { useState } from 'react';
import { Save, ChevronDown, ChevronRight, ChevronUp, Plus, Trash2, Library } from 'lucide-react';
import type { SourceNodeData, Column, Schema } from '../../../types';
import { useSchemaStore } from '../../../stores/schemaStore';
import { useWorkspaceStore } from '../../../stores/workspaceStore';

interface SourceConfigProps {
  data: SourceNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
  onSchemaUpdate?: (schema: Column[]) => void;
}

// Common Spark data types - grouped by category
const SPARK_DATA_TYPES = {
  'Primitive': ['string', 'integer', 'long', 'short', 'byte', 'double', 'float', 'decimal', 'boolean', 'binary'],
  'Date/Time': ['date', 'timestamp', 'timestamp_ntz'],
  'Complex': ['array<...>', 'map<...>', 'struct<...>', 'custom'],
};

// Flatten for dropdown
const ALL_DATA_TYPES = Object.values(SPARK_DATA_TYPES).flat();

// Check if type is a custom/complex type that needs manual input
const isCustomType = (type: string) => {
  if (!type) return true;
  return type.startsWith('array<') ||
         type.startsWith('map<') ||
         type.startsWith('struct<') ||
         type.startsWith('decimal(') ||
         !ALL_DATA_TYPES.includes(type);
};

// Get the dropdown value for a data type
const getDropdownValue = (type: string) => {
  if (!type) return 'custom';
  if (ALL_DATA_TYPES.includes(type)) return type;
  if (type.startsWith('array<')) return 'array<...>';
  if (type.startsWith('map<')) return 'map<...>';
  if (type.startsWith('struct<')) return 'struct<...>';
  if (type.startsWith('decimal(')) return 'decimal';
  return 'custom';
};

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection = ({ title, children, defaultOpen = false }: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-700 rounded">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-panel-light"
      >
        {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        {title}
      </button>
      {isOpen && <div className="px-3 pb-3 space-y-3">{children}</div>}
    </div>
  );
};

export const SourceConfig = ({ data, onUpdate, onSchemaUpdate }: SourceConfigProps) => {
  const [config, setConfig] = useState(data.config || {});
  const [path, setPath] = useState((config.path as string) || '');
  const [schema, setSchema] = useState<Column[]>(data.schema || []);
  const [isSavingToLibrary, setIsSavingToLibrary] = useState(false);

  const { saveToApi, addSchema, isLoading: isSchemaLoading } = useSchemaStore();
  const { getActiveWorkspace, isApiMode } = useWorkspaceStore();

  const updateConfig = (key: string, value: unknown) => {
    setConfig({ ...config, [key]: value });
  };

  const handleSave = () => {
    onUpdate({ ...config, path, format: data.sourceType });
    if (onSchemaUpdate) {
      onSchemaUpdate(schema);
    }
  };

  const handleSaveToLibrary = async () => {
    if (schema.length === 0) {
      alert('Please add at least one column to save to library');
      return;
    }

    setIsSavingToLibrary(true);
    try {
      const schemaToSave: Schema = {
        id: `schema_${Date.now()}`,
        name: data.label || `${data.sourceType}_schema`,
        source: data.sourceType,
        format: data.sourceType,
        path: path,
        columns: schema,
        config: config,
      };

      if (isApiMode) {
        const workspace = getActiveWorkspace();
        if (!workspace) {
          alert('No active workspace found');
          return;
        }
        const savedSchema = await saveToApi(workspace.id, schemaToSave);
        if (savedSchema) {
          alert(`Schema "${savedSchema.name}" saved to library!`);
        } else {
          alert('Failed to save schema. Please try again.');
        }
      } else {
        // Save locally
        addSchema(schemaToSave);
        alert(`Schema "${schemaToSave.name}" saved to local library!`);
      }
    } catch (error) {
      console.error('Error saving to library:', error);
      alert('Failed to save schema');
    } finally {
      setIsSavingToLibrary(false);
    }
  };

  // Schema management functions
  const addColumn = () => {
    const newColumn: Column = {
      name: `column_${schema.length + 1}`,
      dataType: 'string',
      nullable: true
    };
    setSchema([...schema, newColumn]);
  };

  const updateColumn = (index: number, field: keyof Column, value: string | boolean) => {
    const updatedSchema = [...schema];
    updatedSchema[index] = { ...updatedSchema[index], [field]: value };
    setSchema(updatedSchema);
  };

  const removeColumn = (index: number) => {
    setSchema(schema.filter((_, i) => i !== index));
  };

  const moveColumn = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= schema.length) return;
    const updatedSchema = [...schema];
    const [removed] = updatedSchema.splice(fromIndex, 1);
    updatedSchema.splice(toIndex, 0, removed);
    setSchema(updatedSchema);
  };

  const renderCsvOptions = () => (
    <>
      {/* Basic Options */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Delimiter</label>
          <select
            value={(config.delimiter as string) || ','}
            onChange={(e) => updateConfig('delimiter', e.target.value)}
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
          >
            <option value=",">Comma (,)</option>
            <option value="\t">Tab (\t)</option>
            <option value="|">Pipe (|)</option>
            <option value=";">Semicolon (;)</option>
            <option value=" ">Space</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="header" checked={(config.header as boolean) ?? true}
            onChange={(e) => updateConfig('header', e.target.checked)} className="rounded" />
          <label htmlFor="header" className="text-xs text-gray-300">Has Header Row</label>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="inferSchema" checked={(config.inferSchema as boolean) ?? false}
            onChange={(e) => updateConfig('inferSchema', e.target.checked)} className="rounded" />
          <label htmlFor="inferSchema" className="text-xs text-gray-300">Infer Schema</label>
        </div>
      </div>

      {/* Schema Options */}
      <CollapsibleSection title="Schema Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">DDL Schema (Optional)</label>
          <textarea value={(config.ddlSchema as string) || ''}
            onChange={(e) => updateConfig('ddlSchema', e.target.value)}
            placeholder="id INT, name STRING, amount DOUBLE, created_at TIMESTAMP"
            rows={3}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white font-mono" />
          <p className="text-[10px] text-gray-500 mt-1">Provide explicit schema instead of inferring</p>
        </div>
      </CollapsibleSection>

      {/* Advanced Options */}
      <CollapsibleSection title="Advanced Options">
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
            onChange={(e) => updateConfig('nullValue', e.target.value)} placeholder="NULL, N/A, etc."
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

        <div>
          <label className="block text-xs text-gray-400 mb-1">Encoding</label>
          <select value={(config.encoding as string) || 'UTF-8'}
            onChange={(e) => updateConfig('encoding', e.target.value)}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white">
            <option value="UTF-8">UTF-8</option>
            <option value="UTF-16">UTF-16</option>
            <option value="ISO-8859-1">ISO-8859-1 (Latin-1)</option>
            <option value="US-ASCII">US-ASCII</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Parse Mode</label>
          <select value={(config.mode as string) || 'PERMISSIVE'}
            onChange={(e) => updateConfig('mode', e.target.value)}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white">
            <option value="PERMISSIVE">Permissive (allow malformed)</option>
            <option value="DROPMALFORMED">Drop Malformed</option>
            <option value="FAILFAST">Fail Fast</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="multiLine" checked={(config.multiLine as boolean) ?? false}
            onChange={(e) => updateConfig('multiLine', e.target.checked)} className="rounded" />
          <label htmlFor="multiLine" className="text-xs text-gray-300">Multi-line Records</label>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="ignoreLeadingWhiteSpace" checked={(config.ignoreLeadingWhiteSpace as boolean) ?? false}
            onChange={(e) => updateConfig('ignoreLeadingWhiteSpace', e.target.checked)} className="rounded" />
          <label htmlFor="ignoreLeadingWhiteSpace" className="text-xs text-gray-300">Ignore Leading Whitespace</label>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="ignoreTrailingWhiteSpace" checked={(config.ignoreTrailingWhiteSpace as boolean) ?? false}
            onChange={(e) => updateConfig('ignoreTrailingWhiteSpace', e.target.checked)} className="rounded" />
          <label htmlFor="ignoreTrailingWhiteSpace" className="text-xs text-gray-300">Ignore Trailing Whitespace</label>
        </div>
      </CollapsibleSection>
    </>
  );

  const renderJsonOptions = () => (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input type="checkbox" id="multiLine" checked={(config.multiLine as boolean) ?? false}
            onChange={(e) => updateConfig('multiLine', e.target.checked)} className="rounded" />
          <label htmlFor="multiLine" className="text-xs text-gray-300">Multi-line JSON</label>
        </div>
        <p className="text-[10px] text-gray-500 -mt-2 ml-6">Enable for JSON objects spanning multiple lines</p>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="inferSchema" checked={(config.inferSchema as boolean) ?? true}
            onChange={(e) => updateConfig('inferSchema', e.target.checked)} className="rounded" />
          <label htmlFor="inferSchema" className="text-xs text-gray-300">Infer Schema</label>
        </div>
      </div>

      <CollapsibleSection title="Schema Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">DDL Schema (Optional)</label>
          <textarea value={(config.ddlSchema as string) || ''}
            onChange={(e) => updateConfig('ddlSchema', e.target.value)}
            placeholder="id INT, name STRING, created_at TIMESTAMP"
            rows={3}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white font-mono" />
          <p className="text-[10px] text-gray-500 mt-1">Provide explicit schema instead of inferring</p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Advanced Options">
        <div className="flex items-center gap-2">
          <input type="checkbox" id="primitivesAsString" checked={(config.primitivesAsString as boolean) ?? false}
            onChange={(e) => updateConfig('primitivesAsString', e.target.checked)} className="rounded" />
          <label htmlFor="primitivesAsString" className="text-xs text-gray-300">Primitives as String</label>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="allowComments" checked={(config.allowComments as boolean) ?? false}
            onChange={(e) => updateConfig('allowComments', e.target.checked)} className="rounded" />
          <label htmlFor="allowComments" className="text-xs text-gray-300">Allow Comments</label>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="allowUnquotedFieldNames" checked={(config.allowUnquotedFieldNames as boolean) ?? false}
            onChange={(e) => updateConfig('allowUnquotedFieldNames', e.target.checked)} className="rounded" />
          <label htmlFor="allowUnquotedFieldNames" className="text-xs text-gray-300">Allow Unquoted Field Names</label>
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
            onChange={(e) => updateConfig('timestampFormat', e.target.value)} placeholder="yyyy-MM-dd'T'HH:mm:ss"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Parse Mode</label>
          <select value={(config.mode as string) || 'PERMISSIVE'}
            onChange={(e) => updateConfig('mode', e.target.value)}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white">
            <option value="PERMISSIVE">Permissive</option>
            <option value="DROPMALFORMED">Drop Malformed</option>
            <option value="FAILFAST">Fail Fast</option>
          </select>
        </div>
      </CollapsibleSection>
    </>
  );

  const renderParquetOptions = () => (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input type="checkbox" id="mergeSchema" checked={(config.mergeSchema as boolean) ?? false}
            onChange={(e) => updateConfig('mergeSchema', e.target.checked)} className="rounded" />
          <label htmlFor="mergeSchema" className="text-xs text-gray-300">Merge Schema</label>
        </div>
        <p className="text-[10px] text-gray-500 -mt-2 ml-6">Merge schemas from all part files</p>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="useSchema" checked={(config.useSchema as boolean) ?? false}
            onChange={(e) => updateConfig('useSchema', e.target.checked)} className="rounded" />
          <label htmlFor="useSchema" className="text-xs text-gray-300">Use Defined Schema</label>
        </div>
        <p className="text-[10px] text-gray-500 -mt-2 ml-6">Apply schema from Schema Definition section below</p>
      </div>

      <CollapsibleSection title="Schema Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">DDL Schema (Optional)</label>
          <textarea value={(config.ddlSchema as string) || ''}
            onChange={(e) => updateConfig('ddlSchema', e.target.value)}
            placeholder="id LONG, name STRING, amount DOUBLE, created_at TIMESTAMP"
            rows={3}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white font-mono" />
          <p className="text-[10px] text-gray-500 mt-1">Provide explicit DDL schema string</p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Advanced Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Path Glob Filter</label>
          <input type="text" value={(config.pathGlobFilter as string) || ''}
            onChange={(e) => updateConfig('pathGlobFilter', e.target.value)} placeholder="*.parquet"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="recursiveFileLookup" checked={(config.recursiveFileLookup as boolean) ?? false}
            onChange={(e) => updateConfig('recursiveFileLookup', e.target.checked)} className="rounded" />
          <label htmlFor="recursiveFileLookup" className="text-xs text-gray-300">Recursive File Lookup</label>
        </div>
      </CollapsibleSection>
    </>
  );

  const renderJdbcOptions = () => (
    <>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Database Type</label>
          <select value={(config.dbType as string) || 'postgresql'}
            onChange={(e) => updateConfig('dbType', e.target.value)}
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white">
            <option value="postgresql">PostgreSQL</option>
            <option value="mysql">MySQL</option>
            <option value="sqlserver">SQL Server</option>
            <option value="oracle">Oracle</option>
            <option value="snowflake">Snowflake</option>
            <option value="redshift">Redshift</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">JDBC URL</label>
          <input type="text" value={(config.url as string) || ''}
            onChange={(e) => updateConfig('url', e.target.value)}
            placeholder="jdbc:postgresql://host:5432/database"
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Table / Query</label>
          <input type="text" value={(config.dbtable as string) || ''}
            onChange={(e) => updateConfig('dbtable', e.target.value)} placeholder="schema.table_name or (SELECT ...)"
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
      </div>

      <CollapsibleSection title="Partitioning Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Partition Column</label>
          <input type="text" value={(config.partitionColumn as string) || ''}
            onChange={(e) => updateConfig('partitionColumn', e.target.value)} placeholder="id"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
          <p className="text-[10px] text-gray-500 mt-1">Numeric column for parallel reads</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Lower Bound</label>
            <input type="number" value={(config.lowerBound as number) || ''}
              onChange={(e) => updateConfig('lowerBound', parseInt(e.target.value))} placeholder="0"
              className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Upper Bound</label>
            <input type="number" value={(config.upperBound as number) || ''}
              onChange={(e) => updateConfig('upperBound', parseInt(e.target.value))} placeholder="1000000"
              className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Number of Partitions</label>
          <input type="number" value={(config.numPartitions as number) || ''}
            onChange={(e) => updateConfig('numPartitions', parseInt(e.target.value))} placeholder="10"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Advanced Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Driver Class</label>
          <input type="text" value={(config.driver as string) || ''}
            onChange={(e) => updateConfig('driver', e.target.value)} placeholder="org.postgresql.Driver"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Fetch Size</label>
          <input type="number" value={(config.fetchsize as number) || ''}
            onChange={(e) => updateConfig('fetchsize', parseInt(e.target.value))} placeholder="1000"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Query Timeout (seconds)</label>
          <input type="number" value={(config.queryTimeout as number) || ''}
            onChange={(e) => updateConfig('queryTimeout', parseInt(e.target.value))} placeholder="0"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>
      </CollapsibleSection>
    </>
  );

  const renderDeltaOptions = () => (
    <>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Time Travel Mode</label>
          <select value={(config.timeTravelMode as string) || 'none'}
            onChange={(e) => updateConfig('timeTravelMode', e.target.value)}
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white">
            <option value="none">Latest Version</option>
            <option value="version">Version Number</option>
            <option value="timestamp">Timestamp</option>
          </select>
        </div>

        {config.timeTravelMode === 'version' && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Version</label>
            <input type="number" value={(config.versionAsOf as number) || ''}
              onChange={(e) => updateConfig('versionAsOf', parseInt(e.target.value))} placeholder="0"
              className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
          </div>
        )}

        {config.timeTravelMode === 'timestamp' && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Timestamp</label>
            <input type="text" value={(config.timestampAsOf as string) || ''}
              onChange={(e) => updateConfig('timestampAsOf', e.target.value)}
              placeholder="2024-01-01 00:00:00"
              className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
          </div>
        )}
      </div>
    </>
  );

  const renderKafkaOptions = () => (
    <>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Bootstrap Servers</label>
          <input type="text" value={(config.bootstrapServers as string) || ''}
            onChange={(e) => updateConfig('bootstrapServers', e.target.value)} placeholder="localhost:9092"
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Subscribe Mode</label>
          <select value={(config.subscribeMode as string) || 'topic'}
            onChange={(e) => updateConfig('subscribeMode', e.target.value)}
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white">
            <option value="topic">Single Topic</option>
            <option value="topics">Multiple Topics</option>
            <option value="pattern">Topic Pattern</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">
            {config.subscribeMode === 'pattern' ? 'Topic Pattern' : 'Topic(s)'}
          </label>
          <input type="text" value={(config.subscribe as string) || ''}
            onChange={(e) => updateConfig('subscribe', e.target.value)}
            placeholder={config.subscribeMode === 'pattern' ? 'topic-*' : 'topic1, topic2'}
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Starting Offsets</label>
          <select value={(config.startingOffsets as string) || 'latest'}
            onChange={(e) => updateConfig('startingOffsets', e.target.value)}
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white">
            <option value="earliest">Earliest</option>
            <option value="latest">Latest</option>
          </select>
        </div>
      </div>

      <CollapsibleSection title="Advanced Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Ending Offsets (Batch only)</label>
          <select value={(config.endingOffsets as string) || 'latest'}
            onChange={(e) => updateConfig('endingOffsets', e.target.value)}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white">
            <option value="latest">Latest</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Max Offsets Per Trigger</label>
          <input type="number" value={(config.maxOffsetsPerTrigger as number) || ''}
            onChange={(e) => updateConfig('maxOffsetsPerTrigger', parseInt(e.target.value))}
            placeholder="Unlimited"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="failOnDataLoss" checked={(config.failOnDataLoss as boolean) ?? true}
            onChange={(e) => updateConfig('failOnDataLoss', e.target.checked)} className="rounded" />
          <label htmlFor="failOnDataLoss" className="text-xs text-gray-300">Fail on Data Loss</label>
        </div>
      </CollapsibleSection>
    </>
  );

  const renderS3Options = () => (
    <>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">File Format</label>
          <select value={(config.fileFormat as string) || 'parquet'}
            onChange={(e) => updateConfig('fileFormat', e.target.value)}
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white">
            <option value="parquet">Parquet</option>
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
            <option value="orc">ORC</option>
            <option value="avro">Avro</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="recursiveFileLookup" checked={(config.recursiveFileLookup as boolean) ?? false}
            onChange={(e) => updateConfig('recursiveFileLookup', e.target.checked)} className="rounded" />
          <label htmlFor="recursiveFileLookup" className="text-xs text-gray-300">Recursive File Lookup</label>
        </div>
      </div>

      <CollapsibleSection title="S3 Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Path Glob Filter</label>
          <input type="text" value={(config.pathGlobFilter as string) || ''}
            onChange={(e) => updateConfig('pathGlobFilter', e.target.value)} placeholder="*.parquet"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">AWS Region</label>
          <input type="text" value={(config.region as string) || ''}
            onChange={(e) => updateConfig('region', e.target.value)} placeholder="us-east-1"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>
      </CollapsibleSection>
    </>
  );

  const renderOrcOptions = () => (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input type="checkbox" id="mergeSchema" checked={(config.mergeSchema as boolean) ?? false}
            onChange={(e) => updateConfig('mergeSchema', e.target.checked)} className="rounded" />
          <label htmlFor="mergeSchema" className="text-xs text-gray-300">Merge Schema</label>
        </div>
        <p className="text-[10px] text-gray-500 -mt-2 ml-6">Merge schemas from all part files</p>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="useSchema" checked={(config.useSchema as boolean) ?? false}
            onChange={(e) => updateConfig('useSchema', e.target.checked)} className="rounded" />
          <label htmlFor="useSchema" className="text-xs text-gray-300">Use Defined Schema</label>
        </div>
        <p className="text-[10px] text-gray-500 -mt-2 ml-6">Apply schema from Schema Definition section below</p>
      </div>

      <CollapsibleSection title="Schema Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">DDL Schema (Optional)</label>
          <textarea value={(config.ddlSchema as string) || ''}
            onChange={(e) => updateConfig('ddlSchema', e.target.value)}
            placeholder="id LONG, name STRING, amount DOUBLE"
            rows={3}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white font-mono" />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Advanced Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Path Glob Filter</label>
          <input type="text" value={(config.pathGlobFilter as string) || ''}
            onChange={(e) => updateConfig('pathGlobFilter', e.target.value)} placeholder="*.orc"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="recursiveFileLookup" checked={(config.recursiveFileLookup as boolean) ?? false}
            onChange={(e) => updateConfig('recursiveFileLookup', e.target.checked)} className="rounded" />
          <label htmlFor="recursiveFileLookup" className="text-xs text-gray-300">Recursive File Lookup</label>
        </div>
      </CollapsibleSection>
    </>
  );

  const renderAvroOptions = () => (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input type="checkbox" id="mergeSchema" checked={(config.mergeSchema as boolean) ?? false}
            onChange={(e) => updateConfig('mergeSchema', e.target.checked)} className="rounded" />
          <label htmlFor="mergeSchema" className="text-xs text-gray-300">Merge Schema</label>
        </div>
        <p className="text-[10px] text-gray-500 -mt-2 ml-6">Merge schemas from all Avro files</p>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="ignoreExtension" checked={(config.ignoreExtension as boolean) ?? false}
            onChange={(e) => updateConfig('ignoreExtension', e.target.checked)} className="rounded" />
          <label htmlFor="ignoreExtension" className="text-xs text-gray-300">Ignore File Extension</label>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="useSchema" checked={(config.useSchema as boolean) ?? false}
            onChange={(e) => updateConfig('useSchema', e.target.checked)} className="rounded" />
          <label htmlFor="useSchema" className="text-xs text-gray-300">Use Defined Schema</label>
        </div>
        <p className="text-[10px] text-gray-500 -mt-2 ml-6">Apply schema from Schema Definition section below</p>
      </div>

      <CollapsibleSection title="Schema Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Avro Schema JSON (Optional)</label>
          <textarea value={(config.avroSchema as string) || ''}
            onChange={(e) => updateConfig('avroSchema', e.target.value)}
            placeholder='{"type": "record", "name": "...", "fields": [...]}'
            rows={4}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white font-mono" />
          <p className="text-[10px] text-gray-500 mt-1">Provide explicit Avro schema JSON</p>
        </div>

        <div className="mt-3">
          <label className="block text-xs text-gray-400 mb-1">DDL Schema (Alternative)</label>
          <textarea value={(config.ddlSchema as string) || ''}
            onChange={(e) => updateConfig('ddlSchema', e.target.value)}
            placeholder="id LONG, name STRING, amount DOUBLE"
            rows={3}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white font-mono" />
          <p className="text-[10px] text-gray-500 mt-1">DDL schema for reading with explicit types</p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Advanced Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Path Glob Filter</label>
          <input type="text" value={(config.pathGlobFilter as string) || ''}
            onChange={(e) => updateConfig('pathGlobFilter', e.target.value)} placeholder="*.avro"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="recursiveFileLookup" checked={(config.recursiveFileLookup as boolean) ?? false}
            onChange={(e) => updateConfig('recursiveFileLookup', e.target.checked)} className="rounded" />
          <label htmlFor="recursiveFileLookup" className="text-xs text-gray-300">Recursive File Lookup</label>
        </div>
      </CollapsibleSection>
    </>
  );

  const renderTextOptions = () => (
    <>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Line Separator</label>
          <select value={(config.lineSep as string) || '\\n'}
            onChange={(e) => updateConfig('lineSep', e.target.value)}
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white">
            <option value="\n">Unix (LF)</option>
            <option value="\r\n">Windows (CRLF)</option>
            <option value="\r">Classic Mac (CR)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="wholetext" checked={(config.wholetext as boolean) ?? false}
            onChange={(e) => updateConfig('wholetext', e.target.checked)} className="rounded" />
          <label htmlFor="wholetext" className="text-xs text-gray-300">Read Whole File as Single Row</label>
        </div>
      </div>

      <CollapsibleSection title="Schema Options">
        <p className="text-[10px] text-gray-500 mb-2">Text format produces a DataFrame with a single column named "value"</p>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Column Name (Default: value)</label>
          <input type="text" value={(config.columnName as string) || 'value'}
            onChange={(e) => updateConfig('columnName', e.target.value)} placeholder="value"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Advanced Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Path Glob Filter</label>
          <input type="text" value={(config.pathGlobFilter as string) || ''}
            onChange={(e) => updateConfig('pathGlobFilter', e.target.value)} placeholder="*.txt"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="recursiveFileLookup" checked={(config.recursiveFileLookup as boolean) ?? false}
            onChange={(e) => updateConfig('recursiveFileLookup', e.target.checked)} className="rounded" />
          <label htmlFor="recursiveFileLookup" className="text-xs text-gray-300">Recursive File Lookup</label>
        </div>
      </CollapsibleSection>
    </>
  );

  const renderExcelOptions = () => (
    <>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Sheet Name or Index</label>
          <input type="text" value={(config.sheetName as string) || ''}
            onChange={(e) => updateConfig('sheetName', e.target.value)} placeholder="Sheet1 or 0"
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="header" checked={(config.header as boolean) ?? true}
            onChange={(e) => updateConfig('header', e.target.checked)} className="rounded" />
          <label htmlFor="header" className="text-xs text-gray-300">Has Header Row</label>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="inferSchema" checked={(config.inferSchema as boolean) ?? true}
            onChange={(e) => updateConfig('inferSchema', e.target.checked)} className="rounded" />
          <label htmlFor="inferSchema" className="text-xs text-gray-300">Infer Schema</label>
        </div>
      </div>

      <CollapsibleSection title="Advanced Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Data Address (Range)</label>
          <input type="text" value={(config.dataAddress as string) || ''}
            onChange={(e) => updateConfig('dataAddress', e.target.value)} placeholder="A1:Z100 or 'Sheet1'!A1"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="treatEmptyValuesAsNulls" checked={(config.treatEmptyValuesAsNulls as boolean) ?? true}
            onChange={(e) => updateConfig('treatEmptyValuesAsNulls', e.target.checked)} className="rounded" />
          <label htmlFor="treatEmptyValuesAsNulls" className="text-xs text-gray-300">Treat Empty Values as Nulls</label>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Max Rows Per Sheet</label>
          <input type="number" value={(config.maxRowsPerSheet as number) || ''}
            onChange={(e) => updateConfig('maxRowsPerSheet', parseInt(e.target.value))} placeholder="Unlimited"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>
      </CollapsibleSection>

      <p className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
        Requires spark-excel package
      </p>
    </>
  );

  const renderXmlOptions = () => (
    <>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Row Tag</label>
          <input type="text" value={(config.rowTag as string) || ''}
            onChange={(e) => updateConfig('rowTag', e.target.value)} placeholder="record"
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
          <p className="text-[10px] text-gray-500 mt-1">XML element to treat as a row</p>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Root Tag (Optional)</label>
          <input type="text" value={(config.rootTag as string) || ''}
            onChange={(e) => updateConfig('rootTag', e.target.value)} placeholder="root"
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="inferSchema" checked={(config.inferSchema as boolean) ?? true}
            onChange={(e) => updateConfig('inferSchema', e.target.checked)} className="rounded" />
          <label htmlFor="inferSchema" className="text-xs text-gray-300">Infer Schema</label>
        </div>
      </div>

      <CollapsibleSection title="Schema Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">DDL Schema (Optional)</label>
          <textarea value={(config.ddlSchema as string) || ''}
            onChange={(e) => updateConfig('ddlSchema', e.target.value)}
            placeholder="id INT, name STRING, nested STRUCT<field1: STRING, field2: INT>"
            rows={3}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white font-mono" />
          <p className="text-[10px] text-gray-500 mt-1">Provide explicit schema instead of inferring</p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Advanced Options">
        <div className="flex items-center gap-2">
          <input type="checkbox" id="excludeAttribute" checked={(config.excludeAttribute as boolean) ?? false}
            onChange={(e) => updateConfig('excludeAttribute', e.target.checked)} className="rounded" />
          <label htmlFor="excludeAttribute" className="text-xs text-gray-300">Exclude Attributes</label>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Attribute Prefix</label>
          <input type="text" value={(config.attributePrefix as string) || '_'}
            onChange={(e) => updateConfig('attributePrefix', e.target.value)} placeholder="_"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Value Tag</label>
          <input type="text" value={(config.valueTag as string) || '_VALUE'}
            onChange={(e) => updateConfig('valueTag', e.target.value)} placeholder="_VALUE"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Null Value</label>
          <input type="text" value={(config.nullValue as string) || ''}
            onChange={(e) => updateConfig('nullValue', e.target.value)} placeholder="null"
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
        </div>
      </CollapsibleSection>

      <p className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
        Requires spark-xml package
      </p>
    </>
  );

  const renderIcebergOptions = () => (
    <>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Snapshot Mode</label>
          <select value={(config.snapshotMode as string) || 'latest'}
            onChange={(e) => updateConfig('snapshotMode', e.target.value)}
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white">
            <option value="latest">Latest Snapshot</option>
            <option value="snapshotId">Snapshot ID</option>
            <option value="timestamp">As Of Timestamp</option>
          </select>
        </div>

        {config.snapshotMode === 'snapshotId' && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Snapshot ID</label>
            <input type="text" value={(config.snapshotId as string) || ''}
              onChange={(e) => updateConfig('snapshotId', e.target.value)} placeholder="1234567890"
              className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
          </div>
        )}

        {config.snapshotMode === 'timestamp' && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">As Of Timestamp</label>
            <input type="text" value={(config.asOfTimestamp as string) || ''}
              onChange={(e) => updateConfig('asOfTimestamp', e.target.value)}
              placeholder="2024-01-01T00:00:00.000Z"
              className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
          </div>
        )}
      </div>

      <p className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
        Requires iceberg-spark-runtime package
      </p>
    </>
  );

  const renderHudiOptions = () => (
    <>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Query Type</label>
          <select value={(config.queryType as string) || 'snapshot'}
            onChange={(e) => updateConfig('queryType', e.target.value)}
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white">
            <option value="snapshot">Snapshot Query</option>
            <option value="incremental">Incremental Query</option>
            <option value="read_optimized">Read Optimized</option>
          </select>
        </div>

        {config.queryType === 'incremental' && (
          <>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Begin Instant Time</label>
              <input type="text" value={(config.beginInstantTime as string) || ''}
                onChange={(e) => updateConfig('beginInstantTime', e.target.value)} placeholder="20240101000000"
                className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">End Instant Time (Optional)</label>
              <input type="text" value={(config.endInstantTime as string) || ''}
                onChange={(e) => updateConfig('endInstantTime', e.target.value)} placeholder="20240102000000"
                className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
            </div>
          </>
        )}
      </div>

      <p className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
        Requires hudi-spark-bundle package
      </p>
    </>
  );

  const renderSnowflakeOptions = () => (
    <>
      <div className="space-y-3">
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
          <label className="block text-xs text-gray-400 mb-1">Table / Query</label>
          <input type="text" value={(config.dbtable as string) || ''}
            onChange={(e) => updateConfig('dbtable', e.target.value)}
            placeholder="MY_TABLE or (SELECT * FROM ...)"
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
        </div>
      </div>

      <CollapsibleSection title="Authentication">
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Auth Type</label>
            <select value={(config.sfAuthType as string) || 'password'}
              onChange={(e) => updateConfig('sfAuthType', e.target.value)}
              className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white">
              <option value="password">Username / Password</option>
              <option value="keypair">Key Pair</option>
              <option value="oauth">OAuth</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Username</label>
            <input type="text" value={(config.sfUser as string) || ''}
              onChange={(e) => updateConfig('sfUser', e.target.value)}
              placeholder="username"
              className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
          </div>

          {config.sfAuthType !== 'keypair' && config.sfAuthType !== 'oauth' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Password</label>
              <input type="password" value={(config.sfPassword as string) || ''}
                onChange={(e) => updateConfig('sfPassword', e.target.value)}
                placeholder="********"
                className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
            </div>
          )}

          {config.sfAuthType === 'keypair' && (
            <>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Private Key Path</label>
                <input type="text" value={(config.sfPrivateKeyPath as string) || ''}
                  onChange={(e) => updateConfig('sfPrivateKeyPath', e.target.value)}
                  placeholder="/path/to/private_key.p8"
                  className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Private Key Passphrase</label>
                <input type="password" value={(config.sfPrivateKeyPassphrase as string) || ''}
                  onChange={(e) => updateConfig('sfPrivateKeyPassphrase', e.target.value)}
                  placeholder="optional"
                  className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
              </div>
            </>
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Advanced Options">
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Role</label>
            <input type="text" value={(config.sfRole as string) || ''}
              onChange={(e) => updateConfig('sfRole', e.target.value)}
              placeholder="ACCOUNTADMIN (optional)"
              className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Query Timeout (seconds)</label>
            <input type="number" value={(config.queryTimeout as number) || ''}
              onChange={(e) => updateConfig('queryTimeout', parseInt(e.target.value))}
              placeholder="0 (no timeout)"
              className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="keepColumnCase" checked={(config.keepColumnCase as boolean) ?? false}
              onChange={(e) => updateConfig('keepColumnCase', e.target.checked)} className="rounded" />
            <label htmlFor="keepColumnCase" className="text-xs text-gray-300">Keep Column Case</label>
          </div>
        </div>
      </CollapsibleSection>

      <p className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
        Requires snowflake-spark-connector package
      </p>
    </>
  );

  const renderBigQueryOptions = () => (
    <>
      <div className="space-y-3">
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
          <label className="block text-xs text-gray-400 mb-1">Read Mode</label>
          <select value={(config.readDataFormat as string) || 'arrow'}
            onChange={(e) => updateConfig('readDataFormat', e.target.value)}
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white">
            <option value="arrow">Arrow (Recommended)</option>
            <option value="avro">Avro</option>
          </select>
        </div>
      </div>

      <CollapsibleSection title="Query Options">
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Filter (WHERE clause)</label>
            <input type="text" value={(config.filter as string) || ''}
              onChange={(e) => updateConfig('filter', e.target.value)}
              placeholder="date >= '2024-01-01'"
              className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Selected Fields</label>
            <input type="text" value={(config.selectedFields as string) || ''}
              onChange={(e) => updateConfig('selectedFields', e.target.value)}
              placeholder="col1,col2,col3 (empty = all)"
              className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Materialized View</label>
            <input type="text" value={(config.viewsEnabled as string) || ''}
              onChange={(e) => updateConfig('viewsEnabled', e.target.value)}
              placeholder="my_materialized_view"
              className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Authentication">
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Auth Type</label>
            <select value={(config.authType as string) || 'application_default'}
              onChange={(e) => updateConfig('authType', e.target.value)}
              className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white">
              <option value="application_default">Application Default</option>
              <option value="service_account">Service Account JSON</option>
              <option value="user_credentials">User Credentials</option>
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
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Advanced Options">
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Temporary GCS Bucket</label>
            <input type="text" value={(config.temporaryGcsBucket as string) || ''}
              onChange={(e) => updateConfig('temporaryGcsBucket', e.target.value)}
              placeholder="my-temp-bucket"
              className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
            <p className="text-[10px] text-gray-500 mt-1">Required for writing to BigQuery</p>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Max Parallelism</label>
            <input type="number" value={(config.maxParallelism as number) || ''}
              onChange={(e) => updateConfig('maxParallelism', parseInt(e.target.value))}
              placeholder="1 (default)"
              className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="optimizedEmptyProjection" checked={(config.optimizedEmptyProjection as boolean) ?? true}
              onChange={(e) => updateConfig('optimizedEmptyProjection', e.target.checked)} className="rounded" />
            <label htmlFor="optimizedEmptyProjection" className="text-xs text-gray-300">Optimized Empty Projection</label>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="viewsEnabled" checked={(config.viewsEnabledBool as boolean) ?? false}
              onChange={(e) => updateConfig('viewsEnabledBool', e.target.checked)} className="rounded" />
            <label htmlFor="viewsEnabled" className="text-xs text-gray-300">Enable Views Support</label>
          </div>
        </div>
      </CollapsibleSection>

      <p className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
        Requires spark-bigquery-with-dependencies package
      </p>
    </>
  );

  const renderRedshiftOptions = () => (
    <>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">JDBC URL</label>
          <input type="text" value={(config.url as string) || ''}
            onChange={(e) => updateConfig('url', e.target.value)}
            placeholder="jdbc:redshift://cluster.region.redshift.amazonaws.com:5439/database"
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Table / Query</label>
          <input type="text" value={(config.dbtable as string) || ''}
            onChange={(e) => updateConfig('dbtable', e.target.value)}
            placeholder="schema.table_name or (SELECT ...)"
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Temp S3 Directory</label>
          <input type="text" value={(config.tempdir as string) || ''}
            onChange={(e) => updateConfig('tempdir', e.target.value)}
            placeholder="s3://my-bucket/temp/"
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
          <p className="text-[10px] text-gray-500 mt-1">Required for COPY/UNLOAD operations</p>
        </div>
      </div>

      <CollapsibleSection title="Authentication">
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Auth Type</label>
            <select value={(config.authType as string) || 'password'}
              onChange={(e) => updateConfig('authType', e.target.value)}
              className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white">
              <option value="password">Username / Password</option>
              <option value="iam">IAM Role</option>
            </select>
          </div>

          {config.authType !== 'iam' && (
            <>
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
            </>
          )}

          {config.authType === 'iam' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">IAM Role ARN</label>
              <input type="text" value={(config.iamRole as string) || ''}
                onChange={(e) => updateConfig('iamRole', e.target.value)}
                placeholder="arn:aws:iam::123456789:role/my-role"
                className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
            </div>
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="AWS Credentials (for S3)">
        <div className="space-y-3">
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

          <div>
            <label className="block text-xs text-gray-400 mb-1">AWS Region</label>
            <input type="text" value={(config.awsRegion as string) || ''}
              onChange={(e) => updateConfig('awsRegion', e.target.value)}
              placeholder="us-east-1"
              className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Advanced Options">
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Forward Spark S3 Credentials</label>
            <select value={(config.forwardSparkS3Credentials as string) || 'true'}
              onChange={(e) => updateConfig('forwardSparkS3Credentials', e.target.value)}
              className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white">
              <option value="true">Yes (Recommended)</option>
              <option value="false">No</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Extra JDBC Options (JSON)</label>
            <textarea value={(config.extraJdbcOptions as string) || ''}
              onChange={(e) => updateConfig('extraJdbcOptions', e.target.value)}
              placeholder='{"ssl": "true", "sslfactory": "..."}'
              rows={3}
              className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white font-mono" />
          </div>
        </div>
      </CollapsibleSection>

      <p className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
        Requires spark-redshift package
      </p>
    </>
  );

  const renderCustomOptions = () => (
    <>
      <div className="space-y-3">
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
      </div>

      <CollapsibleSection title="Schema (Optional)">
        <div>
          <label className="block text-xs text-gray-400 mb-1">DDL Schema</label>
          <textarea value={(config.ddlSchema as string) || ''}
            onChange={(e) => updateConfig('ddlSchema', e.target.value)}
            placeholder="id INT, name STRING, created_at TIMESTAMP"
            rows={3}
            className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white font-mono" />
        </div>
      </CollapsibleSection>
    </>
  );

  // Pulsar streaming source
  const renderPulsarOptions = () => (
    <>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Service URL</label>
          <input type="text" value={(config.serviceUrl as string) || ''}
            onChange={(e) => updateConfig('serviceUrl', e.target.value)}
            placeholder="pulsar://localhost:6650"
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Admin URL</label>
          <input type="text" value={(config.adminUrl as string) || ''}
            onChange={(e) => updateConfig('adminUrl', e.target.value)}
            placeholder="http://localhost:8080"
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Topic(s)</label>
          <input type="text" value={(config.topics as string) || ''}
            onChange={(e) => updateConfig('topics', e.target.value)}
            placeholder="persistent://tenant/namespace/topic"
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
          <p className="text-[10px] text-gray-500 mt-1">Comma-separated for multiple topics</p>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Subscription Name</label>
          <input type="text" value={(config.subscriptionName as string) || ''}
            onChange={(e) => updateConfig('subscriptionName', e.target.value)}
            placeholder="my-subscription"
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Starting Position</label>
          <select value={(config.startingPosition as string) || 'latest'}
            onChange={(e) => updateConfig('startingPosition', e.target.value)}
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white">
            <option value="earliest">Earliest</option>
            <option value="latest">Latest</option>
          </select>
        </div>
      </div>

      <CollapsibleSection title="Advanced Options">
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Subscription Type</label>
            <select value={(config.subscriptionType as string) || 'Exclusive'}
              onChange={(e) => updateConfig('subscriptionType', e.target.value)}
              className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white">
              <option value="Exclusive">Exclusive</option>
              <option value="Shared">Shared</option>
              <option value="Failover">Failover</option>
              <option value="Key_Shared">Key Shared</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="allowDifferentTopicSchemas"
              checked={(config.allowDifferentTopicSchemas as boolean) ?? false}
              onChange={(e) => updateConfig('allowDifferentTopicSchemas', e.target.checked)} className="rounded" />
            <label htmlFor="allowDifferentTopicSchemas" className="text-xs text-gray-300">Allow Different Topic Schemas</label>
          </div>
        </div>
      </CollapsibleSection>
    </>
  );

  // Redis source
  const renderRedisOptions = () => (
    <>
      <div className="space-y-3">
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
          <label className="block text-xs text-gray-400 mb-1">Key Pattern</label>
          <input type="text" value={(config.keyPattern as string) || ''}
            onChange={(e) => updateConfig('keyPattern', e.target.value)}
            placeholder="user:*"
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
          <p className="text-[10px] text-gray-500 mt-1">Pattern to match keys (supports wildcards)</p>
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
            <option value="zset">Sorted Set</option>
            <option value="stream">Stream</option>
          </select>
        </div>
      </div>

      <CollapsibleSection title="Authentication">
        <div className="space-y-3">
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
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Advanced Options">
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Scan Count (per batch)</label>
            <input type="number" value={(config.scanCount as number) || 1000}
              onChange={(e) => updateConfig('scanCount', parseInt(e.target.value))}
              className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Max Keys</label>
            <input type="number" value={(config.maxKeys as number) || ''}
              onChange={(e) => updateConfig('maxKeys', parseInt(e.target.value))}
              placeholder="Unlimited"
              className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
          </div>
        </div>
      </CollapsibleSection>
    </>
  );

  // Neo4j graph database source
  const renderNeo4jOptions = () => (
    <>
      <div className="space-y-3">
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
          <label className="block text-xs text-gray-400 mb-1">Query Type</label>
          <select value={(config.queryType as string) || 'cypher'}
            onChange={(e) => updateConfig('queryType', e.target.value)}
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white">
            <option value="cypher">Cypher Query</option>
            <option value="labels">Node Labels</option>
            <option value="relationship">Relationship Type</option>
          </select>
        </div>

        {(config.queryType === 'cypher' || !config.queryType) && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Cypher Query</label>
            <textarea value={(config.query as string) || ''}
              onChange={(e) => updateConfig('query', e.target.value)}
              placeholder="MATCH (n:Person) RETURN n.name, n.age"
              rows={4}
              className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white font-mono" />
          </div>
        )}

        {config.queryType === 'labels' && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Node Labels</label>
            <input type="text" value={(config.labels as string) || ''}
              onChange={(e) => updateConfig('labels', e.target.value)}
              placeholder="Person, Company"
              className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
            <p className="text-[10px] text-gray-500 mt-1">Comma-separated labels</p>
          </div>
        )}

        {config.queryType === 'relationship' && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Relationship Type</label>
            <input type="text" value={(config.relationshipType as string) || ''}
              onChange={(e) => updateConfig('relationshipType', e.target.value)}
              placeholder="KNOWS"
              className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white" />
          </div>
        )}
      </div>

      <CollapsibleSection title="Authentication">
        <div className="space-y-3">
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
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Advanced Options">
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Partition Size</label>
            <input type="number" value={(config.partitionSize as number) || 10000}
              onChange={(e) => updateConfig('partitionSize', parseInt(e.target.value))}
              className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white" />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="apocEnabled" checked={(config.apocEnabled as boolean) ?? false}
              onChange={(e) => updateConfig('apocEnabled', e.target.checked)} className="rounded" />
            <label htmlFor="apocEnabled" className="text-xs text-gray-300">Use APOC Procedures</label>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="encrypted" checked={(config.encrypted as boolean) ?? true}
              onChange={(e) => updateConfig('encrypted', e.target.checked)} className="rounded" />
            <label htmlFor="encrypted" className="text-xs text-gray-300">Use Encryption</label>
          </div>
        </div>
      </CollapsibleSection>
    </>
  );

  const renderSourceOptions = () => {
    switch (data.sourceType) {
      case 'csv': return renderCsvOptions();
      case 'json': return renderJsonOptions();
      case 'parquet': return renderParquetOptions();
      case 'jdbc': return renderJdbcOptions();
      case 'delta': return renderDeltaOptions();
      case 'kafka': return renderKafkaOptions();
      case 's3': return renderS3Options();
      case 'orc': return renderOrcOptions();
      case 'avro': return renderAvroOptions();
      case 'text': return renderTextOptions();
      case 'excel': return renderExcelOptions();
      case 'xml': return renderXmlOptions();
      case 'iceberg': return renderIcebergOptions();
      case 'hudi': return renderHudiOptions();
      case 'custom': return renderCustomOptions();
      case 'snowflake': return renderSnowflakeOptions();
      case 'bigquery': return renderBigQueryOptions();
      case 'redshift': return renderRedshiftOptions();
      // Placeholder for other new sources
      case 'mongodb':
      case 'cassandra':
      case 'elasticsearch':
      case 'azure':
      case 'gcs':
        return (
          <div className="text-xs text-yellow-500 bg-yellow-500/10 px-3 py-2 rounded">
            Configuration coming soon. Use Custom Source for now.
          </div>
        );
      // Streaming sources
      case 'kinesis':
      case 'eventHubs':
      case 'pubsub':
        return null; // Handled by dedicated streaming source components
      case 'pulsar':
        return renderPulsarOptions();
      // NoSQL/Cache sources
      case 'redis':
        return renderRedisOptions();
      case 'neo4j':
        return renderNeo4jOptions();
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Source Type</label>
        <div className="px-3 py-2 bg-panel rounded text-sm text-gray-300 capitalize">
          {data.sourceType}
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">
          {data.sourceType === 'jdbc' ? 'Connection String' :
           data.sourceType === 'kafka' ? 'Topic Configuration' : 'Path'}
        </label>
        <input
          type="text"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder={
            data.sourceType === 'jdbc' ? 'jdbc:postgresql://host:5432/db' :
            data.sourceType === 'kafka' ? 'Configure below' :
            data.sourceType === 's3' ? 's3://bucket/path/' :
            data.sourceType === 'delta' ? 's3://bucket/delta-table/' :
            'path/to/data'
          }
          className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white focus:border-accent focus:outline-none"
        />
      </div>

      {renderSourceOptions()}

      {/* Schema Editor */}
      <CollapsibleSection title={`Schema Definition (${schema.length} columns)`} defaultOpen={schema.length > 0}>
        <div className="space-y-2">
          {/* Column header */}
          {schema.length > 0 && (
            <div className="flex items-center gap-1 px-1 text-[10px] text-gray-500">
              <span className="w-6"></span>
              <span className="flex-1">Name</span>
              <span className="w-28">Type</span>
              <span className="w-10 text-center">Null</span>
              <span className="w-6"></span>
            </div>
          )}
          {/* Column list */}
          <div className="max-h-60 overflow-y-auto space-y-1">
            {schema.map((col, idx) => (
              <div key={idx} className="bg-canvas rounded border border-gray-600 p-1.5">
                {/* Main row - Name and Type side by side */}
                <div className="flex items-center gap-1">
                  <div className="flex flex-col">
                    <button
                      onClick={() => moveColumn(idx, idx - 1)}
                      disabled={idx === 0}
                      className="p-0.5 text-gray-500 hover:text-gray-300 disabled:opacity-30"
                      title="Move up"
                    >
                      <ChevronUp className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={() => moveColumn(idx, idx + 1)}
                      disabled={idx === schema.length - 1}
                      className="p-0.5 text-gray-500 hover:text-gray-300 disabled:opacity-30"
                      title="Move down"
                    >
                      <ChevronDown className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  {/* Column name */}
                  <input
                    type="text"
                    value={col.name}
                    onChange={(e) => updateColumn(idx, 'name', e.target.value)}
                    placeholder="column_name"
                    className="flex-1 min-w-0 px-2 py-1 bg-panel border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none"
                  />
                  {/* Data type dropdown */}
                  <select
                    value={getDropdownValue(col.dataType)}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'array<...>') {
                        updateColumn(idx, 'dataType', 'array<string>');
                      } else if (val === 'map<...>') {
                        updateColumn(idx, 'dataType', 'map<string,string>');
                      } else if (val === 'struct<...>') {
                        updateColumn(idx, 'dataType', 'struct<field1:string,field2:integer>');
                      } else if (val === 'custom') {
                        updateColumn(idx, 'dataType', 'custom_type');
                      } else {
                        updateColumn(idx, 'dataType', val);
                      }
                    }}
                    className="w-28 px-1.5 py-1 bg-panel border border-gray-600 rounded text-xs text-white"
                  >
                    {Object.entries(SPARK_DATA_TYPES).map(([group, types]) => (
                      <optgroup key={group} label={group}>
                        {types.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {/* Nullable checkbox */}
                  <label className="w-10 flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={col.nullable}
                      onChange={(e) => updateColumn(idx, 'nullable', e.target.checked)}
                      className="rounded w-3 h-3"
                      title="Nullable"
                    />
                  </label>
                  {/* Delete button */}
                  <button
                    onClick={() => removeColumn(idx)}
                    className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded"
                    title="Remove column"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                {/* Custom type input - shows when complex type selected */}
                {isCustomType(col.dataType) && (
                  <div className="mt-1.5 ml-5">
                    <input
                      type="text"
                      value={col.dataType}
                      onChange={(e) => updateColumn(idx, 'dataType', e.target.value)}
                      placeholder="e.g., array<string>, map<string,integer>, struct<name:string,age:integer>, decimal(10,2)"
                      className="w-full px-2 py-1 bg-panel border border-gray-600 rounded text-xs text-white font-mono focus:border-accent focus:outline-none"
                    />
                    <p className="text-[9px] text-gray-500 mt-0.5">
                      Examples: array&lt;string&gt;, map&lt;string,int&gt;, struct&lt;name:string,age:int&gt;, decimal(10,2)
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add column button */}
          <button
            onClick={addColumn}
            className="w-full flex items-center justify-center gap-1 px-3 py-1.5 border border-dashed border-gray-600 text-gray-400 hover:text-gray-200 hover:border-gray-400 rounded text-xs transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Column
          </button>

          {schema.length === 0 && (
            <p className="text-[10px] text-gray-500 text-center py-2">
              Define the schema for this source to use columns in transformations
            </p>
          )}

          {/* Save to Library button - always show when schema has columns */}
          {schema.length > 0 && (
            <button
              onClick={handleSaveToLibrary}
              disabled={isSavingToLibrary || isSchemaLoading}
              className="w-full flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/50 rounded text-xs transition-colors disabled:opacity-50"
            >
              <Library className="w-3 h-3" />
              {isSavingToLibrary ? 'Saving...' : isApiMode ? 'Save to Library' : 'Save to Local Library'}
            </button>
          )}
        </div>
      </CollapsibleSection>

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
