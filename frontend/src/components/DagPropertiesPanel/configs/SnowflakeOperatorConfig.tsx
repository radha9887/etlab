import { ConnectionPicker, VariablePicker } from '../shared';

interface SnowflakeOperatorConfigProps {
  config: {
    taskId: string;
    snowflakeConnId?: string;
    sql?: string;
    warehouse?: string;
    database?: string;
    schema?: string;
    role?: string;
    parameters?: string;
    autocommit?: boolean;
  };
  onChange: (updates: Partial<SnowflakeOperatorConfigProps['config']>) => void;
  etlPages: any[];
}

export const SnowflakeOperatorConfig = ({ config, onChange }: SnowflakeOperatorConfigProps) => {

  return (
    <div className="space-y-3">
      {/* Snowflake Connection */}
      <ConnectionPicker
        value={config.snowflakeConnId || 'snowflake_default'}
        onChange={(value) => onChange({ snowflakeConnId: value })}
        connectionType="snowflake"
        label="Snowflake Connection ID"
        required
        helpText="Connection with Snowflake credentials. Create in Airflow Admin > Connections."
      />

      {/* SQL Query with VariablePicker */}
      <VariablePicker
        value={config.sql || ''}
        onChange={(value) => onChange({ sql: value })}
        label="SQL Query"
        placeholder="SELECT * FROM my_table WHERE date = '{{ ds }}'"
        multiline
        rows={5}
        helpText="Supports Jinja templates for dynamic values"
      />

      {/* Context Override */}
      <div className="border-t border-gray-700 pt-3">
        <h4 className="text-xs font-medium text-gray-300 mb-2">Context Override (Optional)</h4>

        <div className="grid grid-cols-2 gap-2 mb-2">
          {/* Warehouse */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Warehouse</label>
            <input
              type="text"
              value={config.warehouse || ''}
              onChange={(e) => onChange({ warehouse: e.target.value })}
              placeholder="COMPUTE_WH"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono"
            />
          </div>

          {/* Database */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Database</label>
            <input
              type="text"
              value={config.database || ''}
              onChange={(e) => onChange({ database: e.target.value })}
              placeholder="MY_DATABASE"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Schema */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Schema</label>
            <input
              type="text"
              value={config.schema || ''}
              onChange={(e) => onChange({ schema: e.target.value })}
              placeholder="PUBLIC"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Role</label>
            <input
              type="text"
              value={config.role || ''}
              onChange={(e) => onChange({ role: e.target.value })}
              placeholder="ACCOUNTADMIN"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* Parameters */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Parameters (JSON)</label>
        <input
          type="text"
          value={config.parameters || ''}
          onChange={(e) => onChange({ parameters: e.target.value })}
          placeholder='{"param1": "value1"}'
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      {/* Autocommit */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400">Autocommit</span>
          <p className="text-xs text-gray-500">Commit after each statement</p>
        </div>
        <button
          onClick={() => onChange({ autocommit: !config.autocommit })}
          className={`w-10 h-5 rounded-full transition-colors
                    ${config.autocommit ? 'bg-accent' : 'bg-gray-600'}`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transform transition-transform
                      ${config.autocommit ? 'translate-x-5' : 'translate-x-0.5'}`}
          />
        </button>
      </div>

      {/* Preview */}
      {config.snowflakeConnId && config.sql && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-md p-2">
          <p className="text-xs text-cyan-400">
            Executes on Snowflake via <strong>{config.snowflakeConnId}</strong>
            {config.warehouse && ` using ${config.warehouse}`}
          </p>
        </div>
      )}
    </div>
  );
};
