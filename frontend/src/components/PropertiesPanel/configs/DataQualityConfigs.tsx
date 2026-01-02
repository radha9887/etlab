import { useState } from 'react';
import { Save, Plus, Trash2, CheckCircle, AlertTriangle, Shield, FileCheck } from 'lucide-react';
import type { TransformNodeData } from '../../../types';
import type { WithAvailableColumns } from '../shared';

interface DataQualityConfigProps extends Partial<WithAvailableColumns> {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

// ============================================
// Great Expectations Configuration
// ============================================
export const GreatExpectationsConfig = ({ data, onUpdate }: DataQualityConfigProps) => {
  const [config, setConfig] = useState({
    expectationSuiteName: (data.config?.expectationSuiteName as string) || 'my_suite',
    dataContextPath: (data.config?.dataContextPath as string) || '/path/to/great_expectations',
    checkpointName: (data.config?.checkpointName as string) || '',
    runValidation: (data.config?.runValidation as boolean) ?? true,
    buildDataDocs: (data.config?.buildDataDocs as boolean) ?? false,
    failOnError: (data.config?.failOnError as boolean) ?? true,
    expectations: (data.config?.expectations as Array<{
      type: string;
      column: string;
      kwargs: string;
    }>) || [
      { type: 'expect_column_to_exist', column: '', kwargs: '' },
    ],
  });

  const updateConfig = (key: string, value: unknown) => {
    setConfig({ ...config, [key]: value });
  };

  const expectationTypes = [
    // Column existence
    { value: 'expect_column_to_exist', label: 'Column Exists' },
    { value: 'expect_table_columns_to_match_ordered_list', label: 'Columns Match List' },
    // Null checks
    { value: 'expect_column_values_to_not_be_null', label: 'Not Null' },
    { value: 'expect_column_values_to_be_null', label: 'All Null' },
    // Uniqueness
    { value: 'expect_column_values_to_be_unique', label: 'Unique Values' },
    { value: 'expect_compound_columns_to_be_unique', label: 'Compound Unique' },
    // Type checks
    { value: 'expect_column_values_to_be_of_type', label: 'Data Type' },
    { value: 'expect_column_values_to_be_in_type_list', label: 'Type In List' },
    // Value ranges
    { value: 'expect_column_values_to_be_between', label: 'Between' },
    { value: 'expect_column_min_to_be_between', label: 'Min Between' },
    { value: 'expect_column_max_to_be_between', label: 'Max Between' },
    { value: 'expect_column_mean_to_be_between', label: 'Mean Between' },
    // Value sets
    { value: 'expect_column_values_to_be_in_set', label: 'In Set' },
    { value: 'expect_column_values_to_not_be_in_set', label: 'Not In Set' },
    // String patterns
    { value: 'expect_column_values_to_match_regex', label: 'Match Regex' },
    { value: 'expect_column_value_lengths_to_be_between', label: 'Length Between' },
    // Row counts
    { value: 'expect_table_row_count_to_be_between', label: 'Row Count Between' },
    { value: 'expect_table_row_count_to_equal', label: 'Row Count Equals' },
  ];

  const addExpectation = () => {
    updateConfig('expectations', [
      ...config.expectations,
      { type: 'expect_column_to_exist', column: '', kwargs: '' }
    ]);
  };

  const updateExpectation = (index: number, field: string, value: string) => {
    const updated = [...config.expectations];
    updated[index] = { ...updated[index], [field]: value };
    updateConfig('expectations', updated);
  };

  const removeExpectation = (index: number) => {
    updateConfig('expectations', config.expectations.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onUpdate(config);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-2 rounded">
        <CheckCircle className="w-4 h-4" />
        <span>Great Expectations - Data Validation</span>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Expectation Suite Name *</label>
        <input
          type="text"
          value={config.expectationSuiteName}
          onChange={(e) => updateConfig('expectationSuiteName', e.target.value)}
          placeholder="my_suite"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Data Context Path</label>
        <input
          type="text"
          value={config.dataContextPath}
          onChange={(e) => updateConfig('dataContextPath', e.target.value)}
          placeholder="/path/to/great_expectations"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Checkpoint Name (Optional)</label>
        <input
          type="text"
          value={config.checkpointName}
          onChange={(e) => updateConfig('checkpointName', e.target.value)}
          placeholder="my_checkpoint"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        />
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-xs text-gray-300">
          <input
            type="checkbox"
            checked={config.runValidation}
            onChange={(e) => updateConfig('runValidation', e.target.checked)}
            className="rounded"
          />
          Run Validation
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-300">
          <input
            type="checkbox"
            checked={config.buildDataDocs}
            onChange={(e) => updateConfig('buildDataDocs', e.target.checked)}
            className="rounded"
          />
          Build Data Docs
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-300">
          <input
            type="checkbox"
            checked={config.failOnError}
            onChange={(e) => updateConfig('failOnError', e.target.checked)}
            className="rounded"
          />
          Fail on Error
        </label>
      </div>

      {/* Expectations */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Expectations</label>
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {config.expectations.map((exp, idx) => (
            <div key={idx} className="flex gap-2 items-start bg-canvas p-2 rounded">
              <div className="flex-1 space-y-1">
                <select
                  value={exp.type}
                  onChange={(e) => updateExpectation(idx, 'type', e.target.value)}
                  className="w-full px-2 py-1 bg-panel border border-gray-600 rounded text-xs text-white"
                >
                  {expectationTypes.map((et) => (
                    <option key={et.value} value={et.value}>{et.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={exp.column}
                  onChange={(e) => updateExpectation(idx, 'column', e.target.value)}
                  placeholder="Column name"
                  className="w-full px-2 py-1 bg-panel border border-gray-600 rounded text-xs text-white"
                />
                <input
                  type="text"
                  value={exp.kwargs}
                  onChange={(e) => updateExpectation(idx, 'kwargs', e.target.value)}
                  placeholder='kwargs: {"min_value": 0, "max_value": 100}'
                  className="w-full px-2 py-1 bg-panel border border-gray-600 rounded text-xs text-white font-mono"
                />
              </div>
              <button
                onClick={() => removeExpectation(idx)}
                className="p-1.5 text-red-400 hover:bg-red-500/10 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addExpectation}
          className="mt-2 w-full flex items-center justify-center gap-1 px-3 py-1.5 border border-dashed border-gray-600 text-gray-400 hover:text-gray-200 rounded text-xs"
        >
          <Plus className="w-3 h-3" />
          Add Expectation
        </button>
      </div>

      <div className="text-xs text-yellow-500 bg-yellow-500/10 px-3 py-2 rounded">
        <AlertTriangle className="w-3 h-3 inline mr-1" />
        Requires great_expectations package installed
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
// Soda Core Configuration
// ============================================
export const SodaCoreConfig = ({ data, onUpdate }: DataQualityConfigProps) => {
  const [config, setConfig] = useState({
    checkName: (data.config?.checkName as string) || 'data_quality_check',
    dataSourceName: (data.config?.dataSourceName as string) || 'spark_df',
    configPath: (data.config?.configPath as string) || '',
    failOnError: (data.config?.failOnError as boolean) ?? true,
    checks: (data.config?.checks as Array<{
      type: string;
      column: string;
      condition: string;
    }>) || [
      { type: 'row_count', column: '', condition: '> 0' },
    ],
  });

  const updateConfig = (key: string, value: unknown) => {
    setConfig({ ...config, [key]: value });
  };

  const checkTypes = [
    { value: 'row_count', label: 'Row Count' },
    { value: 'missing_count', label: 'Missing Count' },
    { value: 'missing_percent', label: 'Missing Percent' },
    { value: 'duplicate_count', label: 'Duplicate Count' },
    { value: 'duplicate_percent', label: 'Duplicate Percent' },
    { value: 'min', label: 'Minimum Value' },
    { value: 'max', label: 'Maximum Value' },
    { value: 'avg', label: 'Average Value' },
    { value: 'sum', label: 'Sum' },
    { value: 'stddev', label: 'Standard Deviation' },
    { value: 'distinct_count', label: 'Distinct Count' },
    { value: 'values_in_set', label: 'Values In Set' },
    { value: 'invalid_count', label: 'Invalid Count' },
    { value: 'invalid_percent', label: 'Invalid Percent' },
    { value: 'freshness', label: 'Data Freshness' },
    { value: 'schema', label: 'Schema Check' },
  ];

  const addCheck = () => {
    updateConfig('checks', [
      ...config.checks,
      { type: 'row_count', column: '', condition: '> 0' }
    ]);
  };

  const updateCheck = (index: number, field: string, value: string) => {
    const updated = [...config.checks];
    updated[index] = { ...updated[index], [field]: value };
    updateConfig('checks', updated);
  };

  const removeCheck = (index: number) => {
    updateConfig('checks', config.checks.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onUpdate(config);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 px-3 py-2 rounded">
        <Shield className="w-4 h-4" />
        <span>Soda Core - Data Quality Checks</span>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Check Name *</label>
        <input
          type="text"
          value={config.checkName}
          onChange={(e) => updateConfig('checkName', e.target.value)}
          placeholder="data_quality_check"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Data Source Name</label>
        <input
          type="text"
          value={config.dataSourceName}
          onChange={(e) => updateConfig('dataSourceName', e.target.value)}
          placeholder="spark_df"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Config Path (Optional)</label>
        <input
          type="text"
          value={config.configPath}
          onChange={(e) => updateConfig('configPath', e.target.value)}
          placeholder="/path/to/soda/configuration.yml"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        />
      </div>

      <label className="flex items-center gap-2 text-xs text-gray-300">
        <input
          type="checkbox"
          checked={config.failOnError}
          onChange={(e) => updateConfig('failOnError', e.target.checked)}
          className="rounded"
        />
        Fail Pipeline on Check Failure
      </label>

      {/* Checks */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Quality Checks</label>
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {config.checks.map((check, idx) => (
            <div key={idx} className="flex gap-2 items-center bg-canvas p-2 rounded">
              <select
                value={check.type}
                onChange={(e) => updateCheck(idx, 'type', e.target.value)}
                className="w-28 px-2 py-1 bg-panel border border-gray-600 rounded text-xs text-white"
              >
                {checkTypes.map((ct) => (
                  <option key={ct.value} value={ct.value}>{ct.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={check.column}
                onChange={(e) => updateCheck(idx, 'column', e.target.value)}
                placeholder="Column"
                className="w-24 px-2 py-1 bg-panel border border-gray-600 rounded text-xs text-white"
              />
              <input
                type="text"
                value={check.condition}
                onChange={(e) => updateCheck(idx, 'condition', e.target.value)}
                placeholder="Condition: > 0"
                className="flex-1 px-2 py-1 bg-panel border border-gray-600 rounded text-xs text-white font-mono"
              />
              <button
                onClick={() => removeCheck(idx)}
                className="p-1.5 text-red-400 hover:bg-red-500/10 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addCheck}
          className="mt-2 w-full flex items-center justify-center gap-1 px-3 py-1.5 border border-dashed border-gray-600 text-gray-400 hover:text-gray-200 rounded text-xs"
        >
          <Plus className="w-3 h-3" />
          Add Check
        </button>
      </div>

      <div className="text-xs text-yellow-500 bg-yellow-500/10 px-3 py-2 rounded">
        <AlertTriangle className="w-3 h-3 inline mr-1" />
        Requires soda-core-spark package installed
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
// Data Assertions Configuration (Built-in)
// ============================================
export const DataAssertionsConfig = ({ data, onUpdate, availableColumns }: DataQualityConfigProps) => {
  const [config, setConfig] = useState({
    assertionName: (data.config?.assertionName as string) || 'data_assertions',
    failOnError: (data.config?.failOnError as boolean) ?? true,
    logResults: (data.config?.logResults as boolean) ?? true,
    assertions: (data.config?.assertions as Array<{
      type: string;
      column: string;
      value: string;
      message: string;
    }>) || [
      { type: 'not_null', column: '', value: '', message: '' },
    ],
  });

  const updateConfig = (key: string, value: unknown) => {
    setConfig({ ...config, [key]: value });
  };

  const assertionTypes = [
    { value: 'not_null', label: 'Not Null', needsValue: false },
    { value: 'unique', label: 'Unique Values', needsValue: false },
    { value: 'row_count_min', label: 'Min Row Count', needsValue: true },
    { value: 'row_count_max', label: 'Max Row Count', needsValue: true },
    { value: 'row_count_equals', label: 'Row Count Equals', needsValue: true },
    { value: 'min_value', label: 'Min Value >=', needsValue: true },
    { value: 'max_value', label: 'Max Value <=', needsValue: true },
    { value: 'in_set', label: 'Values In Set', needsValue: true },
    { value: 'not_in_set', label: 'Values Not In Set', needsValue: true },
    { value: 'regex_match', label: 'Regex Match', needsValue: true },
    { value: 'length_min', label: 'Min Length', needsValue: true },
    { value: 'length_max', label: 'Max Length', needsValue: true },
    { value: 'no_duplicates', label: 'No Duplicates', needsValue: false },
    { value: 'positive', label: 'All Positive', needsValue: false },
    { value: 'non_negative', label: 'All Non-Negative', needsValue: false },
  ];

  const addAssertion = () => {
    updateConfig('assertions', [
      ...config.assertions,
      { type: 'not_null', column: '', value: '', message: '' }
    ]);
  };

  const updateAssertion = (index: number, field: string, value: string) => {
    const updated = [...config.assertions];
    updated[index] = { ...updated[index], [field]: value };
    updateConfig('assertions', updated);
  };

  const removeAssertion = (index: number) => {
    updateConfig('assertions', config.assertions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onUpdate(config);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-purple-400 bg-purple-500/10 px-3 py-2 rounded">
        <FileCheck className="w-4 h-4" />
        <span>Data Assertions - Built-in Validation</span>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Assertion Set Name</label>
        <input
          type="text"
          value={config.assertionName}
          onChange={(e) => updateConfig('assertionName', e.target.value)}
          placeholder="data_assertions"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        />
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-xs text-gray-300">
          <input
            type="checkbox"
            checked={config.failOnError}
            onChange={(e) => updateConfig('failOnError', e.target.checked)}
            className="rounded"
          />
          Fail on Error
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-300">
          <input
            type="checkbox"
            checked={config.logResults}
            onChange={(e) => updateConfig('logResults', e.target.checked)}
            className="rounded"
          />
          Log Results
        </label>
      </div>

      {/* Assertions */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Assertions</label>
        <div className="space-y-2 max-h-[250px] overflow-y-auto">
          {config.assertions.map((assertion, idx) => (
            <div key={idx} className="bg-canvas p-2 rounded space-y-1">
              <div className="flex gap-2 items-center">
                <select
                  value={assertion.type}
                  onChange={(e) => updateAssertion(idx, 'type', e.target.value)}
                  className="w-36 px-2 py-1 bg-panel border border-gray-600 rounded text-xs text-white"
                >
                  {assertionTypes.map((at) => (
                    <option key={at.value} value={at.value}>{at.label}</option>
                  ))}
                </select>
                <select
                  value={assertion.column}
                  onChange={(e) => updateAssertion(idx, 'column', e.target.value)}
                  className="flex-1 px-2 py-1 bg-panel border border-gray-600 rounded text-xs text-white"
                >
                  <option value="">Select column...</option>
                  <option value="*">All columns</option>
                  {(availableColumns || []).map((col) => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => removeAssertion(idx)}
                  className="p-1.5 text-red-400 hover:bg-red-500/10 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              {assertionTypes.find(at => at.value === assertion.type)?.needsValue && (
                <input
                  type="text"
                  value={assertion.value}
                  onChange={(e) => updateAssertion(idx, 'value', e.target.value)}
                  placeholder="Value (e.g., 100, ['a','b'], ^[A-Z]+$)"
                  className="w-full px-2 py-1 bg-panel border border-gray-600 rounded text-xs text-white font-mono"
                />
              )}
              <input
                type="text"
                value={assertion.message}
                onChange={(e) => updateAssertion(idx, 'message', e.target.value)}
                placeholder="Custom error message (optional)"
                className="w-full px-2 py-1 bg-panel border border-gray-600 rounded text-xs text-white"
              />
            </div>
          ))}
        </div>
        <button
          onClick={addAssertion}
          className="mt-2 w-full flex items-center justify-center gap-1 px-3 py-1.5 border border-dashed border-gray-600 text-gray-400 hover:text-gray-200 rounded text-xs"
        >
          <Plus className="w-3 h-3" />
          Add Assertion
        </button>
      </div>

      <div className="text-xs text-green-400 bg-green-500/10 px-3 py-2 rounded">
        <CheckCircle className="w-3 h-3 inline mr-1" />
        No external dependencies required - uses native PySpark
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
// Schema Validation Configuration
// ============================================
export const SchemaValidationConfig = ({ data, onUpdate, availableColumns }: DataQualityConfigProps) => {
  const [config, setConfig] = useState({
    validationName: (data.config?.validationName as string) || 'schema_validation',
    failOnError: (data.config?.failOnError as boolean) ?? true,
    strictMode: (data.config?.strictMode as boolean) ?? false,
    expectedColumns: (data.config?.expectedColumns as Array<{
      name: string;
      dataType: string;
      nullable: boolean;
      required: boolean;
    }>) || [],
  });

  const updateConfig = (key: string, value: unknown) => {
    setConfig({ ...config, [key]: value });
  };

  const sparkDataTypes = [
    'string', 'integer', 'long', 'float', 'double', 'boolean',
    'timestamp', 'date', 'binary', 'decimal', 'array', 'map', 'struct'
  ];

  const addColumn = () => {
    updateConfig('expectedColumns', [
      ...config.expectedColumns,
      { name: '', dataType: 'string', nullable: true, required: true }
    ]);
  };

  const updateColumn = (index: number, field: string, value: string | boolean) => {
    const updated = [...config.expectedColumns];
    updated[index] = { ...updated[index], [field]: value };
    updateConfig('expectedColumns', updated);
  };

  const removeColumn = (index: number) => {
    updateConfig('expectedColumns', config.expectedColumns.filter((_, i) => i !== index));
  };

  const importFromAvailable = () => {
    if (availableColumns && availableColumns.length > 0) {
      const imported = availableColumns.map(col => ({
        name: col.name,
        dataType: col.dataType.toLowerCase(),
        nullable: true,
        required: true
      }));
      updateConfig('expectedColumns', imported);
    }
  };

  const handleSave = () => {
    onUpdate(config);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-orange-400 bg-orange-500/10 px-3 py-2 rounded">
        <Shield className="w-4 h-4" />
        <span>Schema Validation - Structure Check</span>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Validation Name</label>
        <input
          type="text"
          value={config.validationName}
          onChange={(e) => updateConfig('validationName', e.target.value)}
          placeholder="schema_validation"
          className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
        />
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-xs text-gray-300">
          <input
            type="checkbox"
            checked={config.failOnError}
            onChange={(e) => updateConfig('failOnError', e.target.checked)}
            className="rounded"
          />
          Fail on Error
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-300">
          <input
            type="checkbox"
            checked={config.strictMode}
            onChange={(e) => updateConfig('strictMode', e.target.checked)}
            className="rounded"
          />
          Strict Mode (no extra columns)
        </label>
      </div>

      {/* Expected Schema */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-400">Expected Schema</label>
          {availableColumns && availableColumns.length > 0 && (
            <button
              onClick={importFromAvailable}
              className="text-xs text-accent hover:text-accent-hover"
            >
              Import from input
            </button>
          )}
        </div>
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {config.expectedColumns.map((col, idx) => (
            <div key={idx} className="flex gap-2 items-center bg-canvas p-2 rounded">
              <input
                type="text"
                value={col.name}
                onChange={(e) => updateColumn(idx, 'name', e.target.value)}
                placeholder="Column name"
                className="flex-1 px-2 py-1 bg-panel border border-gray-600 rounded text-xs text-white"
              />
              <select
                value={col.dataType}
                onChange={(e) => updateColumn(idx, 'dataType', e.target.value)}
                className="w-24 px-2 py-1 bg-panel border border-gray-600 rounded text-xs text-white"
              >
                {sparkDataTypes.map((dt) => (
                  <option key={dt} value={dt}>{dt}</option>
                ))}
              </select>
              <label className="flex items-center gap-1 text-xs text-gray-400">
                <input
                  type="checkbox"
                  checked={col.nullable}
                  onChange={(e) => updateColumn(idx, 'nullable', e.target.checked)}
                  className="rounded"
                />
                Null
              </label>
              <label className="flex items-center gap-1 text-xs text-gray-400">
                <input
                  type="checkbox"
                  checked={col.required}
                  onChange={(e) => updateColumn(idx, 'required', e.target.checked)}
                  className="rounded"
                />
                Req
              </label>
              <button
                onClick={() => removeColumn(idx)}
                className="p-1 text-red-400 hover:bg-red-500/10 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addColumn}
          className="mt-2 w-full flex items-center justify-center gap-1 px-3 py-1.5 border border-dashed border-gray-600 text-gray-400 hover:text-gray-200 rounded text-xs"
        >
          <Plus className="w-3 h-3" />
          Add Column
        </button>
      </div>

      <div className="text-xs text-green-400 bg-green-500/10 px-3 py-2 rounded">
        <CheckCircle className="w-3 h-3 inline mr-1" />
        No external dependencies required - uses native PySpark
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
