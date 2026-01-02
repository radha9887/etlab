import { useState } from 'react';
import { Save, Plus, Trash2, Code, AlertTriangle, Zap } from 'lucide-react';
import type { TransformNodeData } from '../../../types';
import type { WithAvailableColumns } from '../shared';

interface UdfConfigProps extends Partial<WithAvailableColumns> {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

// Spark data types for UDF return types
const sparkDataTypes = [
  { value: 'StringType()', label: 'String' },
  { value: 'IntegerType()', label: 'Integer' },
  { value: 'LongType()', label: 'Long' },
  { value: 'FloatType()', label: 'Float' },
  { value: 'DoubleType()', label: 'Double' },
  { value: 'BooleanType()', label: 'Boolean' },
  { value: 'TimestampType()', label: 'Timestamp' },
  { value: 'DateType()', label: 'Date' },
  { value: 'BinaryType()', label: 'Binary' },
  { value: 'ArrayType(StringType())', label: 'Array[String]' },
  { value: 'ArrayType(IntegerType())', label: 'Array[Integer]' },
  { value: 'ArrayType(DoubleType())', label: 'Array[Double]' },
  { value: 'MapType(StringType(), StringType())', label: 'Map[String, String]' },
  { value: 'MapType(StringType(), IntegerType())', label: 'Map[String, Integer]' },
];

// ============================================
// Python UDF Configuration
// ============================================
export const PythonUdfConfig = ({ data, onUpdate, availableColumns }: UdfConfigProps) => {
  const [config, setConfig] = useState({
    functionName: (data.config?.functionName as string) || 'my_udf',
    inputColumns: (data.config?.inputColumns as string[]) || [],
    outputColumn: (data.config?.outputColumn as string) || 'udf_result',
    returnType: (data.config?.returnType as string) || 'StringType()',
    functionCode: (data.config?.functionCode as string) || `def my_udf(value):
    """
    Python UDF - processes one row at a time.

    Args:
        value: Input value from the column

    Returns:
        Transformed value
    """
    if value is None:
        return None

    # Your transformation logic here
    result = str(value).upper()

    return result`,
    description: (data.config?.description as string) || '',
  });

  const updateConfig = (key: string, value: unknown) => {
    setConfig({ ...config, [key]: value });
  };

  const handleSave = () => {
    onUpdate(config);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-purple-400 bg-purple-500/10 px-3 py-2 rounded">
        <Code className="w-4 h-4" />
        <span>Python UDF - Row-by-row transformation</span>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Function Name *</label>
        <input
          type="text"
          value={config.functionName}
          onChange={(e) => updateConfig('functionName', e.target.value)}
          placeholder="my_udf"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white font-mono"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Input Columns</label>
        <select
          multiple
          value={config.inputColumns}
          onChange={(e) => updateConfig('inputColumns', Array.from(e.target.selectedOptions, opt => opt.value))}
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white min-h-[80px]"
        >
          {(availableColumns || []).map((col) => (
            <option key={col.name} value={col.name}>{col.name} ({col.dataType})</option>
          ))}
        </select>
        <p className="text-[10px] text-gray-500 mt-1">Ctrl+click to select multiple columns</p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Output Column Name</label>
        <input
          type="text"
          value={config.outputColumn}
          onChange={(e) => updateConfig('outputColumn', e.target.value)}
          placeholder="udf_result"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Return Type</label>
        <select
          value={config.returnType}
          onChange={(e) => updateConfig('returnType', e.target.value)}
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        >
          {sparkDataTypes.map((dt) => (
            <option key={dt.value} value={dt.value}>{dt.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Function Code *</label>
        <textarea
          value={config.functionCode}
          onChange={(e) => updateConfig('functionCode', e.target.value)}
          rows={15}
          className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white font-mono"
          spellCheck={false}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Description (Optional)</label>
        <input
          type="text"
          value={config.description}
          onChange={(e) => updateConfig('description', e.target.value)}
          placeholder="Brief description of what this UDF does"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        />
      </div>

      <div className="text-xs text-yellow-500 bg-yellow-500/10 px-3 py-2 rounded">
        <AlertTriangle className="w-3 h-3 inline mr-1" />
        Python UDFs are slower than built-in functions. Consider Pandas UDFs for better performance.
      </div>

      <button
        onClick={handleSave}
        disabled={!config.functionName || !config.functionCode}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
      >
        <Save className="w-4 h-4" />
        Save Configuration
      </button>
    </div>
  );
};

// ============================================
// Pandas UDF (Scalar) Configuration
// ============================================
export const PandasUdfConfig = ({ data, onUpdate, availableColumns }: UdfConfigProps) => {
  const [config, setConfig] = useState({
    functionName: (data.config?.functionName as string) || 'pandas_udf',
    inputColumns: (data.config?.inputColumns as string[]) || [],
    outputColumn: (data.config?.outputColumn as string) || 'pandas_result',
    returnType: (data.config?.returnType as string) || 'StringType()',
    functionCode: (data.config?.functionCode as string) || `@pandas_udf(StringType())
def pandas_udf(series: pd.Series) -> pd.Series:
    """
    Pandas UDF (Scalar) - Vectorized transformation.
    Processes entire column as a pandas Series for better performance.

    Args:
        series: pandas Series containing column values

    Returns:
        pandas Series with transformed values
    """
    # Vectorized operations are much faster than row-by-row
    return series.str.upper()`,
    description: (data.config?.description as string) || '',
  });

  const updateConfig = (key: string, value: unknown) => {
    setConfig({ ...config, [key]: value });
  };

  const handleSave = () => {
    onUpdate(config);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-2 rounded">
        <Zap className="w-4 h-4" />
        <span>Pandas UDF - Vectorized (high performance)</span>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Function Name *</label>
        <input
          type="text"
          value={config.functionName}
          onChange={(e) => updateConfig('functionName', e.target.value)}
          placeholder="pandas_udf"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white font-mono"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Input Columns</label>
        <select
          multiple
          value={config.inputColumns}
          onChange={(e) => updateConfig('inputColumns', Array.from(e.target.selectedOptions, opt => opt.value))}
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white min-h-[80px]"
        >
          {(availableColumns || []).map((col) => (
            <option key={col.name} value={col.name}>{col.name} ({col.dataType})</option>
          ))}
        </select>
        <p className="text-[10px] text-gray-500 mt-1">Ctrl+click to select multiple columns</p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Output Column Name</label>
        <input
          type="text"
          value={config.outputColumn}
          onChange={(e) => updateConfig('outputColumn', e.target.value)}
          placeholder="pandas_result"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Return Type</label>
        <select
          value={config.returnType}
          onChange={(e) => updateConfig('returnType', e.target.value)}
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        >
          {sparkDataTypes.map((dt) => (
            <option key={dt.value} value={dt.value}>{dt.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Function Code *</label>
        <textarea
          value={config.functionCode}
          onChange={(e) => updateConfig('functionCode', e.target.value)}
          rows={15}
          className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white font-mono"
          spellCheck={false}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Description (Optional)</label>
        <input
          type="text"
          value={config.description}
          onChange={(e) => updateConfig('description', e.target.value)}
          placeholder="Brief description of what this UDF does"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        />
      </div>

      <div className="text-xs text-blue-400 bg-blue-500/10 px-3 py-2 rounded">
        <Zap className="w-3 h-3 inline mr-1" />
        Pandas UDFs use Apache Arrow for efficient data transfer - up to 100x faster than Python UDFs
      </div>

      <button
        onClick={handleSave}
        disabled={!config.functionName || !config.functionCode}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
      >
        <Save className="w-4 h-4" />
        Save Configuration
      </button>
    </div>
  );
};

// ============================================
// Pandas Grouped Map UDF Configuration
// ============================================
export const PandasGroupedUdfConfig = ({ data, onUpdate, availableColumns }: UdfConfigProps) => {
  const [config, setConfig] = useState({
    functionName: (data.config?.functionName as string) || 'grouped_udf',
    groupByColumns: (data.config?.groupByColumns as string[]) || [],
    outputSchema: (data.config?.outputSchema as Array<{name: string; type: string}>) || [
      { name: 'group_key', type: 'StringType()' },
      { name: 'result', type: 'DoubleType()' },
    ],
    functionCode: (data.config?.functionCode as string) || `def grouped_udf(pdf: pd.DataFrame) -> pd.DataFrame:
    """
    Pandas Grouped Map UDF - Apply function to each group.

    Args:
        pdf: pandas DataFrame containing one group's data

    Returns:
        pandas DataFrame with transformed data
    """
    # Example: Normalize values within each group
    group_key = pdf['category'].iloc[0]
    mean_val = pdf['value'].mean()
    std_val = pdf['value'].std()

    result_df = pd.DataFrame({
        'group_key': [group_key],
        'result': [mean_val]
    })

    return result_df`,
    description: (data.config?.description as string) || '',
  });

  const updateConfig = (key: string, value: unknown) => {
    setConfig({ ...config, [key]: value });
  };

  const addSchemaColumn = () => {
    updateConfig('outputSchema', [
      ...config.outputSchema,
      { name: '', type: 'StringType()' }
    ]);
  };

  const updateSchemaColumn = (index: number, field: string, value: string) => {
    const updated = [...config.outputSchema];
    updated[index] = { ...updated[index], [field]: value };
    updateConfig('outputSchema', updated);
  };

  const removeSchemaColumn = (index: number) => {
    updateConfig('outputSchema', config.outputSchema.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onUpdate(config);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-orange-400 bg-orange-500/10 px-3 py-2 rounded">
        <Code className="w-4 h-4" />
        <span>Grouped Map UDF - Apply function to each group</span>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Function Name *</label>
        <input
          type="text"
          value={config.functionName}
          onChange={(e) => updateConfig('functionName', e.target.value)}
          placeholder="grouped_udf"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white font-mono"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Group By Columns *</label>
        <select
          multiple
          value={config.groupByColumns}
          onChange={(e) => updateConfig('groupByColumns', Array.from(e.target.selectedOptions, opt => opt.value))}
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white min-h-[80px]"
        >
          {(availableColumns || []).map((col) => (
            <option key={col.name} value={col.name}>{col.name} ({col.dataType})</option>
          ))}
        </select>
        <p className="text-[10px] text-gray-500 mt-1">Columns to group data by before applying UDF</p>
      </div>

      {/* Output Schema */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Output Schema *</label>
        <div className="space-y-2">
          {config.outputSchema.map((col, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="text"
                value={col.name}
                onChange={(e) => updateSchemaColumn(idx, 'name', e.target.value)}
                placeholder="Column name"
                className="flex-1 px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white"
              />
              <select
                value={col.type}
                onChange={(e) => updateSchemaColumn(idx, 'type', e.target.value)}
                className="w-32 px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white"
              >
                {sparkDataTypes.map((dt) => (
                  <option key={dt.value} value={dt.value}>{dt.label}</option>
                ))}
              </select>
              <button
                onClick={() => removeSchemaColumn(idx)}
                className="p-1.5 text-red-400 hover:bg-red-500/10 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addSchemaColumn}
          className="mt-2 w-full flex items-center justify-center gap-1 px-3 py-1.5 border border-dashed border-gray-600 text-gray-400 hover:text-gray-200 rounded text-xs"
        >
          <Plus className="w-3 h-3" />
          Add Output Column
        </button>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Function Code *</label>
        <textarea
          value={config.functionCode}
          onChange={(e) => updateConfig('functionCode', e.target.value)}
          rows={18}
          className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white font-mono"
          spellCheck={false}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Description (Optional)</label>
        <input
          type="text"
          value={config.description}
          onChange={(e) => updateConfig('description', e.target.value)}
          placeholder="Brief description of what this UDF does"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        />
      </div>

      <div className="text-xs text-blue-400 bg-blue-500/10 px-3 py-2 rounded">
        <Zap className="w-3 h-3 inline mr-1" />
        Grouped Map UDFs receive entire groups as pandas DataFrames - ideal for group-level calculations
      </div>

      <button
        onClick={handleSave}
        disabled={!config.functionName || !config.functionCode || config.groupByColumns.length === 0}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
      >
        <Save className="w-4 h-4" />
        Save Configuration
      </button>
    </div>
  );
};
