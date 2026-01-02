interface SqlExecuteConfigProps {
  config: {
    taskId: string;
    connId?: string;
    sql?: string;
    autocommit?: boolean;
    parameters?: string;
    handler?: 'fetch_all' | 'fetch_one' | 'none';
    splitStatements?: boolean;
    returnLast?: boolean;
  };
  onChange: (updates: Partial<SqlExecuteConfigProps['config']>) => void;
  etlPages: any[];
}

export const SqlExecuteConfig = ({ config, onChange }: SqlExecuteConfigProps) => {
  return (
    <div className="space-y-3">
      {/* Connection ID */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Connection ID *</label>
        <input
          type="text"
          value={config.connId || ''}
          onChange={(e) => onChange({ connId: e.target.value })}
          placeholder="postgres_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Database connection in Airflow
        </p>
      </div>

      {/* SQL Query */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">SQL Query *</label>
        <textarea
          value={config.sql || ''}
          onChange={(e) => onChange({ sql: e.target.value })}
          placeholder="INSERT INTO log_table (dag_id, status) VALUES ('{{ dag.dag_id }}', 'complete');"
          rows={6}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Supports Jinja templates. Use semicolons for multiple statements.
        </p>
      </div>

      {/* Parameters */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Parameters (JSON)</label>
        <input
          type="text"
          value={config.parameters || ''}
          onChange={(e) => onChange({ parameters: e.target.value })}
          placeholder='{"status": "active", "limit": 100}'
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          Query parameters for parameterized SQL
        </p>
      </div>

      {/* Result Handler */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Result Handler</label>
        <div className="flex gap-1">
          <button
            onClick={() => onChange({ handler: 'none' })}
            className={`flex-1 px-2 py-2 text-xs rounded-md transition-colors
                      ${config.handler === 'none' || !config.handler
                        ? 'bg-accent text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            None
          </button>
          <button
            onClick={() => onChange({ handler: 'fetch_one' })}
            className={`flex-1 px-2 py-2 text-xs rounded-md transition-colors
                      ${config.handler === 'fetch_one'
                        ? 'bg-accent text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Fetch One
          </button>
          <button
            onClick={() => onChange({ handler: 'fetch_all' })}
            className={`flex-1 px-2 py-2 text-xs rounded-md transition-colors
                      ${config.handler === 'fetch_all'
                        ? 'bg-accent text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Fetch All
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          How to handle SELECT results (pushed to XCom)
        </p>
      </div>

      {/* Options */}
      <div className="border-t border-gray-700 pt-3 space-y-2">
        <h4 className="text-xs font-medium text-gray-300 mb-2">Options</h4>

        {/* Autocommit */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Autocommit</span>
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

        {/* Split Statements */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400">Split Statements</span>
            <p className="text-xs text-gray-500">Execute each statement separately</p>
          </div>
          <button
            onClick={() => onChange({ splitStatements: !config.splitStatements })}
            className={`w-10 h-5 rounded-full transition-colors
                      ${config.splitStatements !== false ? 'bg-accent' : 'bg-gray-600'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transform transition-transform
                        ${config.splitStatements !== false ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>

        {/* Return Last */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400">Return Last Only</span>
            <p className="text-xs text-gray-500">Only return last statement result</p>
          </div>
          <button
            onClick={() => onChange({ returnLast: !config.returnLast })}
            className={`w-10 h-5 rounded-full transition-colors
                      ${config.returnLast !== false ? 'bg-accent' : 'bg-gray-600'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transform transition-transform
                        ${config.returnLast !== false ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>
      </div>

      {/* Preview */}
      {config.connId && config.sql && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-md p-2">
          <p className="text-xs text-cyan-400">
            Executes SQL on <strong>{config.connId}</strong>
          </p>
        </div>
      )}
    </div>
  );
};
